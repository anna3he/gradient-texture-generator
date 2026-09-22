"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function DialSlider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const display =
    step < 1 ? value.toFixed(step < 0.1 ? 2 : 1) : Math.round(value).toString();

  return (
    <div className={cn("grid gap-1.5", disabled && "opacity-45")}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] text-white/70">{label}</span>
        <span className="font-mono text-[11px] text-white/45">
          {display}
          {suffix}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        disabled={disabled}
        onValueChange={(next) => {
          const first = Array.isArray(next) ? next[0] : next;
          if (typeof first === "number") onChange(first);
        }}
      />
    </div>
  );
}
