"use client";

import { useEffect, useRef, useState } from "react";
import { ColorControl, Folder, SelectControl, Slider, Toggle } from "dialkit";
import { Check, ClipboardCopy, Download, Shuffle } from "lucide-react";
import { cssColorToHex } from "@/lib/color";
import { panelConfig } from "@/lib/panel-config";
import { CANVAS_PRESETS, STYLE_PRESETS } from "@/lib/presets";
import { setPaletteColor } from "@/lib/palette";
import type { CanvasPresetId, GeneratorState, GradientType, PaletteKey, StylePreset } from "@/lib/types";

export function ControlPanel({
  state,
  onChange,
  onShuffle,
  onApplyPreset,
  onExportPng,
  onCopyCss,
  onClose,
}: {
  state: GeneratorState;
  onChange: (patch: Partial<GeneratorState>) => void;
  onShuffle: () => void;
  onApplyPreset: (preset: StylePreset) => void;
  onExportPng: () => void;
  onCopyCss: () => Promise<boolean>;
  onClose?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  async function handleCopyCss() {
    const ok = await onCopyCss();
    if (!ok) return;
    setCopied(true);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  function setColor(key: PaletteKey, color: string) {
    onChange({
      presetId: "custom",
      palette: setPaletteColor(state.palette, key, cssColorToHex(color)),
    });
  }

  return (
    <div className="dialkit-root h-full min-h-0" data-theme="dark" data-mode="inline">
      <div className="dialkit-panel h-full min-h-0" data-mode="inline">
        <div className="dialkit-panel-inner flex h-full min-h-0 flex-col overflow-hidden">
          <Folder
            title="Controls"
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
              <Folder title="Style" defaultOpen>
                <SelectControl
                  label="Preset"
                  value={state.presetId}
                  options={[
                    ...panelConfig.style.preset.options,
                    ...(state.presetId === "custom"
                      ? [{ value: "custom", label: "Custom" }]
                      : []),
                  ]}
                  onChange={(value) => {
                    const preset = STYLE_PRESETS.find((item) => item.id === value);
                    if (preset) onApplyPreset(preset);
                  }}
                />
                <SelectControl
                  label="Size"
                  value={state.canvas.preset}
                  options={panelConfig.canvas.size.options}
                  onChange={(value) => {
                    const preset = value as CanvasPresetId;
                    const next = CANVAS_PRESETS[preset];
                    onChange({
                      canvas: { preset, width: next.width, height: next.height },
                    });
                  }}
                />
                <SelectControl
                  label="Type"
                  value={state.gradientType}
                  options={panelConfig.gradient.type.options}
                  onChange={(value) =>
                    onChange({ gradientType: value as GradientType })
                  }
                />
                {state.gradientType === "linear" ? (
                  <Slider
                    label="Angle"
                    value={state.angle}
                    min={0}
                    max={360}
                    step={1}
                    unit="°"
                    onChange={(angle) => onChange({ angle })}
                  />
                ) : null}
              </Folder>

              <Folder title="Colors" defaultOpen>
                <ColorControl
                  label="Glow"
                  value={state.palette.glow.color}
                  onChange={(color) => setColor("glow", color)}
                />
                <ColorControl
                  label="Deep"
                  value={state.palette.deep.color}
                  onChange={(color) => setColor("deep", color)}
                />
                <ColorControl
                  label="Wash"
                  value={state.palette.wash.color}
                  onChange={(color) => setColor("wash", color)}
                />
              </Folder>

              <Folder title="Motion" defaultOpen>
                <Toggle
                  label="Play"
                  checked={state.motion.playing}
                  onChange={(playing) =>
                    onChange({ motion: { ...state.motion, playing } })
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

            <div className="dialkit-button-group pt-1">
              <button type="button" className="dialkit-button" onClick={onShuffle}>
                <Shuffle className="size-3.5" />
                Shuffle
              </button>
              <button
                type="button"
                className="dialkit-button"
                data-copied={copied ? "true" : undefined}
                onClick={() => void handleCopyCss()}
              >
                {copied ? <Check className="size-3.5" /> : <ClipboardCopy className="size-3.5" />}
                {copied ? "Copied" : "Copy CSS"}
              </button>
              <button type="button" className="dialkit-button" onClick={onExportPng}>
                <Download className="size-3.5" />
                Download PNG
              </button>
            </div>
          </Folder>
        </div>
      </div>
    </div>
  );
}
