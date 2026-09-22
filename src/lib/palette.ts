import { clamp, createId, hexToHsl, hslToHex, mixHex, randomBetween, wrapHue } from "./color";
import type { ColorPoint, ColorStop, GradientType, Palette, PaletteKey } from "./types";

export const DEFAULT_POINTS = {
  deep: { x: 22, y: 18 },
  glow: { x: 46, y: 48 },
  wash: { x: 78, y: 82 },
} as const;

export function colorPoint(color: string, x: number, y: number): ColorPoint {
  return {
    color,
    x: clamp(x, 4, 96),
    y: clamp(y, 4, 96),
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

export function paletteToStops(palette: Palette, type: GradientType = "linear"): ColorStop[] {
  if (type === "radial") {
    const inner = mixHex(palette.wash.color, palette.glow.color, 0.42);
    const outer = mixHex(palette.glow.color, palette.deep.color, 0.4);
    return [
      { id: createId(), color: palette.wash.color, position: 0 },
      { id: createId(), color: inner, position: 26 },
      { id: createId(), color: palette.glow.color, position: 46 },
      { id: createId(), color: outer, position: 72 },
      { id: createId(), color: palette.deep.color, position: 100 },
    ];
  }

  const mid = mixHex(palette.glow.color, palette.wash.color, 0.55);
  const lift = mixHex(palette.deep.color, palette.glow.color, 0.5);
  return [
    { id: createId(), color: palette.deep.color, position: 0 },
    { id: createId(), color: lift, position: 22 },
    { id: createId(), color: palette.glow.color, position: 44 },
    { id: createId(), color: mid, position: 72 },
    { id: createId(), color: palette.wash.color, position: 100 },
  ];
}

export function generatePalette(baseHue?: number, keep?: Palette): Palette {
  const hue = baseHue ?? randomBetween(0, 360);
  const deepHue = wrapHue(hue + randomBetween(-8, 16));
  const glowHue = wrapHue(hue + randomBetween(18, 52) * (Math.random() > 0.5 ? 1 : -1));

  const colors = {
    deep: hslToHex({
      h: deepHue,
      s: randomBetween(42, 74),
      l: randomBetween(24, 40),
    }),
    glow: hslToHex({
      h: glowHue,
      s: randomBetween(48, 76),
      l: randomBetween(44, 60),
    }),
    wash: hslToHex({
      h: hue,
      s: randomBetween(2, 9),
      l: randomBetween(95, 98),
    }),
  };

  const points = keep
    ? {
        deep: { x: keep.deep.x, y: keep.deep.y },
        glow: { x: keep.glow.x, y: keep.glow.y },
        wash: { x: keep.wash.x, y: keep.wash.y },
      }
    : {
        deep: {
          x: DEFAULT_POINTS.deep.x + randomBetween(-8, 8),
          y: DEFAULT_POINTS.deep.y + randomBetween(-8, 8),
        },
        glow: {
          x: DEFAULT_POINTS.glow.x + randomBetween(-10, 10),
          y: DEFAULT_POINTS.glow.y + randomBetween(-10, 10),
        },
        wash: {
          x: DEFAULT_POINTS.wash.x + randomBetween(-8, 8),
          y: DEFAULT_POINTS.wash.y + randomBetween(-8, 8),
        },
      };

  return {
    deep: colorPoint(colors.deep, points.deep.x, points.deep.y),
    glow: colorPoint(colors.glow, points.glow.x, points.glow.y),
    wash: colorPoint(colors.wash, points.wash.x, points.wash.y),
  };
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
