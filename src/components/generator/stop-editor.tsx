"use client";

import { useRef, useState } from "react";
import { ColorControl } from "dialkit";
import { createId, cssColorToHex } from "@/lib/color";
import { sampleGradientColor, sortStops } from "@/lib/harmony";
import type { ColorStop } from "@/lib/types";

export function StopEditor({
  stops,
  onChange,
}: {
  stops: ColorStop[];
  onChange: (stops: ColorStop[]) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState(stops[0]?.id ?? "");
  const [dragId, setDragId] = useState<string | null>(null);
  const selected = stops.find((stop) => stop.id === selectedId) ?? stops[0];

  function positionFromEvent(event: { clientX: number }) {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
  }

  function updateStop(id: string, patch: Partial<ColorStop>) {
    onChange(stops.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)));
  }

  function addStop() {
    if (stops.length >= 8) return;
    const used = new Set(stops.map((stop) => Math.round(stop.position)));
    let position = 50;
    for (const candidate of [50, 25, 75, 12, 88, 38, 62]) {
      if (!used.has(candidate)) {
        position = candidate;
        break;
      }
    }
    const next: ColorStop = {
      id: createId(),
      color: sampleGradientColor(stops, position),
      position,
    };
    onChange(sortStops([...stops, next]));
    setSelectedId(next.id);
  }

  function removeSelected() {
    if (stops.length <= 2 || !selected) return;
    const next = stops.filter((stop) => stop.id !== selected.id);
    onChange(next);
    setSelectedId(next[0]?.id ?? "");
  }

  return (
    <div className="grid gap-2">
      <div
        ref={trackRef}
        className="relative h-7 cursor-crosshair rounded-[var(--dial-radius)]"
        style={{
          background: `linear-gradient(90deg, ${sortStops(stops)
            .map((stop) => `${stop.color} ${stop.position}%`)
            .join(", ")})`,
        }}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).dataset.stop) return;
          if (stops.length >= 8) return;
          const position = positionFromEvent(event);
          const next: ColorStop = {
            id: createId(),
            color: sampleGradientColor(stops, position),
            position,
          };
          onChange(sortStops([...stops, next]));
          setSelectedId(next.id);
        }}
      >
        {stops.map((stop) => (
          <button
            key={stop.id}
            type="button"
            data-stop="true"
            aria-label={`Stop ${stop.color} at ${Math.round(stop.position)}%`}
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80"
            style={{
              left: `${stop.position}%`,
              backgroundColor: stop.color,
              boxShadow:
                selected?.id === stop.id
                  ? "0 0 0 2px var(--dial-focus-ring)"
                  : "0 0 0 1px rgba(0,0,0,0.35)",
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSelectedId(stop.id);
              setDragId(stop.id);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (dragId !== stop.id) return;
              updateStop(stop.id, { position: positionFromEvent(event) });
            }}
            onPointerUp={() => setDragId(null)}
          />
        ))}
      </div>
      {selected ? (
        <ColorControl
          label="Stop color"
          value={selected.color}
          onChange={(color) => updateStop(selected.id, { color: cssColorToHex(color) })}
        />
      ) : null}
      <div className="dialkit-actions-group">
        <button
          type="button"
          className="dialkit-action-button"
          disabled={stops.length <= 2}
          onClick={removeSelected}
        >
          Remove stop
        </button>
        <button
          type="button"
          className="dialkit-action-button"
          disabled={stops.length >= 8}
          onClick={addStop}
        >
          Add stop
        </button>
      </div>
    </div>
  );
}
