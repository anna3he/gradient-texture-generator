import { hexToRgb, lerp, mixHex, type RGB } from "./color";
import { colorPoint } from "./palette";
import type { ColorPoint, GeneratorState, Palette } from "./types";

export type FieldSample = {
  t: number;
  x: number;
  y: number;
  rgb: RGB;
};

const CURVE_SAMPLES = 10;

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

export function buildCurve(palette: Palette): FieldSample[] {
  const deep = toRgb(palette.deep.color, { r: 30, g: 40, b: 120 });
  const glow = toRgb(palette.glow.color, { r: 80, g: 180, b: 160 });
  const wash = toRgb(palette.wash.color, { r: 245, g: 248, b: 250 });
  const samples: FieldSample[] = [];

  for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
    const t = i / CURVE_SAMPLES;
    const point = quadraticPoint(palette.deep, palette.glow, palette.wash, t);
    const rgb =
      t < 0.5
        ? mixRgb(deep, glow, t / 0.5)
        : mixRgb(glow, wash, (t - 0.5) / 0.5);
    samples.push({ t, x: point.x, y: point.y, rgb });
  }

  return samples;
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
  };
}

export function sampleArc(u: number, v: number, samples: FieldSample[]): RGB {
  let wr = 0;
  let wg = 0;
  let wb = 0;
  let wsum = 0;

  for (const sample of samples) {
    const dx = u - sample.x;
    const dy = v - sample.y;
    const weight = 1 / (dx * dx + dy * dy + 0.018);
    wr += sample.rgb.r * weight;
    wg += sample.rgb.g * weight;
    wb += sample.rgb.b * weight;
    wsum += weight;
  }

  return {
    r: wr / wsum,
    g: wg / wsum,
    b: wb / wsum,
  };
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
  const samples = buildCurve(shiftedPalette(state));

  for (let y = 0; y < fh; y += 1) {
    const v = (y + 0.5) / fh;
    for (let x = 0; x < fw; x += 1) {
      const rgb = sampleArc((x + 0.5) / fw, v, samples);
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
  const midDeep = mixHex(palette.deep.color, palette.glow.color, 0.5);
  const midWash = mixHex(palette.glow.color, palette.wash.color, 0.5);
  return [
    `radial-gradient(circle at ${palette.glow.x}% ${palette.glow.y}%, ${palette.glow.color} 0%, ${midWash} 32%, transparent 58%)`,
    `radial-gradient(circle at ${palette.deep.x}% ${palette.deep.y}%, ${palette.deep.color} 0%, ${midDeep} 28%, transparent 52%)`,
    `radial-gradient(circle at ${palette.wash.x}% ${palette.wash.y}%, ${palette.wash.color} 0%, ${midWash} 38%, transparent 70%)`,
  ].join(", ");
}
