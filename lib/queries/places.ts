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

  return {
    id: 0,
    slug: p.slug,
    name: p.name,
    category: p.category.slug as CategorySlug,
    subcategory: firstSub as Place["subcategory"],
    tags: p.tags,
    address: p.address,
    district: p.district ?? "",
    shortDesc: p.shortDesc,
    discountCode: p.showDiscount ? (p.discountCode?.code ?? null) : null,
    image: mainPhoto,
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
    orderBy: { createdAt: "asc" },
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
  // Match on the multi-value categorySlugs array (includes the primary
  // category) so a place can show up in multiple listings.
  const rows = await prisma.place.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { categorySlugs: { has: categorySlug } },
        { category: { slug: categorySlug } },
      ],
    },
    include: {
      category: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      discountCode: true,
    },
    orderBy: { createdAt: "asc" },
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
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) =>
    toPlaceView(r as unknown as NonNullable<PlaceWithRelations>),
  );
}

export async function getCategoryCounts(): Promise<
  Record<CategorySlug, number>
> {
  const grouped = await prisma.place.groupBy({
    by: ["categoryId"],
    where: { status: "PUBLISHED" },
    _count: true,
  });
  const cats = await prisma.category.findMany();
  const out: Record<CategorySlug, number> = {
    gastro: 0,
    aktivity: 0,
    rande: 0,
    zdarma: 0,
  };
  for (const g of grouped) {
    const slug = cats.find((c) => c.id === g.categoryId)?.slug as CategorySlug;
    if (slug) out[slug] = g._count;
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
        { categorySlugs: { has: categorySlug } },
        { category: { slug: categorySlug } },
      ],
    },
    select: { subcategory: true, subcategories: true },
  });
  const all = new Set<string>();
  for (const r of rows) {
    for (const s of r.subcategories) all.add(s);
    if (r.subcategory) all.add(r.subcategory);
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
