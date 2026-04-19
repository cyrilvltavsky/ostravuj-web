import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [placeCount, suggestionCount, newSuggestions] = await Promise.all([
    prisma.place.count(),
    prisma.suggestion.count(),
    prisma.suggestion.count({ where: { status: "NEW" } }),
  ]);

  return (
    <>
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-ink">
        Přehled
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/places"
          className="group rounded-card-lg border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft-md"
        >
          <p className="mb-1 text-sm font-medium text-ink-muted">Místa</p>
          <p className="text-3xl font-extrabold text-ink">{placeCount}</p>
          <p className="mt-3 text-sm text-ink-muted group-hover:text-ink">
            Správa míst →
          </p>
        </Link>

        <Link
          href="/admin/suggestions"
          className="group rounded-card-lg border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft-md"
        >
          <p className="mb-1 text-sm font-medium text-ink-muted">
            Návrhy od uživatelů
          </p>
          <p className="text-3xl font-extrabold text-ink">
            {suggestionCount}
            {newSuggestions > 0 ? (
              <span className="ml-2 rounded-full bg-peach-strong px-2 py-1 align-middle text-xs font-bold text-white">
                {newSuggestions} nové
              </span>
            ) : null}
          </p>
          <p className="mt-3 text-sm text-ink-muted group-hover:text-ink">
            Schránka návrhů →
          </p>
        </Link>
      </div>
    </>
  );
}
