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

export function deriveFamily(glow: string) {
  const hsl = hexToHsl(glow);
  if (!hsl) {
    return { deep: glow, glow, wash: "#f7f8f8" };
  }

  return {
    glow: hslToHex({
      h: hsl.h,
      s: clamp(Math.max(hsl.s, 62) + 10, 70, 96),
      l: clamp(Math.max(hsl.l, 54) + 8, 58, 70),
    }),
    deep: hslToHex({
      h: wrapHue(hsl.h - 4),
      s: clamp(hsl.s * 0.72 + 14, 48, 78),
      l: clamp(hsl.l * 0.36, 16, 28),
    }),
    wash: hslToHex({
      h: hsl.h,
      s: clamp(hsl.s * 0.06 + 3, 4, 11),
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

export function paletteToStops(palette: Palette, type: GradientType = "linear"): ColorStop[] {
  if (type === "radial") {
    const inner = mixHslHex(palette.wash.color, palette.glow.color, 0.38);
    const outer = mixHslHex(palette.glow.color, palette.deep.color, 0.42);
    return [
      { id: createId(), color: palette.wash.color, position: 0 },
      { id: createId(), color: palette.wash.color, position: 16 },
      { id: createId(), color: inner, position: 34 },
      { id: createId(), color: palette.glow.color, position: 52 },
      { id: createId(), color: outer, position: 76 },
      { id: createId(), color: palette.deep.color, position: 100 },
    ];
  }

  const lift = mixHslHex(palette.deep.color, palette.glow.color, 0.55);
  const fade = mixHslHex(palette.glow.color, palette.wash.color, 0.48);
  return [
    { id: createId(), color: palette.deep.color, position: 0 },
    { id: createId(), color: lift, position: 18 },
    { id: createId(), color: palette.glow.color, position: 36 },
    { id: createId(), color: fade, position: 52 },
    { id: createId(), color: palette.wash.color, position: 64 },
    { id: createId(), color: palette.wash.color, position: 100 },
  ];
}

export function generatePalette(baseHue?: number, keep?: Palette): Palette {
  const hue = baseHue ?? randomBetween(0, 360);
  const glow = hslToHex({
    h: hue,
    s: randomBetween(72, 94),
    l: randomBetween(58, 68),
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
