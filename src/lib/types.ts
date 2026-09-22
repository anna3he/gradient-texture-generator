export type GradientType = "arc" | "linear" | "radial";

export type ColorStop = {
  id: string;
  color: string;
  position: number;
};

export type ColorPoint = {
  color: string;
  x: number;
  y: number;
};

export type Palette = {
  deep: ColorPoint;
  glow: ColorPoint;
  wash: ColorPoint;
};

export type PaletteKey = keyof Palette;

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
  phase?: number;
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

export type PresetCollection = "studio" | "tokyo";

export type StylePreset = {
  id: string;
  name: string;
  collection: PresetCollection;
  palette: Palette;
  gradientType: GradientType;
  angle: number;
  grain: Omit<GrainSettings, "seed">;
};
