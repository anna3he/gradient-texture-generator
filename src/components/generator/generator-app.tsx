"use client";

import { useCallback, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlPanel } from "@/components/generator/control-panel";
import { PreviewStage } from "@/components/generator/preview-stage";
import { exportCssSnippet } from "@/lib/css-export";
import { createInitialState } from "@/lib/default-state";
import { generateStops } from "@/lib/harmony";
import { exportPngBlob } from "@/lib/renderer";
import type { GeneratorState, StylePreset } from "@/lib/types";

export function GeneratorApp() {
  const [state, setState] = useState<GeneratorState>(() => createInitialState());
  const [status, setStatus] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const patch = useCallback((next: Partial<GeneratorState>) => {
    setState((current) => ({ ...current, ...next }));
  }, []);

  const shuffle = useCallback(() => {
    setState((current) => ({
      ...current,
      stops: generateStops({
        harmony: current.harmony,
        stopCount: current.stops.length,
        lockHue: current.lockHue,
        baseHue: current.baseHue,
        satMin: current.satMin,
        satMax: current.satMax,
        lightMin: current.lightMin,
        lightMax: current.lightMax,
        positions: current.stops.map((stop) => stop.position),
      }),
      grain: {
        ...current.grain,
        seed: Math.floor(Math.random() * 1_000_000),
      },
    }));
    setStatus("Shuffled inside the current harmony.");
  }, []);

  const applyPreset = useCallback((preset: StylePreset) => {
    setState((current) => ({
      ...current,
      gradientType: preset.gradientType,
      angle: preset.angle,
      harmony: preset.harmony,
      lockHue: preset.lockHue,
      baseHue: preset.baseHue,
      satMin: preset.satMin,
      satMax: preset.satMax,
      lightMin: preset.lightMin,
      lightMax: preset.lightMax,
      grain: { ...preset.grain, seed: Math.floor(Math.random() * 1_000_000) },
      texture: { ...preset.texture },
      stops: generateStops({
        harmony: preset.harmony,
        stopCount: Math.max(3, current.stops.length),
        lockHue: preset.lockHue,
        baseHue: preset.baseHue,
        satMin: preset.satMin,
        satMax: preset.satMax,
        lightMin: preset.lightMin,
        lightMax: preset.lightMax,
        positions: current.stops.map((stop) => stop.position),
      }),
    }));
    setStatus(`Applied ${preset.name}.`);
  }, []);

  const copyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportCssSnippet(state));
      setStatus("Copied CSS gradient to clipboard.");
    } catch {
      setStatus("Could not copy CSS. Check clipboard permissions.");
    }
  }, [state]);

  const exportPng = useCallback(async () => {
    try {
      setStatus("Rendering PNG…");
      const blob = await exportPngBlob(state);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      link.href = url;
      link.download = `vellum-${state.harmony}-${stamp}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus("Downloaded PNG.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not export PNG.");
    }
  }, [state]);

  const banner = useMemo(
    () => previewError ?? status,
    [previewError, status]
  );

  return (
    <div className="flex h-dvh min-h-0 bg-[#0b0b0d] text-white">
      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 py-3 md:hidden">
          <div>
            <p className="text-sm font-medium">Vellum</p>
            <p className="text-[11px] text-white/45">Gradient & texture studio</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setPanelOpen(true)}>
            <SlidersHorizontal data-icon="inline-start" />
            Controls
          </Button>
        </div>
        <PreviewStage state={state} onError={setPreviewError} />
      </main>

      <div className="hidden w-[320px] shrink-0 p-3 md:block lg:w-[340px]">
        <ControlPanel
          state={state}
          onChange={patch}
          onShuffle={shuffle}
          onApplyPreset={applyPreset}
          onExportPng={exportPng}
          onCopyCss={copyCss}
          status={banner}
        />
      </div>

      {panelOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Dismiss controls"
            onClick={() => setPanelOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[min(100%,340px)] p-3">
            <ControlPanel
              state={state}
              onChange={patch}
              onShuffle={shuffle}
              onApplyPreset={applyPreset}
              onExportPng={exportPng}
              onCopyCss={copyCss}
              status={banner}
              onClose={() => setPanelOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
