import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  NEW: { label: "Nový", cls: "bg-peach/40 text-peach-deep" },
  APPROVED: { label: "Schválený", cls: "bg-mint/40 text-mint-deep" },
  REJECTED: { label: "Zamítnutý", cls: "bg-surface text-ink-light" },
};

export default async function AdminSuggestionsPage() {
  await requireEditor();

  const suggestions = await prisma.suggestion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
        Návrhy od uživatelů{" "}
        <span className="ml-2 text-base font-medium text-ink-light">
          ({suggestions.length})
        </span>
      </h1>
      <p className="mb-8 text-sm text-ink-muted">
        Schránka tipů na nová místa. Každý nový návrh vyvolá notifikaci
        do e-mailu super-admina.
      </p>

      {suggestions.length === 0 ? (
        <div className="rounded-card-lg border border-line bg-card p-10 text-center text-ink-muted shadow-soft">
          Zatím žádné návrhy.
        </div>
      ) : (
        <div className="overflow-hidden rounded-card-lg border border-line bg-card shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-3">Název / Kategorie</th>
                <th className="px-6 py-3">Od koho</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Přijato</th>
                <th className="px-6 py-3 text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => {
                const status = STATUS_LABEL[s.status] ?? STATUS_LABEL.NEW;
                return (
                  <tr
                    key={s.id}
                    className="border-t border-line transition-colors hover:bg-surface/50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-ink">{s.placeName}</p>
                      <p className="text-xs text-ink-light">{s.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-ink">{s.contactName}</p>
                      <p className="text-xs text-ink-light">{s.contactEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-ink-light">
                      {s.createdAt.toLocaleString("cs-CZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/suggestions/${s.id}`}
                        className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
                      >
                        Otevřít
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
