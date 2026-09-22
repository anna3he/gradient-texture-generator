"use client";

import { STYLE_PRESETS, presetPreviewCss } from "@/lib/presets";
import type { PresetCollection, StylePreset } from "@/lib/types";

const GROUPS: { id: PresetCollection; label: string }[] = [
  { id: "studio", label: "Studio" },
  { id: "tokyo", label: "Tokyo" },
];

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
      {GROUPS.map((group) => {
        const presets = STYLE_PRESETS.filter((preset) => preset.collection === group.id);
        return (
          <div key={group.id} className="preset-group">
            <p className="preset-group-label">{group.label}</p>
            <div className="preset-grid">
              {presets.map((preset) => {
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
      })}
    </div>
  );
}
