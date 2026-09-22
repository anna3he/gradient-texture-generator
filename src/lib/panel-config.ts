import type { DialConfig, ResolvedValues } from "dialkit";
import { CANVAS_PRESETS } from "./presets";
import { HARMONY_LABELS } from "./harmony";

export const EXPORT_SCALE = 2;

export const GRAIN_DEFAULTS = {
  intensity: 34,
  size: 1.25,
  colored: false,
} as const;

export const panelConfig = {
  canvas: {
    size: {
      type: "select",
      options: [
        ...Object.entries(CANVAS_PRESETS).map(([value, preset]) => ({
          value,
          label: preset.label,
        })),
        { value: "custom", label: "Custom" },
      ],
      default: "16:9",
    },
    width: [1920, 64, 8192, 1],
    height: [1080, 64, 8192, 1],
  },
  gradient: {
    type: {
      type: "select",
      options: [
        { value: "linear", label: "Linear" },
        { value: "radial", label: "Radial" },
        { value: "conic", label: "Conic" },
      ],
      default: "linear",
    },
    angle: [148, 0, 360, 1],
    stops: [4, 2, 8, 1],
  },
  motion: {
    origin: {
      type: "pad",
      x: [50, 0, 100, 1],
      y: [50, 0, 100, 1],
      labels: { x: "X", y: "Y" },
    },
    play: false,
    mode: {
      type: "select",
      options: [
        { value: "spin", label: "Spin" },
        { value: "drift", label: "Drift" },
        { value: "both", label: "Spin + drift" },
      ],
      default: "both",
    },
    speed: [0.8, 0.25, 2.5, 0.05],
  },
  color: {
    harmony: {
      type: "select",
      options: Object.entries(HARMONY_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
      default: "analogous",
    },
    lockHue: true,
    baseHue: [32, 0, 360, 1],
    satMin: [10, 4, 50, 1],
    satMax: [28, 8, 70, 1],
    lightMin: [48, 8, 88, 1],
    lightMax: [86, 16, 96, 1],
  },
  grain: {
    enabled: true,
    opacity: [20, 0, 80, 1],
  },
  shuffle: { type: "action", label: "Shuffle" },
  copyCss: { type: "action", label: "Copy CSS" },
  downloadPng: { type: "action", label: "Download PNG" },
} satisfies DialConfig;

export type PanelValues = ResolvedValues<typeof panelConfig>;
export type PanelCanvas = PanelValues["canvas"];
export type PanelGradient = PanelValues["gradient"];
export type PanelMotion = PanelValues["motion"];
export type PanelColor = PanelValues["color"];
export type PanelGrain = PanelValues["grain"];
