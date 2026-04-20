import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlacesTable, type PlaceRow } from "./places-table";

export const dynamic = "force-dynamic";

export default async function AdminPlacesPage() {
  await requireEditor();

  const places = await prisma.place.findMany({
    include: {
      category: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      discountCode: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: PlaceRow[] = places.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    district: p.district,
    status: p.status,
    featured: p.featured,
    categoryName: p.category.name,
    photoUrl: p.photos[0]?.url ?? null,
    discountCode: p.discountCode?.code ?? null,
  }));

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Místa{" "}
          <span className="ml-2 text-base font-medium text-ink-light">
            ({places.length})
          </span>
        </h1>
        <Link
          href="/admin/places/new"
          className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-5 py-2.5 text-sm font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 hover:shadow-soft-lg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Nové místo
        </Link>
      </div>

      <PlacesTable rows={rows} />
    </>
  );
}
