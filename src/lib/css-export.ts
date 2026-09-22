import type { GeneratorState } from "./types";
import { exportPixelSize } from "./export-size";
import { arcCssLayers } from "./field-gradient";
import { motionDurationSec } from "./motion";
import { paletteToStops, sortStops } from "./palette";

export { exportPixelSize };

function stopList(state: GeneratorState) {
  return sortStops(paletteToStops(state.palette, state.gradientType))
    .map((stop) => `${stop.color} ${round(stop.position)}%`)
    .join(", ");
}

function round(value: number) {
  return Number(value.toFixed(1));
}

export function gradientCss(state: GeneratorState, animated = false) {
  const stops = stopList(state);
  const angle = animated ? "var(--vellum-angle)" : `${round(state.angle)}deg`;

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

  if (state.gradientType === "arc") {
    lines.push(`/* Arc mesh approximated in CSS. PNG is the source of truth. */`);
  }

  if (state.motion.playing && state.gradientType === "linear") {
    lines.push(
      `@property --vellum-angle {`,
      `  syntax: "<angle>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.angle)}deg;`,
      `}`
    );
  }

  lines.push(`.surface {`);
  lines.push(`  background: ${gradientCss(state, state.motion.playing && state.gradientType === "linear")};`);
  lines.push(`  background-color: ${state.palette.wash.color};`);

  if (state.motion.playing && state.gradientType === "linear") {
    lines.push(
      `  --vellum-angle: ${round(state.angle)}deg;`,
      `  animation: vellum-move ${duration}s linear infinite;`
    );
  }

  if (state.grain.enabled && state.grain.opacity > 0) {
    lines.push(`  /* Grain @ ${round(state.grain.opacity)}% */`);
  }

  lines.push(`}`);

  if (state.motion.playing && state.gradientType === "linear") {
    lines.push(
      `@keyframes vellum-move {`,
      `  to { --vellum-angle: ${round(state.angle + 360)}deg; }`,
      `}`
    );
  }

  return lines.join("\n");
}
