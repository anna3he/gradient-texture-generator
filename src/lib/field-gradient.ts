import { clamp, hexToRgb, lerp, mixHslHex, type RGB } from "./color";
import { colorPoint } from "./palette";
import type { ColorPoint, GeneratorState, Palette } from "./types";

export type FieldSample = {
  t: number;
  x: number;
  y: number;
  rgb: RGB;
  weight: number;
};

const CURVE_SAMPLES = 12;

export function quadraticPoint(a: ColorPoint, b: ColorPoint, c: ColorPoint, t: number) {
  const mt = 1 - t;
  return {
    x: (mt * mt * a.x + 2 * mt * t * b.x + t * t * c.x) / 100,
    y: (mt * mt * a.y + 2 * mt * t * b.y + t * t * c.y) / 100,
  };
}

export function shiftedPalette(state: GeneratorState): Palette {
  const dx = state.motion.originX - 50;
  const dy = state.motion.originY - 50;
  if (dx === 0 && dy === 0) return state.palette;
  return {
    deep: colorPoint(state.palette.deep.color, state.palette.deep.x + dx, state.palette.deep.y + dy),
    glow: colorPoint(state.palette.glow.color, state.palette.glow.x + dx, state.palette.glow.y + dy),
    wash: colorPoint(state.palette.wash.color, state.palette.wash.x + dx, state.palette.wash.y + dy),
  };
}

function toRgb(hex: string, fallback: RGB): RGB {
  return hexToRgb(hex) ?? fallback;
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
  };
}

function colorAlongCurve(t: number, deep: RGB, glow: RGB, wash: RGB): RGB {
  if (t < 0.3) return mixRgb(deep, glow, t / 0.3);
  if (t < 0.48) return mixRgb(glow, mixRgb(glow, wash, 0.4), (t - 0.3) / 0.18);
  return mixRgb(mixRgb(glow, wash, 0.4), wash, (t - 0.48) / 0.52);
}

export function buildCurve(palette: Palette): FieldSample[] {
  const deep = toRgb(palette.deep.color, { r: 30, g: 40, b: 120 });
  const glow = toRgb(palette.glow.color, { r: 80, g: 180, b: 160 });
  const wash = toRgb(palette.wash.color, { r: 245, g: 248, b: 250 });
  const samples: FieldSample[] = [];

  for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
    const t = i / CURVE_SAMPLES;
    const point = quadraticPoint(palette.deep, palette.glow, palette.wash, t);
    samples.push({
      t,
      x: point.x,
      y: point.y,
      rgb: colorAlongCurve(t, deep, glow, wash),
      weight: t > 0.55 ? 1.75 : t > 0.4 ? 1.2 : 1,
    });
  }

  return samples;
}

export function sampleArc(u: number, v: number, samples: FieldSample[], wash: RGB): RGB {
  let wr = 0;
  let wg = 0;
  let wb = 0;
  let wsum = 0;
  let nearestGlow = 1;

  for (const sample of samples) {
    const dx = u - sample.x;
    const dy = v - sample.y;
    const dist2 = dx * dx + dy * dy;
    const weight = (sample.weight * 1) / (dist2 + 0.026);
    wr += sample.rgb.r * weight;
    wg += sample.rgb.g * weight;
    wb += sample.rgb.b * weight;
    wsum += weight;
    if (sample.t > 0.22 && sample.t < 0.5) {
      nearestGlow = Math.min(nearestGlow, Math.sqrt(dist2));
    }
  }

  const blended = {
    r: wr / wsum,
    g: wg / wsum,
    b: wb / wsum,
  };
  const washMix = clamp(0.12 + Math.max(0, nearestGlow - 0.14) * 0.7, 0.12, 0.46);
  return mixRgb(blended, wash, washMix);
}

export function fieldScale(width: number, height: number, quality: "preview" | "export") {
  const long = Math.max(width, height);
  const target = quality === "export" ? 1600 : 720;
  return Math.min(1, target / long);
}

export function fillArcField(
  ctx: CanvasRenderingContext2D,
  state: GeneratorState,
  width: number,
  height: number,
  quality: "preview" | "export" = "preview"
) {
  const scale = fieldScale(width, height, quality);
  const fw = Math.max(12, Math.round(width * scale));
  const fh = Math.max(12, Math.round(height * scale));
  const image = ctx.createImageData(fw, fh);
  const data = image.data;
  const palette = shiftedPalette(state);
  const samples = buildCurve(palette);
  const wash = toRgb(palette.wash.color, { r: 245, g: 248, b: 250 });

  for (let y = 0; y < fh; y += 1) {
    const v = (y + 0.5) / fh;
    for (let x = 0; x < fw; x += 1) {
      const rgb = sampleArc((x + 0.5) / fw, v, samples, wash);
      const index = (y * fw + x) * 4;
      data[index] = rgb.r;
      data[index + 1] = rgb.g;
      data[index + 2] = rgb.b;
      data[index + 3] = 255;
    }
  }

  if (fw === width && fh === height) {
    ctx.putImageData(image, 0, 0);
    return;
  }

  const scratch = document.createElement("canvas");
  scratch.width = fw;
  scratch.height = fh;
  const scratchCtx = scratch.getContext("2d");
  if (!scratchCtx) {
    ctx.putImageData(image, 0, 0);
    return;
  }
  scratchCtx.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(scratch, 0, 0, width, height);
}

export function arcCssLayers(palette: Palette) {
  const midDeep = mixHslHex(palette.deep.color, palette.glow.color, 0.5);
  const midWash = mixHslHex(palette.glow.color, palette.wash.color, 0.45);
  return [
    `radial-gradient(circle at ${palette.wash.x}% ${palette.wash.y}%, ${palette.wash.color} 0%, ${midWash} 42%, transparent 74%)`,
    `radial-gradient(circle at ${palette.glow.x}% ${palette.glow.y}%, ${palette.glow.color} 0%, ${midWash} 30%, transparent 54%)`,
    `radial-gradient(circle at ${palette.deep.x}% ${palette.deep.y}%, ${palette.deep.color} 0%, ${midDeep} 24%, transparent 48%)`,
  ].join(", ");
}
