import { createId, hslToHex, hexToHsl, mixHex, randomBetween, wrapHue } from "./color";
import type { ColorStop, Palette } from "./types";

export function paletteToStops(palette: Palette): ColorStop[] {
  const mid = mixHex(palette.glow, palette.wash, 0.55);
  return [
    { id: createId(), color: palette.deep, position: 0 },
    { id: createId(), color: palette.glow, position: 44 },
    { id: createId(), color: mid, position: 72 },
    { id: createId(), color: palette.wash, position: 100 },
  ];
}

export function generatePalette(baseHue?: number): Palette {
  const hue = baseHue ?? randomBetween(0, 360);
  const deepHue = wrapHue(hue + randomBetween(-8, 16));
  const glowHue = wrapHue(hue + randomBetween(18, 52) * (Math.random() > 0.5 ? 1 : -1));

  return {
    deep: hslToHex({
      h: deepHue,
      s: randomBetween(42, 74),
      l: randomBetween(24, 40),
    }),
    glow: hslToHex({
      h: glowHue,
      s: randomBetween(38, 68),
      l: randomBetween(40, 58),
    }),
    wash: hslToHex({
      h: hue,
      s: randomBetween(2, 9),
      l: randomBetween(95, 98),
    }),
  };
}

export function sortStops(stops: ColorStop[]) {
  return [...stops].sort((a, b) => a.position - b.position);
}

export function washLightness(palette: Palette) {
  return hexToHsl(palette.wash)?.l ?? 0;
}

export function relatedHues(palette: Palette) {
  const deep = hexToHsl(palette.deep);
  const glow = hexToHsl(palette.glow);
  if (!deep || !glow) return 0;
  const delta = Math.abs(wrapHue(deep.h - glow.h));
  return Math.min(delta, 360 - delta);
}

