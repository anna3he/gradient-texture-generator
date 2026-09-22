"use client";

import { useEffect, useRef, useState } from "react";
import { exportPixelSize } from "@/lib/export-size";
import { applyMotion } from "@/lib/motion";
import { previewSize, renderGradient } from "@/lib/renderer";
import type { GeneratorState } from "@/lib/types";

export function PreviewStage({
  state,
  onError,
  onMoveOrigin,
}: {
  state: GeneratorState;
  onError: (message: string | null) => void;
  onMoveOrigin: (originX: number, originY: number) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const [fit, setFit] = useState({ width: 960, height: 540 });
  const dragging = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
    if (!canvas || state.motion.playing) return;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state.motion.playing) return;
    let cancelled = false;
    let frame = 0;
    let painting = false;
    const started = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      if (!painting) {
        painting = true;
        renderGradient(canvas, applyMotion(stateRef.current, (now - started) / 1000), fit)
          .then(() => {
            if (!cancelled) onError(null);
          })
          .catch((error: unknown) => {
            if (cancelled) return;
            onError(error instanceof Error ? error.message : "Preview failed to render.");
          })
          .finally(() => {
            painting = false;
          });
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [state.motion.playing, fit, onError]);

  function originFromEvent(event: { clientX: number; clientY: number }) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      originX: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
      originY: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }

  const exportSize = exportPixelSize(state);

  return (
    <div ref={frameRef} className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={fit.width}
            height={fit.height}
            className="max-h-full max-w-full cursor-grab rounded-sm shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10 active:cursor-grabbing"
            style={{ width: fit.width, height: fit.height }}
            onPointerDown={(event) => {
              dragging.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              const next = originFromEvent(event);
              if (next) onMoveOrigin(next.originX, next.originY);
            }}
            onPointerMove={(event) => {
              if (!dragging.current) return;
              const next = originFromEvent(event);
              if (next) onMoveOrigin(next.originX, next.originY);
            }}
            onPointerUp={() => {
              dragging.current = false;
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
          />
        </div>
      </div>
      <div className="relative flex items-center justify-between px-4 pb-3 text-[11px] tracking-wide text-white/40 md:px-6">
        <span>
          {state.canvas.width} × {state.canvas.height}
          {state.resolutionScale !== 1
            ? ` · export ${exportSize.width} × ${exportSize.height}`
            : ""}
          {state.motion.playing ? " · live" : ""}
        </span>
        <span className="capitalize">{state.harmony.replace("-", " ")}</span>
      </div>
    </div>
  );
}
