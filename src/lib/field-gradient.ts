import { clamp, hexToRgb, lerp, type RGB } from "./color";
import { paletteToStops, sortStops } from "./palette";
import type { ColorPoint, ColorStop, GeneratorState, Palette } from "./types";

export type FieldSample = {
  t: number;
  x: number;
  y: number;
};

type FieldContext = {
  state: GeneratorState;
  stops: ColorStop[];
  colors: RGB[];
  samples: FieldSample[];
  wash: RGB;
  glow: RGB;
  deep: RGB;
  amount: number;
  phase: number;
};

const CURVE_SAMPLES = 36;

export function warpUV(u: number, v: number, phase: number, amount: number) {
  if (amount <= 0) return { u, v };

  const p = phase * Math.PI * 2;
  const u1 = u + Math.sin(v * Math.PI * 2.55 + p) * amount;
  const v1 = v + Math.sin(u * Math.PI * 2.05 + p * 0.82) * amount * 0.88;
  const u2 = u1 + Math.sin(v1 * Math.PI * 5.1 - p * 1.35) * amount * 0.42;
  const v2 = v1 + Math.cos(u1 * Math.PI * 4.35 + p * 1.08) * amount * 0.36;
  return { u: u2, v: v2 };
}

export function fieldWarp(state: GeneratorState) {
  const playing = state.motion.playing;
  const amount =
    (state.gradientType === "arc" ? 0.036 : 0) +
    (playing ? 0.05 + state.motion.speed * 0.058 : 0);
  const phase = playing ? (state.motion.phase ?? 0.38) : 0.16;
  return { amount, phase };
}

export function quadraticPoint(a: ColorPoint, b: ColorPoint, c: ColorPoint, t: number) {
  const mt = 1 - t;
  return {
    x: (mt * mt * a.x + 2 * mt * t * b.x + t * t * c.x) / 100,
    y: (mt * mt * a.y + 2 * mt * t * b.y + t * t * c.y) / 100,
  };
}

export function buildCurve(palette: Palette): FieldSample[] {
  const samples: FieldSample[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
    const t = i / CURVE_SAMPLES;
    const point = quadraticPoint(palette.deep, palette.glow, palette.wash, t);
    samples.push({ t, x: point.x, y: point.y });
  }
  return samples;
}

export function closestCurveT(samples: FieldSample[], u: number, v: number) {
  let bestT = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const sample of samples) {
    const dx = u - sample.x;
    const dy = v - sample.y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      bestT = sample.t;
    }
  }
  return { t: bestT, dist: Math.sqrt(bestDist) };
}

export function lerpStops(stops: ColorStop[], colors: RGB[], t: number): RGB {
  const position = clamp(t, 0, 1) * 100;
  if (stops.length === 0 || colors.length === 0) {
    return { r: 255, g: 255, b: 255 };
  }
  if (position <= (stops[0]?.position ?? 0)) return colors[0] ?? { r: 255, g: 255, b: 255 };
  const last = colors.at(-1);
  if (position >= (stops.at(-1)?.position ?? 100) && last) return last;

  for (let i = 1; i < stops.length; i += 1) {
    const prev = stops[i - 1];
    const next = stops[i];
    const prevColor = colors[i - 1];
    const nextColor = colors[i];
    if (!prev || !next || !prevColor || !nextColor) continue;
    if (position <= next.position) {
      const span = Math.max(0.001, next.position - prev.position);
      const local = (position - prev.position) / span;
      return {
        r: lerp(prevColor.r, nextColor.r, local),
        g: lerp(prevColor.g, nextColor.g, local),
        b: lerp(prevColor.b, nextColor.b, local),
      };
    }
  }

  return last ?? { r: 255, g: 255, b: 255 };
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  const amount = clamp(t, 0, 1);
  return {
    r: lerp(a.r, b.r, amount),
    g: lerp(a.g, b.g, amount),
    b: lerp(a.b, b.b, amount),
  };
}

function gauss(dist: number, sigma: number) {
  return Math.exp(-(dist * dist) / (2 * sigma * sigma));
}

export function createFieldContext(state: GeneratorState): FieldContext {
  const stops = sortStops(paletteToStops(state.palette));
  const colors = stops.map((stop) => hexToRgb(stop.color) ?? { r: 245, g: 248, b: 250 });
  const { amount, phase } = fieldWarp(state);
  return {
    state,
    stops,
    colors,
    samples: buildCurve(state.palette),
    wash: hexToRgb(state.palette.wash.color) ?? { r: 245, g: 248, b: 250 },
    glow: hexToRgb(state.palette.glow.color) ?? { r: 80, g: 220, b: 200 },
    deep: hexToRgb(state.palette.deep.color) ?? { r: 30, g: 40, b: 120 },
    amount,
    phase,
  };
}

export function sampleField(u: number, v: number, context: FieldContext): RGB {
  const warped = warpUV(u, v, context.phase, context.amount);
  const { state, stops, colors } = context;

  if (state.gradientType === "linear") {
    const theta = ((state.angle - 90) * Math.PI) / 180;
    const t = (warped.u - 0.5) * Math.cos(theta) + (warped.v - 0.5) * Math.sin(theta) + 0.5;
    return lerpStops(stops, colors, t);
  }

  if (state.gradientType === "radial") {
    const ox = clamp(state.motion.originX, 0, 100) / 100;
    const oy = clamp(state.motion.originY, 0, 100) / 100;
    const t = Math.hypot(warped.u - ox, warped.v - oy) / 0.92;
    return lerpStops(stops, colors, t);
  }

  return sampleArc(warped.u, warped.v, context);
}

function sampleArc(u: number, v: number, context: FieldContext): RGB {
  const { wash, glow, deep, samples, stops, colors, state } = context;
  const nearest = closestCurveT(samples, u, v);
  const ribbon = lerpStops(stops, colors, nearest.t);
  const glowDist = Math.hypot(u - state.palette.glow.x / 100, v - state.palette.glow.y / 100);
  const deepDist = Math.hypot(u - state.palette.deep.x / 100, v - state.palette.deep.y / 100);

  let rgb = wash;
  rgb = mixRgb(rgb, ribbon, gauss(nearest.dist, 0.17) * 0.94);
  rgb = mixRgb(rgb, glow, gauss(glowDist, 0.145) * 0.9);
  rgb = mixRgb(rgb, deep, gauss(deepDist, 0.09) * 0.72);
  return rgb;
}

export function fieldScale(width: number, height: number, quality: "preview" | "export") {
  const long = Math.max(width, height);
  const target = quality === "export" ? 1440 : 620;
  return Math.min(1, target / long);
}

export function fillField(
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
  const context = createFieldContext(state);

  for (let y = 0; y < fh; y += 1) {
    const v = (y + 0.5) / fh;
    for (let x = 0; x < fw; x += 1) {
      const rgb = sampleField((x + 0.5) / fw, v, context);
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
