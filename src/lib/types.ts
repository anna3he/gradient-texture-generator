export type GradientType = "linear" | "radial" | "conic";

export type ColorStop = {
  id: string;
  color: string;
  position: number;
};

export type Palette = {
  deep: string;
  glow: string;
  wash: string;
};

export type GrainSettings = {
  enabled: boolean;
  opacity: number;
  seed: number;
};

export type CanvasPresetId =
  | "16:9"
  | "4:3"
  | "1:1"
  | "9:16"
  | "3:2"
  | "og";

export type CanvasSettings = {
  preset: CanvasPresetId;
  width: number;
  height: number;
};

export type MotionSettings = {
  playing: boolean;
  speed: number;
  originX: number;
  originY: number;
};

export type GeneratorState = {
  presetId: string;
  palette: Palette;
  gradientType: GradientType;
  angle: number;
  grain: GrainSettings;
  canvas: CanvasSettings;
  motion: MotionSettings;
};

export type StylePreset = {
  id: string;
  name: string;
  palette: Palette;
  gradientType: GradientType;
  angle: number;
  grain: Omit<GrainSettings, "seed">;
};
