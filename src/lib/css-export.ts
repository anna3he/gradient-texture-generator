import type { GeneratorState } from "./types";
import { exportPixelSize } from "./export-size";
import { motionDurationSec } from "./motion";
import { paletteToStops, sortStops } from "./palette";

export { exportPixelSize };

function stopList(state: GeneratorState) {
  return sortStops(paletteToStops(state.palette))
    .map((stop) => `${stop.color} ${round(stop.position)}%`)
    .join(", ");
}

function round(value: number) {
  return Number(value.toFixed(1));
}

function origin(state: GeneratorState) {
  return `${round(state.motion.originX)}% ${round(state.motion.originY)}%`;
}

function arcCss(state: GeneratorState, animated = false) {
  const glowAt = animated ? "var(--vellum-gx) var(--vellum-gy)" : `${round(state.palette.glow.x)}% ${round(state.palette.glow.y)}%`;
  const deepAt = animated ? "var(--vellum-dx) var(--vellum-dy)" : `${round(state.palette.deep.x)}% ${round(state.palette.deep.y)}%`;
  return [
    `radial-gradient(circle at ${glowAt}, ${state.palette.glow.color} 0%, transparent 34%)`,
    `radial-gradient(circle at ${deepAt}, ${state.palette.deep.color} 0%, transparent 16%)`,
    `linear-gradient(${round(state.angle)}deg, ${stopList(state)})`,
  ].join(", ");
}

export function gradientCss(state: GeneratorState, animated = false) {
  const stops = stopList(state);
  const at = animated ? "var(--vellum-x) var(--vellum-y)" : origin(state);
  const angle = animated ? "var(--vellum-angle)" : `${round(state.angle)}deg`;

  switch (state.gradientType) {
    case "radial":
      return `radial-gradient(circle at ${at}, ${stops})`;
    case "arc":
      return arcCss(state, animated);
    default:
      return `linear-gradient(${angle}, ${stops})`;
  }
}

export function exportCssSnippet(state: GeneratorState) {
  const duration = motionDurationSec(state.motion.speed);
  const lines: string[] = [
    `/* Vellum · ${state.presetId} ${state.gradientType} */`,
  ];

  if (state.gradientType === "arc") {
    lines.push(`/* Arc field approximated in CSS. PNG is the source of truth. */`);
  }

  if (state.motion.playing) {
    lines.push(
      `@property --vellum-angle {`,
      `  syntax: "<angle>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.angle)}deg;`,
      `}`,
      `@property --vellum-x {`,
      `  syntax: "<percentage>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.motion.originX)}%;`,
      `}`,
      `@property --vellum-y {`,
      `  syntax: "<percentage>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.motion.originY)}%;`,
      `}`,
      `@property --vellum-gx {`,
      `  syntax: "<percentage>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.palette.glow.x)}%;`,
      `}`,
      `@property --vellum-gy {`,
      `  syntax: "<percentage>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.palette.glow.y)}%;`,
      `}`,
      `@property --vellum-dx {`,
      `  syntax: "<percentage>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.palette.deep.x)}%;`,
      `}`,
      `@property --vellum-dy {`,
      `  syntax: "<percentage>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.palette.deep.y)}%;`,
      `}`
    );
  }

  lines.push(`.surface {`);
  lines.push(`  background: ${gradientCss(state, state.motion.playing)};`);
  lines.push(`  background-color: ${state.palette.wash.color};`);

  if (state.motion.playing) {
    lines.push(
      `  --vellum-angle: ${round(state.angle)}deg;`,
      `  --vellum-x: ${round(state.motion.originX)}%;`,
      `  --vellum-y: ${round(state.motion.originY)}%;`,
      `  --vellum-gx: ${round(state.palette.glow.x)}%;`,
      `  --vellum-gy: ${round(state.palette.glow.y)}%;`,
      `  --vellum-dx: ${round(state.palette.deep.x)}%;`,
      `  --vellum-dy: ${round(state.palette.deep.y)}%;`,
      `  animation: vellum-move ${duration}s ease-in-out infinite alternate;`
    );
  }

  if (state.grain.enabled && state.grain.opacity > 0) {
    lines.push(`  /* Grain @ ${round(state.grain.opacity)}% */`);
  }

  lines.push(`}`);

  if (state.motion.playing) {
    const glow = state.palette.glow;
    const deep = state.palette.deep;
    lines.push(
      `@keyframes vellum-move {`,
      `  0% { --vellum-angle: ${round(state.angle)}deg; --vellum-x: ${round(clampPct(state.motion.originX - 8))}%; --vellum-y: ${round(clampPct(state.motion.originY + 10))}%; --vellum-gx: ${round(clampPct(glow.x - 12))}%; --vellum-gy: ${round(clampPct(glow.y + 14))}%; --vellum-dx: ${round(clampPct(deep.x + 8))}%; --vellum-dy: ${round(clampPct(deep.y - 10))}%; }`,
      `  100% { --vellum-angle: ${round(state.angle + 24)}deg; --vellum-x: ${round(clampPct(state.motion.originX + 8))}%; --vellum-y: ${round(clampPct(state.motion.originY - 10))}%; --vellum-gx: ${round(clampPct(glow.x + 14))}%; --vellum-gy: ${round(clampPct(glow.y - 12))}%; --vellum-dx: ${round(clampPct(deep.x - 10))}%; --vellum-dy: ${round(clampPct(deep.y + 8))}%; }`,
      `}`
    );
  }

  return lines.join("\n");
}

function clampPct(value: number) {
  return Math.min(96, Math.max(4, value));
}
