import "server-only";
import type { Place } from "@/lib/places";

export type RecommendInput = {
  query: string;
  categories: string[]; // category slugs the user picked
  subcategories: string[]; // subcategory slugs the user picked
};

export type Scored = { place: Place; score: number; reasons: string[] };

/**
 * Pure scoring with OR semantics across category/subcategory filters:
 * a place qualifies if it matches ANY chosen category OR ANY chosen
 * subcategory. If neither set is provided we keep all places.
 * Ranking adds keyword weight from the free-text query.
 */
export function recommend(places: Place[], input: RecommendInput): Scored[] {
  const cats = new Set(input.categories);
  const subs = new Set(input.subcategories);

  const filtered = places.filter((p) => {
    if (cats.size === 0 && subs.size === 0) return true;
    if (cats.size > 0 && cats.has(p.category)) return true;
    if (subs.size > 0 && p.subcategory && subs.has(p.subcategory)) return true;
    return false;
  });

  const tokens = tokenize(input.query);
  const scored: Scored[] = [];
  for (const p of filtered) {
    const reasons: string[] = [];
    let score = 0;
    if (cats.has(p.category)) {
      score += 4;
      reasons.push("kategorie");
    }
    if (p.subcategory && subs.has(p.subcategory)) {
      score += 4;
      reasons.push("typ");
    }
    if (tokens.length > 0) {
      const haystackBits = [
        [p.name, 5, "název"] as const,
        [p.shortDesc, 1, "popis"] as const,
        [p.district, 2, "lokalita"] as const,
        [p.tags.join(" "), 3, "tagy"] as const,
      ];
      for (const t of tokens) {
        for (const [text, weight, label] of haystackBits) {
          if (!text) continue;
          if (normalize(text).includes(t)) {
            score += weight;
            if (!reasons.includes(label)) reasons.push(label);
          }
        }
      }
      // Drop entries that don't match query when one was provided AND
      // no category/subcategory filter was set
      if (
        cats.size === 0 &&
        subs.size === 0 &&
        score === 0
      )
        continue;
    }
    scored.push({ place: p, score, reasons });
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
