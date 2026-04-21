import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HomepageManager } from "./homepage-manager";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  await requireEditor();

  const [categories, places] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, name: true },
    }),
    prisma.place.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        district: true,
        featured: true,
        category: { select: { slug: true, name: true } },
        photos: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { url: true },
        },
      },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const totalFeatured = places.filter((p) => p.featured).length;

  return (
    <>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Homepage
      </h1>
      <p className="mb-6 text-sm text-ink-muted">
        Vyber místa, která se mají zobrazit v sekci Doporučená místa
        na hlavní stránce. Z většího výběru web zobrazuje 12 míst na
        stránku a dál stránkuje. Aktuálně doporučeno:{" "}
        <strong className="text-ink">{totalFeatured}</strong>.
      </p>

      <HomepageManager
        places={places.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          district: p.district,
          featured: p.featured,
          categorySlug: p.category.slug,
          categoryName: p.category.name,
          photoUrl: p.photos[0]?.url ?? null,
        }))}
        categories={categories.map((c) => ({
          slug: c.slug,
          name: c.name,
        }))}
      />
    </>
  );
}
