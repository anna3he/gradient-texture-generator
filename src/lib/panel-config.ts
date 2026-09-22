import type { DialConfig, ResolvedValues } from "dialkit";
import { CANVAS_PRESETS, STYLE_PRESETS } from "./presets";

export const EXPORT_SCALE = 2;

export const GRAIN_DEFAULTS = {
  intensity: 34,
  size: 1.25,
  colored: false,
} as const;

export const panelConfig = {
  style: {
    preset: {
      type: "select",
      options: STYLE_PRESETS.map((preset) => ({
        value: preset.id,
        label: preset.name,
      })),
      default: "sea",
    },
  },
  colors: {
    glow: { type: "color", default: "#2ad4c0" },
    deep: { type: "color", default: "#1c2d9c" },
    wash: { type: "color", default: "#f5f8fa" },
  },
  canvas: {
    size: {
      type: "select",
      options: Object.entries(CANVAS_PRESETS).map(([value, preset]) => ({
        value,
        label: preset.label,
      })),
      default: "16:9",
    },
  },
  gradient: {
    type: {
      type: "select",
      options: [
        { value: "arc", label: "Arc" },
        { value: "linear", label: "Linear" },
        { value: "radial", label: "Radial" },
      ],
      default: "arc",
    },
    angle: [180, 0, 360, 1],
  },
  motion: {
    play: false,
    speed: [0.8, 0.25, 2.5, 0.05],
  },
  grain: {
    enabled: true,
    opacity: [12, 0, 80, 1],
  },
  shuffle: { type: "action", label: "Shuffle" },
  copyCss: { type: "action", label: "Copy CSS" },
  downloadPng: { type: "action", label: "Download PNG" },
} satisfies DialConfig;

export type PanelValues = ResolvedValues<typeof panelConfig>;
