"use client";

import {
  ButtonGroup,
  DialPad,
  Folder,
  SelectControl,
  Slider,
  Toggle,
} from "dialkit";
import { StopEditor } from "@/components/generator/stop-editor";
import { HARMONY_BLURBS, resizeStops } from "@/lib/harmony";
import { panelConfig } from "@/lib/panel-config";
import { CANVAS_PRESETS, STYLE_PRESETS } from "@/lib/presets";
import type {
  CanvasPresetId,
  GeneratorState,
  GradientType,
  Harmony,
  MotionMode,
  StylePreset,
} from "@/lib/types";

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
  const canvasOptions = panelConfig.canvas.size.options;
  const typeOptions = panelConfig.gradient.type.options;
  const modeOptions = panelConfig.motion.mode.options;
  const harmonyOptions = panelConfig.color.harmony.options;

  return (
    <div className="dialkit-root h-full min-h-0" data-theme="dark" data-mode="inline">
      <div className="dialkit-panel h-full min-h-0" data-mode="inline">
        <div className="dialkit-panel-inner flex h-full min-h-0 flex-col overflow-hidden">
          <Folder
            title="Vellum"
            isRoot
            inline
            defaultOpen
            toolbar={
              onClose ? (
                <button
                  type="button"
                  className="dialkit-action-button"
                  onClick={onClose}
                  aria-label="Close controls"
                >
                  Close
                </button>
              ) : undefined
            }
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Folder title="Style presets" defaultOpen>
                <div className="grid grid-cols-4 gap-1.5 px-0.5 pb-1">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onApplyPreset(preset)}
                      className="flex flex-col gap-1 rounded-[var(--dial-radius)] p-1 text-left hover:bg-[var(--dial-surface-hover)]"
                    >
                      <span
                        className="h-7 rounded-[calc(var(--dial-radius)-2px)]"
                        style={{
                          background: `linear-gradient(135deg, ${preset.swatches.join(", ")})`,
                        }}
                      />
                      <span
                        style={{
                          color: "var(--dial-text-label)",
                          fontSize: 11,
                          lineHeight: "14px",
                        }}
                      >
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </Folder>

              <Folder title="Canvas" defaultOpen>
                <SelectControl
                  label="Size"
                  value={state.canvas.preset}
                  options={canvasOptions}
                  onChange={(value) => {
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
                />
                <Slider
                  label="Width"
                  value={state.canvas.width}
                  min={64}
                  max={8192}
                  step={1}
                  unit="px"
                  onChange={(width) =>
                    onChange({
                      canvas: { ...state.canvas, preset: "custom", width },
                    })
                  }
                />
                <Slider
                  label="Height"
                  value={state.canvas.height}
                  min={64}
                  max={8192}
                  step={1}
                  unit="px"
                  onChange={(height) =>
                    onChange({
                      canvas: { ...state.canvas, preset: "custom", height },
                    })
                  }
                />
              </Folder>

              <Folder title="Gradient" defaultOpen>
                <SelectControl
                  label="Type"
                  value={state.gradientType}
                  options={typeOptions}
                  onChange={(value) =>
                    onChange({ gradientType: value as GradientType })
                  }
                />
                <Slider
                  label="Angle"
                  value={state.angle}
                  min={0}
                  max={360}
                  step={1}
                  unit="°"
                  onChange={(angle) => onChange({ angle })}
                />
                <Slider
                  label="Stops"
                  value={state.stops.length}
                  min={2}
                  max={8}
                  step={1}
                  onChange={(count) =>
                    onChange({
                      stops: resizeStops(state.stops, count, {
                        harmony: state.harmony,
                        lockHue: state.lockHue,
                        baseHue: state.baseHue,
                        satMin: state.satMin,
                        satMax: state.satMax,
                        lightMin: state.lightMin,
                        lightMax: state.lightMax,
                      }),
                    })
                  }
                />
                <StopEditor
                  stops={state.stops}
                  onChange={(stops) => onChange({ stops })}
                />
              </Folder>

              <Folder title="Motion" defaultOpen>
                <DialPad
                  label="Origin"
                  value={{
                    x: state.motion.originX,
                    y: 100 - state.motion.originY,
                  }}
                  x={[50, 0, 100, 1]}
                  y={[50, 0, 100, 1]}
                  labels={{ x: "X", y: "Y" }}
                  onChange={({ x, y }) =>
                    onChange({
                      motion: {
                        ...state.motion,
                        originX: x,
                        originY: 100 - y,
                      },
                    })
                  }
                />
                <Toggle
                  label="Play"
                  checked={state.motion.playing}
                  onChange={(playing) =>
                    onChange({ motion: { ...state.motion, playing } })
                  }
                />
                <SelectControl
                  label="Mode"
                  value={state.motion.mode}
                  options={modeOptions}
                  onChange={(value) =>
                    onChange({
                      motion: { ...state.motion, mode: value as MotionMode },
                    })
                  }
                />
                <Slider
                  label="Speed"
                  value={state.motion.speed}
                  min={0.25}
                  max={2.5}
                  step={0.05}
                  onChange={(speed) =>
                    onChange({ motion: { ...state.motion, speed } })
                  }
                />
              </Folder>

              <Folder title="Color theory" defaultOpen>
                <SelectControl
                  label="Harmony"
                  value={state.harmony}
                  options={harmonyOptions}
                  onChange={(value) => onChange({ harmony: value as Harmony })}
                />
                <p
                  style={{
                    color: "var(--dial-text-tertiary)",
                    fontSize: 11,
                    lineHeight: "15px",
                    margin: "0 0 6px",
                  }}
                >
                  {HARMONY_BLURBS[state.harmony]}
                </p>
                <Toggle
                  label="Lock hue"
                  checked={state.lockHue}
                  onChange={(lockHue) => onChange({ lockHue })}
                />
                <Slider
                  label="Base hue"
                  value={state.baseHue}
                  min={0}
                  max={360}
                  step={1}
                  unit="°"
                  onChange={(baseHue) => onChange({ baseHue })}
                />
                <Slider
                  label="Sat min"
                  value={state.satMin}
                  min={4}
                  max={50}
                  step={1}
                  onChange={(satMin) =>
                    onChange({ satMin: Math.min(satMin, state.satMax) })
                  }
                />
                <Slider
                  label="Sat max"
                  value={state.satMax}
                  min={8}
                  max={70}
                  step={1}
                  onChange={(satMax) =>
                    onChange({ satMax: Math.max(satMax, state.satMin) })
                  }
                />
                <Slider
                  label="Light min"
                  value={state.lightMin}
                  min={8}
                  max={88}
                  step={1}
                  onChange={(lightMin) =>
                    onChange({ lightMin: Math.min(lightMin, state.lightMax) })
                  }
                />
                <Slider
                  label="Light max"
                  value={state.lightMax}
                  min={16}
                  max={96}
                  step={1}
                  onChange={(lightMax) =>
                    onChange({ lightMax: Math.max(lightMax, state.lightMin) })
                  }
                />
              </Folder>

              <Folder title="Grain" defaultOpen>
                <Toggle
                  label="Grain"
                  checked={state.grain.enabled}
                  onChange={(enabled) =>
                    onChange({ grain: { ...state.grain, enabled } })
                  }
                />
                <Slider
                  label="Opacity"
                  value={state.grain.opacity}
                  min={0}
                  max={80}
                  step={1}
                  unit="%"
                  onChange={(opacity) =>
                    onChange({ grain: { ...state.grain, opacity } })
                  }
                />
              </Folder>
            </div>

            <div className="pt-1">
              <ButtonGroup
                buttons={[
                  { label: "Shuffle", onClick: onShuffle },
                  { label: "Copy CSS", onClick: onCopyCss },
                  { label: "Download PNG", onClick: onExportPng },
                ]}
              />
              <p
                role="status"
                style={{
                  color: status?.startsWith("Could")
                    ? "#f5b4b0"
                    : "var(--dial-text-tertiary)",
                  fontSize: 11,
                  lineHeight: "15px",
                  margin: "8px 0 0",
                  textAlign: "center",
                }}
              >
                {status ?? "PNG exports at 2×. Shuffle stays in the current harmony."}
              </p>
            </div>
          </Folder>
        </div>
      </div>
    </div>
  );
}
