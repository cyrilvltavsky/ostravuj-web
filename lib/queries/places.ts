import "server-only";
import { prisma } from "@/lib/prisma";
import type { CategorySlug, CategoryMeta, Place } from "@/lib/places";

/**
 * Server-only Prisma queries for public + admin reads.
 * Returns view models compatible with the existing `Place` / `CategoryMeta`
 * shapes from `lib/places.ts` so the frontend renders unchanged.
 */

type PlaceWithRelations = Awaited<ReturnType<typeof loadPlace>>;

function loadPlace(slug: string) {
  return prisma.place.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      photos: { orderBy: { sortOrder: "asc" } },
      discountCode: true,
    },
  });
}

function toPlaceView(p: NonNullable<PlaceWithRelations>): Place {
  const mainPhoto = p.photos[0]?.url ?? "";
  // Prefer the multi-value subcategories array; fall back to legacy field
  const firstSub = p.subcategories[0] ?? p.subcategory ?? "restaurace";
  // Full list for multi-subcategory filtering on the frontend
  const allSubs =
    p.subcategories.length > 0
      ? p.subcategories
      : p.subcategory
        ? [p.subcategory]
        : [];

  return {
    id: 0,
    slug: p.slug,
    name: p.name,
    category: p.category.slug as CategorySlug,
    subcategory: firstSub as Place["subcategory"],
    subcategories: allSubs,
    tags: p.tags,
    address: p.address,
    district: p.district ?? "",
    shortDesc: p.shortDesc,
    discountCode: p.showDiscount ? (p.discountCode?.code ?? null) : null,
    image: mainPhoto,
    youtubeUrl: p.youtubeUrl ?? null,
    contacts: {
      phone: p.phone ?? undefined,
      email: p.email ?? undefined,
      website: p.website ?? undefined,
      instagram: p.instagram ?? undefined,
      facebook: p.facebook ?? undefined,
    },
    showContacts: p.showContacts,
  };
}

export async function getAllCategories(): Promise<CategoryMeta[]> {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return cats.map((c) => ({
    slug: c.slug as CategorySlug,
    title: c.name,
    subtitle: c.subtitle ?? "",
    eyebrow: c.eyebrow ?? "",
    description: c.description ?? "",
    emoji: c.emoji ?? "",
    iconBg: c.iconBg ?? "bg-surface",
    image: c.imageUrl ?? "",
  }));
}

export async function getAllPlaces(): Promise<Place[]> {
  const rows = await prisma.place.findMany({
    where: { status: "PUBLISHED" },
    include: {
      category: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      discountCode: true,
    },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
  });
  return rows.map((r) =>
    toPlaceView(r as unknown as NonNullable<PlaceWithRelations>),
  );
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  const p = await loadPlace(slug);
  if (!p) return null;
  return toPlaceView(p);
}

/** Returns ALL photos (gallery) for a place — used on detail page */
export async function getPlacePhotos(slug: string): Promise<string[]> {
  const p = await prisma.place.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  return p?.photos.map((ph) => ph.url) ?? [];
}

export async function getPlacesByCategory(
  categorySlug: CategorySlug,
): Promise<Place[]> {
  // Match on both the primary category AND the multi-value
  // categorySlugs array — admin can flag a place under several
  // top-level categories and it shows up in each listing.
  const rows = await prisma.place.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { category: { slug: categorySlug } },
        { categorySlugs: { has: categorySlug } },
      ],
    },
    include: {
      category: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      discountCode: true,
    },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
  });
  return rows.map((r) =>
    toPlaceView(r as unknown as NonNullable<PlaceWithRelations>),
  );
}

export async function getFeaturedPlaces(): Promise<Place[]> {
  const rows = await prisma.place.findMany({
    where: { status: "PUBLISHED", featured: true },
    include: {
      category: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      discountCode: true,
    },
    orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
  });
  return rows.map((r) =>
    toPlaceView(r as unknown as NonNullable<PlaceWithRelations>),
  );
}

/** All featured places — homepage shuffles on the client so order
 *  changes per visit. No pagination. */
export async function getAllFeaturedPlaces(): Promise<Place[]> {
  const rows = await prisma.place.findMany({
    where: { status: "PUBLISHED", featured: true },
    include: {
      category: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      discountCode: true,
    },
  });
  return rows.map((r) =>
    toPlaceView(r as unknown as NonNullable<PlaceWithRelations>),
  );
}

/**
 * Paginated featured places — used on the homepage.
 * Returns up to `pageSize` items at the given 1-based page index,
 * plus the total count for pagination UI.
 */
export async function getFeaturedPlacesPage(
  page: number,
  pageSize: number,
): Promise<{ items: Place[]; total: number; pageCount: number }> {
  const skip = Math.max(0, (page - 1) * pageSize);
  const [rows, total] = await Promise.all([
    prisma.place.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: {
        category: true,
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        discountCode: true,
      },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "asc" }],
      skip,
      take: pageSize,
    }),
    prisma.place.count({
      where: { status: "PUBLISHED", featured: true },
    }),
  ]);
  return {
    items: rows.map((r) =>
      toPlaceView(r as unknown as NonNullable<PlaceWithRelations>),
    ),
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  // Count places per category by primary categoryId OR membership in
  // the categorySlugs array — must match getPlacesByCategory's logic
  // so the badge counts on the homepage equal what the listing page
  // actually shows.
  const cats = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const out: Record<string, number> = {};
  for (const c of cats) {
    out[c.slug] = await prisma.place.count({
      where: {
        status: "PUBLISHED",
        OR: [{ categoryId: c.id }, { categorySlugs: { has: c.slug } }],
      },
    });
  }
  return out;
}

export async function getTotalPlaceCount(): Promise<number> {
  return prisma.place.count({ where: { status: "PUBLISHED" } });
}

export async function getSubcategoriesInCategory(
  categorySlug: CategorySlug,
): Promise<string[]> {
  const rows = await prisma.place.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { category: { slug: categorySlug } },
        { categorySlugs: { has: categorySlug } },
      ],
    },
    select: { subcategory: true, subcategories: true },
  });
  const all = new Set<string>();
  for (const r of rows) {
    for (const s of r.subcategories) {
      const trimmed = s.trim();
      if (trimmed) all.add(trimmed);
    }
    const single = r.subcategory?.trim();
    if (single) all.add(single);
  }
  return [...all];
}

/** Static slugs needed for `generateStaticParams` on detail page */
export async function getAllPlaceParams(): Promise<
  { category: string; slug: string }[]
> {
  const rows = await prisma.place.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, category: { select: { slug: true } } },
  });
  return rows.map((r) => ({ category: r.category.slug, slug: r.slug }));
}
