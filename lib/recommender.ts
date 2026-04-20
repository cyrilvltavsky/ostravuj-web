import "server-only";
import type { Place } from "@/lib/places";

export type RecommendInput = {
  query: string;
  categories: string[]; // primary slug(s) the user picked
};

export type Scored = { place: Place; score: number; reasons: string[] };

/**
 * Pure scoring: filters by selected categories (if any), then ranks by
 * how many query keywords appear in name / shortDesc / tags / district.
 */
export function recommend(places: Place[], input: RecommendInput): Scored[] {
  const cats = new Set(input.categories);
  const filtered =
    cats.size === 0 ? places : places.filter((p) => cats.has(p.category));

  const tokens = tokenize(input.query);
  if (tokens.length === 0) {
    return filtered.map((p) => ({ place: p, score: 0, reasons: [] }));
  }

  const scored: Scored[] = [];
  for (const p of filtered) {
    const reasons: string[] = [];
    let score = 0;
    const haystackBits = [
      [p.name, 5, "název"] as const,
      [p.shortDesc, 1, "popis"] as const,
      [p.district, 2, "lokalita"] as const,
      [p.tags.join(" "), 3, "tagy"] as const,
    ];
    for (const t of tokens) {
      for (const [text, weight, label] of haystackBits) {
        if (!text) continue;
        const hit = normalize(text).includes(t);
        if (hit) {
          score += weight;
          if (!reasons.includes(label)) reasons.push(label);
        }
      }
    }
    if (score > 0) scored.push({ place: p, score, reasons });
  }

  scored.sort(
    (a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name),
  );
  return scored;
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(s: string): string[] {
  return normalize(s)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2);
}
