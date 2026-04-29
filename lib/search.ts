import type { CategoryMeta, Place } from "@/lib/places";

export type ScoredPlace = { place: Place; score: number };
export type ScoredCategory = { category: CategoryMeta; score: number };

/** Strip Czech diacritics + lowercase so that matching is forgiving. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Weighted relevance score for a place against the query.
 *  Returns 0 when nothing matches. Higher = better match. */
export function scorePlace(place: Place, query: string): number {
  const q = normalize(query);
  if (!q) return 0;

  // [field, weight] — multiple hits across fields stack.
  const fields: Array<[string | undefined | null, number]> = [
    [place.name, 10],
    [place.subcategory, 4],
    [place.district, 4],
    [place.address, 2],
    [place.shortDesc, 2],
    [place.category, 3],
    [place.subcategories.join(" "), 4],
    [place.tags.join(" "), 3],
  ];

  let score = 0;
  for (const [raw, weight] of fields) {
    if (!raw) continue;
    const text = normalize(raw);
    if (text === q) score += weight * 3;
    else if (text.startsWith(q)) score += weight * 2;
    else if (text.includes(q)) score += weight;
  }
  return score;
}

export function scoreCategory(cat: CategoryMeta, query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  const fields: Array<[string, number]> = [
    [cat.title, 10],
    [cat.slug, 8],
    [cat.subtitle, 3],
    [cat.eyebrow, 2],
    [cat.description, 1],
  ];
  let score = 0;
  for (const [raw, weight] of fields) {
    if (!raw) continue;
    const text = normalize(raw);
    if (text === q) score += weight * 3;
    else if (text.startsWith(q)) score += weight * 2;
    else if (text.includes(q)) score += weight;
  }
  return score;
}

/** Top-N scored places matching `query`. */
export function searchPlaces(
  places: Place[],
  query: string,
  limit = 12,
): ScoredPlace[] {
  if (!query.trim()) return [];
  return places
    .map((p) => ({ place: p, score: scorePlace(p, query) }))
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.place.name.localeCompare(b.place.name, "cs"),
    )
    .slice(0, limit);
}

/** Top-N scored categories matching `query`. */
export function searchCategories(
  categories: CategoryMeta[],
  query: string,
  limit = 4,
): ScoredCategory[] {
  if (!query.trim()) return [];
  return categories
    .map((c) => ({ category: c, score: scoreCategory(c, query) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Unique district names from places that match the query as substring. */
export function searchDistricts(
  places: Place[],
  query: string,
  limit = 6,
): string[] {
  if (!query.trim()) return [];
  const q = normalize(query);
  const set = new Set<string>();
  for (const p of places) {
    const d = p.district?.trim();
    if (d && normalize(d).includes(q)) set.add(d);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "cs")).slice(0, limit);
}
