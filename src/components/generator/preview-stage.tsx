"use client";

import { useEffect, useRef, useState } from "react";
import { cssColorToHex } from "@/lib/color";
import { exportPixelSize } from "@/lib/export-size";
import { applyMotion } from "@/lib/motion";
import { setPaletteColor, setPalettePoint } from "@/lib/palette";
import { previewSize, renderGradient } from "@/lib/renderer";
import type { GeneratorState, PaletteKey } from "@/lib/types";

const POINT_KEYS: PaletteKey[] = ["glow", "deep", "wash"];

export function PreviewStage({
  state,
  onChange,
  onError,
}: {
  state: GeneratorState;
  onChange: (patch: Partial<GeneratorState>) => void;
  onError: (message: string | null) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const [fit, setFit] = useState({ width: 960, height: 540 });

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

  function movePoint(key: PaletteKey, clientX: number, clientY: number) {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((clientY - rect.top) / Math.max(1, rect.height)) * 100;
    onChange({
      presetId: "custom",
      palette: setPalettePoint(stateRef.current.palette, key, x, y),
    });
  }

  function recolorPoint(key: PaletteKey, color: string) {
    onChange({
      presetId: "custom",
      palette: setPaletteColor(stateRef.current.palette, key, cssColorToHex(color)),
    });
  }

  const exportSize = exportPixelSize(state);
  const presetLabel = state.presetId === "custom" ? "Custom" : state.presetId;

  return (
    <div ref={frameRef} className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative" style={{ width: fit.width, height: fit.height }}>
          <canvas
            ref={canvasRef}
            width={fit.width}
            height={fit.height}
            className="max-h-full max-w-full rounded-sm shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            style={{ width: fit.width, height: fit.height }}
          />
          {state.gradientType === "arc" ? (
            <div ref={overlayRef} className="absolute inset-0">
              {POINT_KEYS.map((key) => (
                <PointHandle
                  key={key}
                  label={key}
                  color={state.palette[key].color}
                  x={state.palette[key].x}
                  y={state.palette[key].y}
                  onMove={(clientX, clientY) => movePoint(key, clientX, clientY)}
                  onColor={(color) => recolorPoint(key, color)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="relative flex items-center justify-between px-4 pb-3 text-[11px] tracking-wide text-white/40 md:px-6">
        <span>
          {state.canvas.width} × {state.canvas.height}
          {` · 2× ${exportSize.width} × ${exportSize.height}`}
          {state.motion.playing ? " · live" : ""}
        </span>
        <span className="capitalize">{presetLabel}</span>
      </div>
    </div>
  );
}

function PointHandle({
  label,
  color,
  x,
  y,
  onMove,
  onColor,
}: {
  label: PaletteKey;
  color: string;
  x: number;
  y: number;
  onMove: (clientX: number, clientY: number) => void;
  onColor: (color: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const moved = useRef(false);

  return (
    <button
      type="button"
      aria-label={`${label} color point`}
      className="absolute size-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white/90 shadow-[0_2px_10px_rgba(0,0,0,0.35)] active:cursor-grabbing"
      style={{ left: `${x}%`, top: `${y}%`, backgroundColor: color, touchAction: "none" }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        moved.current = false;
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        if (Math.abs(event.movementX) + Math.abs(event.movementY) > 1) {
          moved.current = true;
        }
        if (moved.current) onMove(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (!moved.current) inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="color"
        value={color}
        aria-label={`Change ${label} color`}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        onChange={(event) => onColor(event.target.value)}
        tabIndex={-1}
      />
    </button>
  );
}
