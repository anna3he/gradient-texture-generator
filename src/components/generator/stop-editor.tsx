"use client";

import { useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createId, draftHex, normalizeHex } from "@/lib/color";
import { sampleGradientColor, sortStops } from "@/lib/harmony";
import type { ColorStop } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const [hexDraft, setHexDraft] = useState<{ id: string; value: string } | null>(
    null
  );
  const selected = stops.find((stop) => stop.id === selectedId) ?? stops[0];
  const hexValue =
    hexDraft && selected && hexDraft.id === selected.id
      ? hexDraft.value
      : (selected?.color ?? "");

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
    const merged = sortStops([...stops, next]);
    onChange(merged);
    setSelectedId(next.id);
  }

  function removeSelected() {
    if (stops.length <= 2 || !selected) return;
    const next = stops.filter((stop) => stop.id !== selected.id);
    onChange(next);
    setSelectedId(next[0]?.id ?? "");
  }

  return (
    <div className="grid gap-3">
      <div
        ref={trackRef}
        className="relative h-8 cursor-crosshair rounded-lg ring-1 ring-white/10"
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
            className={cn(
              "absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]",
              selected?.id === stop.id
                ? "z-10 border-white"
                : "border-white/70 hover:border-white"
            )}
            style={{ left: `${stop.position}%`, backgroundColor: stop.color }}
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

      <div className="flex items-center gap-2">
        <label className="relative size-8 shrink-0 overflow-hidden rounded-md ring-1 ring-white/15">
          <input
            type="color"
            className="absolute inset-0 size-[150%] -translate-x-1/8 -translate-y-1/8 cursor-pointer"
            value={
              normalizeHex(selected?.color ?? "#888888", { short: false }) ??
              "#888888"
            }
            onChange={(event) => {
              if (!selected) return;
              const color = event.target.value;
              setHexDraft(null);
              updateStop(selected.id, { color });
            }}
          />
        </label>
        <Input
          value={hexValue}
          spellCheck={false}
          className="h-8 font-mono text-[12px] uppercase"
          onChange={(event) => {
            if (!selected) return;
            const next = draftHex(event.target.value);
            setHexDraft({ id: selected.id, value: next });
            const complete = normalizeHex(next, { short: false });
            if (complete) updateStop(selected.id, { color: complete });
          }}
          onBlur={() => {
            if (!selected) return;
            const complete = normalizeHex(hexValue);
            if (complete) {
              updateStop(selected.id, { color: complete });
            }
            setHexDraft(null);
          }}
        />
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={stops.length <= 2}
            onClick={removeSelected}
            aria-label="Remove stop"
          >
            <Minus />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={stops.length >= 8}
            onClick={addStop}
            aria-label="Add stop"
          >
            <Plus />
          </Button>
        </div>
      </div>
    </div>
  );
}
