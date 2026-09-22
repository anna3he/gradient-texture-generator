"use client";

import { STYLE_PRESETS, presetPreviewCss } from "@/lib/presets";
import type { StylePreset } from "@/lib/types";

export function PresetGrid({
  value,
  onApply,
}: {
  value: string;
  onApply: (preset: StylePreset) => void;
}) {
  return (
    <div className="preset-picker">
      <div className="preset-picker-label">Preset</div>
      <div className="preset-grid">
        {STYLE_PRESETS.map((preset) => {
          const active = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.name}
              aria-label={preset.name}
              aria-pressed={active}
              data-active={active ? "true" : undefined}
              className="preset-tile"
              style={{ backgroundImage: presetPreviewCss(preset) }}
              onClick={() => onApply(preset)}
            />
          );
        })}
      </div>
    </div>
  );
}
