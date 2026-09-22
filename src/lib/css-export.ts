import type { GeneratorState } from "./types";
import { exportPixelSize } from "./export-size";
import { arcCssLayers } from "./field-gradient";
import { motionDurationSec } from "./motion";
import { paletteToStops, sortStops } from "./palette";

export { exportPixelSize };

function round(value: number) {
  return Number(value.toFixed(1));
}

function stopList(state: GeneratorState, animated = false) {
  return sortStops(paletteToStops(state.palette, state.gradientType))
    .map((stop, index, list) => {
      const isEnd = index === 0 || index === list.length - 1;
      if (animated && !isEnd) {
        return `${stop.color} var(--vellum-s${index})`;
      }
      return `${stop.color} ${round(stop.position)}%`;
    })
    .join(", ");
}

export function gradientCss(state: GeneratorState, animated = false) {
  const stops = stopList(state, animated);
  const angle = `${round(state.angle)}deg`;

  switch (state.gradientType) {
    case "radial":
      return `radial-gradient(circle at 50% 50%, ${stops})`;
    case "arc":
      return arcCssLayers(state.palette);
    default:
      return `linear-gradient(${angle}, ${stops})`;
  }
}

export function exportCssSnippet(state: GeneratorState) {
  const duration = motionDurationSec(state.motion.speed);
  const lines: string[] = [`/* Vellum · ${state.presetId} ${state.gradientType} */`];
  const stops = sortStops(paletteToStops(state.palette, state.gradientType));
  const animateStops =
    state.motion.playing && (state.gradientType === "linear" || state.gradientType === "radial");

  if (state.gradientType === "arc") {
    lines.push(`/* Arc mesh approximated in CSS. PNG is the source of truth. */`);
  }

  if (animateStops) {
    stops.forEach((stop, index) => {
      if (index === 0 || index === stops.length - 1) return;
      lines.push(
        `@property --vellum-s${index} {`,
        `  syntax: "<percentage>";`,
        `  inherits: false;`,
        `  initial-value: ${round(stop.position)}%;`,
        `}`
      );
    });
  }

  lines.push(`.surface {`);
  lines.push(`  background: ${gradientCss(state, animateStops)};`);
  lines.push(`  background-color: ${state.palette.wash.color};`);

  if (animateStops) {
    stops.forEach((stop, index) => {
      if (index === 0 || index === stops.length - 1) return;
      lines.push(`  --vellum-s${index}: ${round(stop.position)}%;`);
    });
    lines.push(`  animation: vellum-move ${duration}s ease-in-out infinite alternate;`);
  }

  if (state.grain.enabled && state.grain.opacity > 0) {
    lines.push(`  /* Grain @ ${round(state.grain.opacity)}% */`);
  }

  lines.push(`}`);

  if (animateStops) {
    const start = stops
      .map((stop, index) => {
        if (index === 0 || index === stops.length - 1) return null;
        return `--vellum-s${index}: ${round(Math.max(6, stop.position - 4))}%`;
      })
      .filter(Boolean)
      .join("; ");
    const end = stops
      .map((stop, index) => {
        if (index === 0 || index === stops.length - 1) return null;
        return `--vellum-s${index}: ${round(Math.min(94, stop.position + 4))}%`;
      })
      .filter(Boolean)
      .join("; ");
    lines.push(
      `@keyframes vellum-move {`,
      `  from { ${start}; }`,
      `  to { ${end}; }`,
      `}`
    );
  }

  return lines.join("\n");
}
