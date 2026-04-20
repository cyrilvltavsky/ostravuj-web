import Image from "next/image";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CategoryRow } from "./category-row";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireSuperAdmin();

  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { places: true } } },
  });

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">
            Kategorie
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Pořadí ovlivňuje navigaci i homepage. Smazat lze jen prázdnou
            kategorii.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-5 py-2.5 text-sm font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Nová kategorie
        </Link>
      </div>

      <div className="overflow-hidden rounded-card-lg border border-line bg-card shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs font-bold uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3 w-16">Pořadí</th>
              <th className="px-4 py-3">Název / Slug</th>
              <th className="px-4 py-3">Míst</th>
              <th className="px-4 py-3 text-right">Akce</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c, idx) => (
              <tr
                key={c.id}
                className="border-t border-line transition-colors hover:bg-surface/50"
              >
                <td className="px-4 py-3 font-mono text-xs text-ink-light">
                  {c.sortOrder}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.imageUrl ? (
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface">
                        <Image
                          src={c.imageUrl}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-14 shrink-0 rounded-md bg-surface" />
                    )}
                    <div>
                      <p className="font-semibold text-ink">{c.name}</p>
                      <p className="font-mono text-xs text-ink-light">
                        /{c.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {c._count.places}
                </td>
                <td className="px-4 py-3 text-right">
                  <CategoryRow
                    id={c.id}
                    name={c.name}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < cats.length - 1}
                    placeCount={c._count.places}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
