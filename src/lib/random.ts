import type { WeightedMap } from "../types";

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function pickWeighted<T extends { weight: number }>(items: readonly T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;

  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }

  return items[items.length - 1];
}

export function pickFromWeightedMap(map: WeightedMap): string {
  const entries = Object.entries(map);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let r = Math.random() * total;

  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }

  return entries[entries.length - 1][0];
}
