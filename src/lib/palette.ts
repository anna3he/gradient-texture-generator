import { clamp, createId, hexToHsl, hslToHex, mixHslHex, randomBetween, wrapHue } from "./color";
import type { ColorPoint, ColorStop, GradientType, Palette, PaletteKey } from "./types";

export const DEFAULT_POINTS = {
  deep: { x: 18, y: 16 },
  glow: { x: 38, y: 42 },
  wash: { x: 76, y: 74 },
} as const;

export function colorPoint(color: string, x: number, y: number): ColorPoint {
  return {
    color,
    x: clamp(x, 4, 96),
    y: clamp(y, 4, 96),
  };
}

function companionHue(hue: number) {
  if (hue >= 150 && hue <= 200) return wrapHue(hue + 52);
  if (hue >= 20 && hue <= 55) return wrapHue(hue - 16);
  if (hue >= 300 || hue < 20) return wrapHue(hue - 28);
  if (hue >= 80 && hue < 150) return wrapHue(hue + 18);
  return wrapHue(hue + 36);
}

export function deriveFamily(glow: string) {
  const hsl = hexToHsl(glow);
  if (!hsl) {
    return { deep: glow, glow, wash: "#f7f8f8" };
  }

  return {
    glow: hslToHex({
      h: hsl.h,
      s: clamp(Math.max(hsl.s, 58) + 8, 68, 94),
      l: clamp(Math.max(hsl.l, 50) + 6, 54, 68),
    }),
    deep: hslToHex({
      h: companionHue(hsl.h),
      s: clamp(Math.max(hsl.s, 52) + 4, 58, 84),
      l: clamp(20 + (hsl.l > 62 ? 2 : 0), 16, 28),
    }),
    wash: hslToHex({
      h: hsl.h,
      s: clamp(hsl.s * 0.05 + 3, 3, 10),
      l: 97,
    }),
  };
}

export function paletteFromColors(
  colors: { deep: string; glow: string; wash: string },
  points: Record<PaletteKey, { x: number; y: number }> = DEFAULT_POINTS
): Palette {
  return {
    deep: colorPoint(colors.deep, points.deep.x, points.deep.y),
    glow: colorPoint(colors.glow, points.glow.x, points.glow.y),
    wash: colorPoint(colors.wash, points.wash.x, points.wash.y),
  };
}

export function paletteFromGlow(
  glow: string,
  points: Record<PaletteKey, { x: number; y: number }> = DEFAULT_POINTS
): Palette {
  return paletteFromColors(deriveFamily(glow), points);
}

function wobble(phase: number | undefined, amplitude: number, offset: number) {
  if (!phase) return 0;
  return Math.sin(phase * 1.15 + offset) * amplitude;
}

export function paletteToStops(
  palette: Palette,
  type: GradientType = "linear",
  phase?: number
): ColorStop[] {
  if (type === "radial") {
    const inner = mixHslHex(palette.wash.color, palette.glow.color, 0.38);
    const outer = mixHslHex(palette.glow.color, palette.deep.color, 0.42);
    return [
      { id: createId(), color: palette.wash.color, position: 0 },
      { id: createId(), color: palette.wash.color, position: 16 + wobble(phase, 2.2, 0.4) },
      { id: createId(), color: inner, position: 34 + wobble(phase, 3.4, 1.1) },
      { id: createId(), color: palette.glow.color, position: 52 + wobble(phase, 3.8, 0.2) },
      { id: createId(), color: outer, position: 76 + wobble(phase, 2.6, 2.2) },
      { id: createId(), color: palette.deep.color, position: 100 },
    ];
  }

  const lift = mixHslHex(palette.deep.color, palette.glow.color, 0.55);
  const fade = mixHslHex(palette.glow.color, palette.wash.color, 0.48);
  return [
    { id: createId(), color: palette.deep.color, position: 0 },
    { id: createId(), color: lift, position: clamp(18 + wobble(phase, 3.2, 0.6), 10, 28) },
    { id: createId(), color: palette.glow.color, position: clamp(36 + wobble(phase, 4.2, 1.4), 26, 46) },
    { id: createId(), color: fade, position: clamp(52 + wobble(phase, 3.6, 2.1), 44, 60) },
    { id: createId(), color: palette.wash.color, position: clamp(64 + wobble(phase, 2.4, 0.3), 58, 72) },
    { id: createId(), color: palette.wash.color, position: 100 },
  ];
}

export function hueDistance(a: number, b: number) {
  const delta = Math.abs(wrapHue(a - b));
  return Math.min(delta, 360 - delta);
}

export function nextShuffleHue(currentHue?: number) {
  if (currentHue == null) return randomBetween(0, 360);

  const direction = Math.random() < 0.5 ? -1 : 1;
  const jump = randomBetween(64, 168);
  return wrapHue(currentHue + direction * jump);
}

export function generatePalette(baseHue?: number, keep?: Palette): Palette {
  const hue = baseHue ?? randomBetween(0, 360);
  const glow = hslToHex({
    h: hue,
    s: randomBetween(70, 92),
    l: randomBetween(54, 66),
  });

  const points = keep
    ? {
        deep: { x: keep.deep.x, y: keep.deep.y },
        glow: { x: keep.glow.x, y: keep.glow.y },
        wash: { x: keep.wash.x, y: keep.wash.y },
      }
    : {
        deep: {
          x: DEFAULT_POINTS.deep.x + randomBetween(-6, 6),
          y: DEFAULT_POINTS.deep.y + randomBetween(-6, 6),
        },
        glow: {
          x: DEFAULT_POINTS.glow.x + randomBetween(-8, 8),
          y: DEFAULT_POINTS.glow.y + randomBetween(-8, 8),
        },
        wash: {
          x: DEFAULT_POINTS.wash.x + randomBetween(-6, 6),
          y: DEFAULT_POINTS.wash.y + randomBetween(-6, 6),
        },
      };

  return paletteFromGlow(glow, points);
}

export function shufflePalette(keep: Palette): Palette {
  const currentHue = hexToHsl(keep.glow.color)?.h;
  return generatePalette(nextShuffleHue(currentHue), keep);
}

export function sortStops(stops: ColorStop[]) {
  return [...stops].sort((a, b) => a.position - b.position);
}

export function washLightness(palette: Palette) {
  return hexToHsl(palette.wash.color)?.l ?? 0;
}

export function relatedHues(palette: Palette) {
  const deep = hexToHsl(palette.deep.color);
  const glow = hexToHsl(palette.glow.color);
  if (!deep || !glow) return 0;
  const delta = Math.abs(wrapHue(deep.h - glow.h));
  return Math.min(delta, 360 - delta);
}

export function setPaletteColor(palette: Palette, key: PaletteKey, color: string): Palette {
  return {
    ...palette,
    [key]: { ...palette[key], color },
  };
}

export function setPalettePoint(
  palette: Palette,
  key: PaletteKey,
  x: number,
  y: number
): Palette {
  return {
    ...palette,
    [key]: colorPoint(palette[key].color, x, y),
  };
}
