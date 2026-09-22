import { paletteFromColors } from "./palette";
import type { CanvasPresetId, Palette, StylePreset } from "./types";

export const CANVAS_PRESETS: Record<
  CanvasPresetId,
  { width: number; height: number; label: string }
> = {
  "16:9": { width: 1920, height: 1080, label: "16:9 · 1920×1080" },
  "4:3": { width: 1600, height: 1200, label: "4:3 · 1600×1200" },
  "1:1": { width: 1080, height: 1080, label: "1:1 · 1080×1080" },
  "9:16": { width: 1080, height: 1920, label: "9:16 · 1080×1920" },
  "3:2": { width: 1800, height: 1200, label: "3:2 · 1800×1200" },
  og: { width: 1200, height: 630, label: "OG · 1200×630" },
};

function presetPalette(
  colors: { deep: string; glow: string; wash: string },
  points: { deep: { x: number; y: number }; glow: { x: number; y: number }; wash: { x: number; y: number } }
): Palette {
  return paletteFromColors(colors, points);
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "sea",
    name: "Sea",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 12 },
    palette: presetPalette(
      { deep: "#1c2d9c", glow: "#2ad4c0", wash: "#f5f8fa" },
      { deep: { x: 16, y: 14 }, glow: { x: 36, y: 44 }, wash: { x: 78, y: 76 } }
    ),
  },
  {
    id: "sunrise",
    name: "Sunrise",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 10 },
    palette: presetPalette(
      { deep: "#a85a30", glow: "#ffc078", wash: "#fff8f1" },
      { deep: { x: 16, y: 72 }, glow: { x: 40, y: 38 }, wash: { x: 80, y: 20 } }
    ),
  },
  {
    id: "dawn",
    name: "Dawn",
    gradientType: "arc",
    angle: 172,
    grain: { enabled: true, opacity: 10 },
    palette: presetPalette(
      { deep: "#70405e", glow: "#ff9eb0", wash: "#fff6f4" },
      { deep: { x: 15, y: 24 }, glow: { x: 38, y: 52 }, wash: { x: 80, y: 78 } }
    ),
  },
  {
    id: "dusk",
    name: "Dusk",
    gradientType: "arc",
    angle: 186,
    grain: { enabled: true, opacity: 14 },
    palette: presetPalette(
      { deep: "#3d3a6b", glow: "#e89aa4", wash: "#f7f3f0" },
      { deep: { x: 18, y: 14 }, glow: { x: 42, y: 40 }, wash: { x: 78, y: 80 } }
    ),
  },
  {
    id: "ember",
    name: "Ember",
    gradientType: "arc",
    angle: 168,
    grain: { enabled: true, opacity: 14 },
    palette: presetPalette(
      { deep: "#6b2e22", glow: "#ff7e3a", wash: "#fbf4ec" },
      { deep: { x: 14, y: 18 }, glow: { x: 34, y: 48 }, wash: { x: 82, y: 78 } }
    ),
  },
  {
    id: "mist",
    name: "Mist",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 16 },
    palette: presetPalette(
      { deep: "#3a5060", glow: "#7ad4e0", wash: "#f7fafb" },
      { deep: { x: 20, y: 16 }, glow: { x: 40, y: 42 }, wash: { x: 76, y: 78 } }
    ),
  },
  {
    id: "sage",
    name: "Sage",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 12 },
    palette: presetPalette(
      { deep: "#2f4a38", glow: "#8fd4a0", wash: "#f5f7f2" },
      { deep: { x: 22, y: 80 }, glow: { x: 42, y: 40 }, wash: { x: 78, y: 18 } }
    ),
  },
  {
    id: "linen",
    name: "Linen",
    gradientType: "arc",
    angle: 160,
    grain: { enabled: true, opacity: 8 },
    palette: presetPalette(
      { deep: "#8a6240", glow: "#efc888", wash: "#fbf8f2" },
      { deep: { x: 18, y: 64 }, glow: { x: 38, y: 34 }, wash: { x: 80, y: 22 } }
    ),
  },
];
