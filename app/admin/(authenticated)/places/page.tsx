import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlacesTable, type PlaceRow } from "./places-table";

export const dynamic = "force-dynamic";

export default async function AdminPlacesPage() {
  await requireEditor();

  const [places, cats] = await Promise.all([
    prisma.place.findMany({
      include: {
        category: true,
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        discountCode: true,
      },
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const rows: PlaceRow[] = places.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    district: p.district,
    status: p.status,
    featured: p.featured,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    photoUrl: p.photos[0]?.url ?? null,
    discountCode: p.discountCode?.code ?? null,
  }));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Místa{" "}
          <span className="ml-1 text-base font-medium text-ink-light">
            ({places.length})
          </span>
        </h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/places/bulk"
            className="inline-flex items-center gap-2 rounded-[14px] border border-peach-strong/30 bg-peach/20 px-4 py-2 text-sm font-semibold text-peach-deep transition hover:bg-peach/40 sm:py-2.5"
          >
            ✨ <span className="hidden sm:inline">Hromadně přes AI</span>
            <span className="sm:hidden">Hromadně</span>
          </Link>
          <Link
            href="/admin/places/new"
            className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-4 py-2 text-sm font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 hover:shadow-soft-lg sm:px-5 sm:py-2.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            <span className="hidden sm:inline">Nové místo</span>
            <span className="sm:hidden">Nové</span>
          </Link>
        </div>
      </div>

      <PlacesTable rows={rows} categories={cats} />
    </>
  );
}
