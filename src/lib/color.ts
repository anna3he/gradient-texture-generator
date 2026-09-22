export type HSL = { h: number; s: number; l: number };
export type RGB = { r: number; g: number; b: number };

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function wrapHue(hue: number) {
  return ((hue % 360) + 360) % 360;
}

export function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function hexToRgb(hex: string): RGB | null {
  const normalized = hex.trim().replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return null;
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB) {
  const toHex = (channel: number) =>
    clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const hue = wrapHue(h) / 360;

  if (sat === 0) {
    const gray = light * 255;
    return { r: gray, g: gray, b: gray };
  }

  const hueToChannel = (p: number, q: number, t: number) => {
    let next = t;
    if (next < 0) next += 1;
    if (next > 1) next -= 1;
    if (next < 1 / 6) return p + (q - p) * 6 * next;
    if (next < 1 / 2) return q;
    if (next < 2 / 3) return p + (q - p) * (2 / 3 - next) * 6;
    return p;
  };

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;

  return {
    r: hueToChannel(p, q, hue + 1 / 3) * 255,
    g: hueToChannel(p, q, hue) * 255,
    b: hueToChannel(p, q, hue - 1 / 3) * 255,
  };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const light = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: light * 100 };
  }

  const sat =
    light > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
  }

  return {
    h: hue * 60,
    s: sat * 100,
    l: light * 100,
  };
}

export function hslToHex(hsl: HSL) {
  return rgbToHex(hslToRgb(hsl));
}

export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
}

export function normalizeHex(hex: string, options?: { short?: boolean }) {
  const allowShort = options?.short ?? true;
  const normalized = hex.trim().replace("#", "");
  if (normalized.length === 3 && !allowShort) {
    return null;
  }
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHex(rgb) : null;
}

export function cssColorToHex(color: string) {
  const hex = normalizeHex(color);
  if (hex) return hex;
  if (typeof document === "undefined") return "#888888";

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#888888";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  return rgbToHex({ r: pixel[0] ?? 0, g: pixel[1] ?? 0, b: pixel[2] ?? 0 });
}

export function draftHex(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return withHash.slice(0, 7);
}

export function mixHex(a: string, b: string, t: number) {
  const colorA = hexToRgb(a);
  const colorB = hexToRgb(b);
  if (!colorA || !colorB) return a;

  return rgbToHex({
    r: lerp(colorA.r, colorB.r, t),
    g: lerp(colorA.g, colorB.g, t),
    b: lerp(colorA.b, colorB.b, t),
  });
}

export function mixHslHex(a: string, b: string, t: number) {
  const colorA = hexToHsl(a);
  const colorB = hexToHsl(b);
  if (!colorA || !colorB) return mixHex(a, b, t);

  let delta = colorB.h - colorA.h;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  return hslToHex({
    h: wrapHue(colorA.h + delta * t),
    s: lerp(colorA.s, colorB.s, t),
    l: lerp(colorA.l, colorB.l, t),
  });
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `stop-${Math.random().toString(36).slice(2, 10)}`;
}
