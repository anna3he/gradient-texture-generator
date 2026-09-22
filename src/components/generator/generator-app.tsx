"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { ControlPanel } from "@/components/generator/control-panel";
import { PreviewStage } from "@/components/generator/preview-stage";
import { exportCssSnippet } from "@/lib/css-export";
import { createInitialState } from "@/lib/default-state";
import { generateStops } from "@/lib/harmony";
import { exportPngBlob } from "@/lib/renderer";
import type { GeneratorState, StylePreset } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GeneratorApp() {
  const [state, setState] = useState<GeneratorState>(() => createInitialState());
  const [status, setStatus] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [desktopPanelOpen, setDesktopPanelOpen] = useState(true);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

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
      stops: generateStops({
        harmony: preset.harmony,
        stopCount: Math.max(4, current.stops.length),
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
      setStatus(
        state.motion.playing
          ? "Copied CSS with a live keyframe."
          : "Copied CSS gradient to clipboard."
      );
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
      setStatus("Downloaded 2× PNG.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not export PNG.");
    }
  }, [state]);

  const moveOrigin = useCallback((originX: number, originY: number) => {
    setState((current) => ({
      ...current,
      motion: { ...current.motion, originX, originY },
    }));
  }, []);

  const banner = useMemo(
    () => previewError ?? status,
    [previewError, status]
  );

  const panel = (
    <ControlPanel
      state={state}
      onChange={patch}
      onShuffle={shuffle}
      onApplyPreset={applyPreset}
      onExportPng={exportPng}
      onCopyCss={copyCss}
      status={banner}
    />
  );

  return (
    <div className="flex h-dvh min-h-0 bg-[#0b0b0d] text-white">
      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 py-3 md:hidden">
          <div>
            <p className="text-sm font-medium">Vellum</p>
            <p className="text-[11px] text-white/45">Gradient studio</p>
          </div>
          <button
            type="button"
            className="dialkit-action-button"
            onClick={() => setMobilePanelOpen(true)}
          >
            <SlidersHorizontal className="mr-1 inline size-3.5" />
            Controls
          </button>
        </div>
        <PreviewStage
          state={state}
          onError={setPreviewError}
          onMoveOrigin={moveOrigin}
        />
      </main>

      <div className="relative hidden h-full md:flex">
        <button
          type="button"
          className="dial-tab my-auto flex h-20 w-5 shrink-0 items-center justify-center"
          onClick={() => setDesktopPanelOpen((open) => !open)}
          aria-expanded={desktopPanelOpen}
          aria-label={desktopPanelOpen ? "Close controls" : "Open controls"}
        >
          {desktopPanelOpen ? (
            <ChevronRight className="size-3.5 text-white/70" />
          ) : (
            <ChevronLeft className="size-3.5 text-white/70" />
          )}
        </button>
        <div
          className={cn(
            "h-full overflow-hidden transition-[width] duration-300 ease-out",
            desktopPanelOpen ? "w-[332px] lg:w-[352px]" : "w-0"
          )}
        >
          <div className="h-full w-[332px] py-3 pr-3 pl-1.5 lg:w-[352px]">{panel}</div>
        </div>
      </div>

      {mobilePanelOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Dismiss controls"
            onClick={() => setMobilePanelOpen(false)}
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
              onClose={() => setMobilePanelOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
