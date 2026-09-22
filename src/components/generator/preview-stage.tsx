"use client";

import { useEffect, useRef, useState } from "react";
import { previewSize, renderGradient } from "@/lib/renderer";
import type { GeneratorState } from "@/lib/types";

export function PreviewStage({
  state,
  onError,
}: {
  state: GeneratorState;
  onError: (message: string | null) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fit, setFit] = useState({ width: 960, height: 540 });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const rect = frame.getBoundingClientRect();
      setFit(
        previewSize(
          state.canvas.width,
          state.canvas.height,
          Math.max(160, rect.width - 32),
          Math.max(160, rect.height - 72)
        )
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [state.canvas.width, state.canvas.height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    renderGradient(canvas, state, fit)
      .then(() => {
        if (!cancelled) onError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        onError(error instanceof Error ? error.message : "Preview failed to render.");
      });

    return () => {
      cancelled = true;
    };
  }, [state, fit, onError]);

  return (
    <div ref={frameRef} className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={fit.width}
            height={fit.height}
            className="max-h-full max-w-full rounded-sm shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            style={{ width: fit.width, height: fit.height }}
          />
        </div>
      </div>
      <div className="relative flex items-center justify-between px-4 pb-3 text-[11px] tracking-wide text-white/40 md:px-6">
        <span>
          {state.canvas.width} × {state.canvas.height}
          {state.resolutionScale !== 1 ? ` · ${state.resolutionScale}× export` : ""}
        </span>
        <span className="capitalize">{state.harmony.replace("-", " ")}</span>
      </div>
    </div>
  );
}
