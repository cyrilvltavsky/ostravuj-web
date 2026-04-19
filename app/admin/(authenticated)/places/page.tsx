import Image from "next/image";
import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

      <div className="overflow-hidden rounded-card-lg border border-line bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs font-bold uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-6 py-3">Název</th>
              <th className="px-6 py-3">Kategorie</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Sleva</th>
              <th className="px-6 py-3 text-right">Akce</th>
            </tr>
          </thead>
          <tbody>
            {places.map((p) => (
              <tr
                key={p.id}
                className="border-t border-line transition-colors hover:bg-surface/50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.photos[0] ? (
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface">
                        <Image
                          src={p.photos[0].url}
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
                      <p className="font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-light">
                        {p.district || "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-ink-muted">{p.category.name}</td>
                <td className="px-6 py-4">
                  {p.status === "PUBLISHED" ? (
                    <span className="rounded-full bg-mint/40 px-2.5 py-1 text-[11px] font-bold uppercase text-mint-deep">
                      Publikované
                    </span>
                  ) : (
                    <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold uppercase text-ink-light">
                      Archivované
                    </span>
                  )}
                  {p.featured ? (
                    <span className="ml-1.5 rounded-full bg-peach/40 px-2.5 py-1 text-[11px] font-bold uppercase text-peach-deep">
                      ⭐
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4 font-mono text-xs">
                  {p.discountCode?.code ?? (
                    <span className="text-ink-light">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/places/${p.id}/edit`}
                    className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
                  >
                    Upravit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
