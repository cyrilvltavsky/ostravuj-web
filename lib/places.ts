// Types + tiny pure helpers shared by server + client.
// Data now lives in the database — see lib/queries/places.ts.

export type CategorySlug = "gastro" | "aktivity" | "rande" | "zdarma";

export type SubcategorySlug =
  | "restaurace"
  | "bistro"
  | "kavarna"
  | "hospoda"
  | "galerie"
  | "pamatka"
  | "rodina"
  | "vyhlidka";

export type PlaceContacts = {
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
};

export type Place = {
  id: number;
  slug: string;
  name: string;
  category: CategorySlug;
  subcategory: SubcategorySlug;
  tags: string[];
  address: string;
  district: string;
  shortDesc: string;
  discountCode: string | null;
  image: string;
  youtubeUrl?: string | null;
  contacts?: PlaceContacts;
  showContacts?: boolean;
};

export type CategoryMeta = {
  slug: CategorySlug;
  title: string;
  subtitle: string;
  eyebrow: string;
  description: string;
  emoji: string;
  iconBg: string;
  image: string;
};

export const SUBCATEGORY_LABELS: Record<SubcategorySlug, string> = {
  restaurace: "Restaurace",
  bistro: "Bistro",
  kavarna: "Kavárna",
  hospoda: "Hospoda",
  galerie: "Galerie",
  pamatka: "Památka",
  rodina: "Rodina",
  vyhlidka: "Vyhlídka",
};

// ───────────── Pure helpers (safe in client + server) ─────────────

export function googleMapsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function mapyComUrl(address: string): string {
  return `https://mapy.com/zakladni?q=${encodeURIComponent(address)}`;
}

export function hasVisibleContacts(place: Place): boolean {
  if (place.showContacts === false) return false;
  const c = place.contacts;
  if (!c) return false;
  return Boolean(c.phone || c.email || c.website || c.instagram || c.facebook);
}

/** Extracts a YouTube video ID from any common URL form. */
export function youtubeIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // short URL
    /\/embed\/([A-Za-z0-9_-]{11})/, // embed URL
    /\/shorts\/([A-Za-z0-9_-]{11})/, // shorts
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  // Bare 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}
