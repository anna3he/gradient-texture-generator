"use client";

import { Copy, Download, Pause, Play, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DialSlider } from "@/components/generator/dial-slider";
import { Folder } from "@/components/generator/folder";
import { StopEditor } from "@/components/generator/stop-editor";
import { exportPixelSize } from "@/lib/export-size";
import { HARMONY_BLURBS, HARMONY_LABELS, resizeStops } from "@/lib/harmony";
import { MOTION_MODE_LABELS } from "@/lib/motion";
import { CANVAS_PRESETS, STYLE_PRESETS } from "@/lib/presets";
import { TEXTURE_LIBRARY } from "@/lib/textures";
import type {
  BlendMode,
  CanvasPresetId,
  GeneratorState,
  GradientType,
  Harmony,
  MotionMode,
  StylePreset,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const GRADIENT_TYPES: { id: GradientType; label: string }[] = [
  { id: "linear", label: "Linear" },
  { id: "radial", label: "Radial" },
  { id: "conic", label: "Conic" },
];

const BLENDS: BlendMode[] = ["multiply", "overlay", "soft-light", "screen"];

const RESOLUTION_OPTIONS = [
  { scale: 1, label: "1× · current size" },
  { scale: 2, label: "2×" },
  { scale: 3, label: "3×" },
] as const;

export function ControlPanel({
  state,
  onChange,
  onShuffle,
  onApplyPreset,
  onExportPng,
  onCopyCss,
  status,
  onClose,
}: {
  state: GeneratorState;
  onChange: (patch: Partial<GeneratorState>) => void;
  onShuffle: () => void;
  onApplyPreset: (preset: StylePreset) => void;
  onExportPng: () => void;
  onCopyCss: () => void;
  status: string | null;
  onClose?: () => void;
}) {
  return (
    <aside className="dial-panel flex h-full min-h-0 w-full flex-col overflow-hidden">
      <header className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div>
          <p className="font-heading text-[15px] tracking-tight text-white">Vellum</p>
          <p className="mt-0.5 text-[11px] leading-4 text-white/45">
            Color-theory gradients with grain and paper.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="secondary" onClick={onShuffle}>
            <Shuffle data-icon="inline-start" />
            Shuffle
          </Button>
          {onClose ? (
            <Button size="icon-sm" variant="ghost" onClick={onClose} aria-label="Close controls">
              <X />
            </Button>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Folder title="Style presets">
          <div className="grid grid-cols-4 gap-1.5">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset)}
                className="group flex flex-col gap-1 rounded-lg p-1 text-left hover:bg-white/5"
              >
                <span
                  className="h-8 rounded-md ring-1 ring-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${preset.swatches.join(", ")})`,
                  }}
                />
                <span className="text-[10px] text-white/55 group-hover:text-white/80">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </Folder>

        <Folder title="Canvas">
          <label className="grid gap-1.5">
            <span className="text-[12px] text-white/70">Aspect / size</span>
            <Select
              value={state.canvas.preset}
              onValueChange={(value) => {
                const preset = value as CanvasPresetId;
                if (preset === "custom") {
                  onChange({ canvas: { ...state.canvas, preset } });
                  return;
                }
                const next = CANVAS_PRESETS[preset];
                onChange({
                  canvas: { preset, width: next.width, height: next.height },
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CANVAS_PRESETS).map(([id, preset]) => (
                  <SelectItem key={id} value={id}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Width"
              value={state.canvas.width}
              onChange={(width) =>
                onChange({
                  canvas: { ...state.canvas, preset: "custom", width },
                })
              }
            />
            <NumberField
              label="Height"
              value={state.canvas.height}
              onChange={(height) =>
                onChange({
                  canvas: { ...state.canvas, preset: "custom", height },
                })
              }
            />
          </div>
        </Folder>

        <Folder title="Gradient">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/4 p-1 ring-1 ring-white/6">
            {GRADIENT_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => onChange({ gradientType: type.id })}
                className={cn(
                  "h-7 rounded-md text-[11px] text-white/60",
                  state.gradientType === type.id && "bg-white/12 text-white"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
          <DialSlider
            label="Angle"
            value={state.angle}
            min={0}
            max={360}
            suffix="°"
            disabled={state.gradientType === "radial"}
            onChange={(angle) => onChange({ angle })}
          />
          <DialSlider
            label="Stops"
            value={state.stops.length}
            min={2}
            max={8}
            onChange={(count) => onChange({ stops: resizeFromPanel(state, count) })}
          />
          <StopEditor
            stops={state.stops}
            onChange={(stops) => onChange({ stops })}
          />
        </Folder>

        <Folder title="Motion">
          <p className="text-[11px] leading-4 text-white/40">
            Drag the preview to move the origin. Play spins the angle and/or drifts the center.
          </p>
          <DialSlider
            label="Origin X"
            value={state.motion.originX}
            min={0}
            max={100}
            suffix="%"
            onChange={(originX) =>
              onChange({ motion: { ...state.motion, originX } })
            }
          />
          <DialSlider
            label="Origin Y"
            value={state.motion.originY}
            min={0}
            max={100}
            suffix="%"
            onChange={(originY) =>
              onChange({ motion: { ...state.motion, originY } })
            }
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={state.motion.playing ? "secondary" : "default"}
              onClick={() =>
                onChange({
                  motion: { ...state.motion, playing: !state.motion.playing },
                })
              }
            >
              {state.motion.playing ? (
                <Pause data-icon="inline-start" />
              ) : (
                <Play data-icon="inline-start" />
              )}
              {state.motion.playing ? "Pause" : "Play"}
            </Button>
            <Select
              value={state.motion.mode}
              onValueChange={(value) =>
                onChange({
                  motion: { ...state.motion, mode: value as MotionMode },
                })
              }
            >
              <SelectTrigger className="h-7 min-w-0 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOTION_MODE_LABELS).map(([id, label]) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialSlider
            label="Speed"
            value={state.motion.speed}
            min={0.25}
            max={2.5}
            step={0.05}
            disabled={!state.motion.playing}
            onChange={(speed) => onChange({ motion: { ...state.motion, speed } })}
          />
        </Folder>

        <Folder title="Color theory">
          <label className="grid gap-1.5">
            <span className="text-[12px] text-white/70">Harmony</span>
            <Select
              value={state.harmony}
              onValueChange={(value) => onChange({ harmony: value as Harmony })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HARMONY_LABELS).map(([id, label]) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] leading-4 text-white/40">
              {HARMONY_BLURBS[state.harmony]}
            </p>
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-white/70">Lock base hue</span>
            <Switch
              checked={state.lockHue}
              onCheckedChange={(checked) => onChange({ lockHue: Boolean(checked) })}
            />
          </div>
          <DialSlider
            label="Base hue"
            value={state.baseHue}
            min={0}
            max={360}
            suffix="°"
            disabled={!state.lockHue}
            onChange={(baseHue) => onChange({ baseHue })}
          />
          <div
            className="h-2 rounded-full ring-1 ring-white/8"
            style={{
              background:
                "linear-gradient(90deg, #f43f5e, #f59e0b, #84cc16, #14b8a6, #3b82f6, #8b5cf6, #f43f5e)",
            }}
          />
          <DialSlider
            label="Saturation min"
            value={state.satMin}
            min={8}
            max={92}
            onChange={(satMin) => onChange({ satMin: Math.min(satMin, state.satMax) })}
          />
          <DialSlider
            label="Saturation max"
            value={state.satMax}
            min={12}
            max={96}
            onChange={(satMax) => onChange({ satMax: Math.max(satMax, state.satMin) })}
          />
          <DialSlider
            label="Lightness min"
            value={state.lightMin}
            min={6}
            max={88}
            onChange={(lightMin) =>
              onChange({ lightMin: Math.min(lightMin, state.lightMax) })
            }
          />
          <DialSlider
            label="Lightness max"
            value={state.lightMax}
            min={12}
            max={94}
            onChange={(lightMax) =>
              onChange({ lightMax: Math.max(lightMax, state.lightMin) })
            }
          />
        </Folder>

        <Folder title="Grain">
          <DialSlider
            label="Intensity"
            value={state.grain.intensity}
            min={0}
            max={100}
            onChange={(intensity) =>
              onChange({ grain: { ...state.grain, intensity } })
            }
          />
          <DialSlider
            label="Opacity"
            value={state.grain.opacity}
            min={0}
            max={100}
            onChange={(opacity) => onChange({ grain: { ...state.grain, opacity } })}
          />
          <DialSlider
            label="Grain size"
            value={state.grain.size}
            min={0.6}
            max={5}
            step={0.1}
            onChange={(size) => onChange({ grain: { ...state.grain, size } })}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-white/70">Colored noise</span>
            <Switch
              checked={state.grain.colored}
              onCheckedChange={(checked) =>
                onChange({ grain: { ...state.grain, colored: Boolean(checked) } })
              }
            />
          </div>
        </Folder>

        <Folder title="Texture overlay">
          <div className="grid grid-cols-2 gap-1.5">
            <TextureButton
              active={state.texture.id === "none"}
              label="None"
              onClick={() =>
                onChange({ texture: { ...state.texture, id: "none", opacity: 0 } })
              }
            />
            {TEXTURE_LIBRARY.map((texture) => (
              <TextureButton
                key={texture.id}
                active={state.texture.id === texture.id}
                label={texture.name}
                swatch={texture.src}
                onClick={() =>
                  onChange({
                    texture: {
                      id: texture.id,
                      opacity: state.texture.opacity || 28,
                      blend: texture.recommendedBlend,
                    },
                  })
                }
              />
            ))}
          </div>
          {state.texture.id !== "none" ? (
            <p className="text-[11px] leading-4 text-white/40">
              {TEXTURE_LIBRARY.find((texture) => texture.id === state.texture.id)?.blurb}
            </p>
          ) : (
            <p className="text-[11px] leading-4 text-white/40">
              Built-in paper and film scans. No upload required.
            </p>
          )}
          <DialSlider
            label="Texture opacity"
            value={state.texture.opacity}
            min={0}
            max={80}
            disabled={state.texture.id === "none"}
            onChange={(opacity) =>
              onChange({ texture: { ...state.texture, opacity } })
            }
          />
          <label className="grid gap-1.5">
            <span className="text-[12px] text-white/70">Blend mode</span>
            <Select
              value={state.texture.blend}
              disabled={state.texture.id === "none"}
              onValueChange={(value) =>
                onChange({
                  texture: { ...state.texture, blend: value as BlendMode },
                })
              }
            >
              <SelectTrigger className="w-full capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLENDS.map((blend) => (
                  <SelectItem key={blend} value={blend} className="capitalize">
                    {blend.replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </Folder>

        <Folder title="Export">
          <label className="grid gap-1.5">
            <span className="text-[12px] text-white/70">Resolution</span>
            <Select
              value={String(state.resolutionScale)}
              onValueChange={(value) =>
                onChange({ resolutionScale: Number(value) })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTION_OPTIONS.map((option) => {
                  const width = Math.min(
                    8192,
                    Math.round(state.canvas.width * option.scale)
                  );
                  const height = Math.min(
                    8192,
                    Math.round(state.canvas.height * option.scale)
                  );
                  return (
                    <SelectItem key={option.scale} value={String(option.scale)}>
                      {option.label} · {width} × {height}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </label>
          <p className="text-[11px] text-white/40">
            PNG at {exportPixelSize(state).width} × {exportPixelSize(state).height}
            {state.motion.playing
              ? ". Copy CSS includes a live keyframe. PNG is still a still."
              : ""}
          </p>
        </Folder>
      </div>

      <footer className="grid gap-2 border-t border-white/8 px-3 py-3">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onCopyCss}>
            <Copy data-icon="inline-start" />
            Copy CSS
          </Button>
          <Button onClick={onExportPng}>
            <Download data-icon="inline-start" />
            PNG
          </Button>
        </div>
        <p
          className={cn(
            "min-h-4 text-center text-[11px]",
            status?.startsWith("Could") || status?.startsWith("PNG")
              ? "text-red-300"
              : "text-white/40"
          )}
          role="status"
        >
          {status ?? "Shuffle stays inside the selected harmony."}
        </p>
      </footer>
    </aside>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[12px] text-white/70">{label}</span>
      <Input
        type="number"
        min={64}
        max={8192}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.max(64, Math.min(8192, Math.round(next))));
        }}
      />
    </label>
  );
}

function TextureButton({
  active,
  label,
  swatch,
  onClick,
}: {
  active: boolean;
  label: string;
  swatch?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left ring-1 ring-white/8 hover:bg-white/5",
        active && "bg-white/10 ring-white/20"
      )}
    >
      <span
        className="size-6 rounded-sm bg-white/10 bg-cover ring-1 ring-white/10"
        style={swatch ? { backgroundImage: `url(${swatch})` } : undefined}
      />
      <span className="text-[11px] text-white/70">{label}</span>
    </button>
  );
}

function resizeFromPanel(state: GeneratorState, count: number): GeneratorState["stops"] {
  return resizeStops(state.stops, count, {
    harmony: state.harmony,
    lockHue: state.lockHue,
    baseHue: state.baseHue,
    satMin: state.satMin,
    satMax: state.satMax,
    lightMin: state.lightMin,
    lightMax: state.lightMax,
  });
}
