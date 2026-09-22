export type Harmony =
  | "analogous"
  | "complementary"
  | "split-complementary"
  | "triadic"
  | "monochromatic";

export type GradientType = "linear" | "radial" | "conic";

export type BlendMode = "multiply" | "overlay" | "soft-light" | "screen";

export type TextureId =
  | "none"
  | "tracing-paper"
  | "canvas-weave"
  | "film-grain"
  | "vellum";

export type ColorStop = {
  id: string;
  color: string;
  position: number;
};

export type GrainSettings = {
  intensity: number;
  opacity: number;
  size: number;
  colored: boolean;
  seed: number;
};

export type TextureSettings = {
  id: TextureId;
  opacity: number;
  blend: BlendMode;
};

export type CanvasPresetId =
  | "16:9"
  | "4:3"
  | "1:1"
  | "9:16"
  | "3:2"
  | "og"
  | "custom";

export type CanvasSettings = {
  preset: CanvasPresetId;
  width: number;
  height: number;
};

export type MotionMode = "spin" | "drift" | "both";

export type MotionSettings = {
  originX: number;
  originY: number;
  playing: boolean;
  mode: MotionMode;
  speed: number;
};

export type GeneratorState = {
  gradientType: GradientType;
  angle: number;
  stops: ColorStop[];
  harmony: Harmony;
  lockHue: boolean;
  baseHue: number;
  satMin: number;
  satMax: number;
  lightMin: number;
  lightMax: number;
  grain: GrainSettings;
  texture: TextureSettings;
  canvas: CanvasSettings;
  resolutionScale: number;
  motion: MotionSettings;
};

export type StylePreset = {
  id: string;
  name: string;
  harmony: Harmony;
  gradientType: GradientType;
  angle: number;
  lockHue: boolean;
  baseHue: number;
  satMin: number;
  satMax: number;
  lightMin: number;
  lightMax: number;
  grain: Omit<GrainSettings, "seed">;
  texture: TextureSettings;
  swatches: string[];
};
