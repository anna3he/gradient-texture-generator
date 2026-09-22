import type { GeneratorState } from "./types";
import { sortStops } from "./harmony";
import { TEXTURE_BY_ID } from "./textures";

function stopList(state: GeneratorState) {
  return sortStops(state.stops)
    .map((stop) => `${stop.color} ${round(stop.position)}%`)
    .join(", ");
}

function round(value: number) {
  return Number(value.toFixed(1));
}

export function gradientCss(state: GeneratorState) {
  const stops = stopList(state);

  switch (state.gradientType) {
    case "radial":
      return `radial-gradient(circle at 50% 50%, ${stops})`;
    case "conic":
      return `conic-gradient(from ${round(state.angle)}deg at 50% 50%, ${stops})`;
    default:
      return `linear-gradient(${round(state.angle)}deg, ${stops})`;
  }
}

export function exportCssSnippet(state: GeneratorState) {
  const gradient = gradientCss(state);
  const texture =
    state.texture.id !== "none" ? TEXTURE_BY_ID[state.texture.id] : null;
  const lines = [
    `/* Vellum · ${state.harmony} ${state.gradientType} */`,
    `.surface {`,
    `  background: ${gradient};`,
  ];

  if (texture && state.texture.opacity > 0) {
    lines.push(
      `  /* Texture: ${texture.name} @ ${round(state.texture.opacity)}% ${state.texture.blend} */`
    );
  }

  if (state.grain.opacity > 0 && state.grain.intensity > 0) {
    lines.push(
      `  /* Grain: intensity ${round(state.grain.intensity)}, size ${round(state.grain.size)}, ${state.grain.colored ? "colored" : "mono"} */`
    );
  }

  lines.push(`}`);
  return lines.join("\n");
}
