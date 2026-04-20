import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    placeCount,
    publishedCount,
    draftCount,
    archivedCount,
    suggestionCount,
    newSuggestions,
    recentDrafts,
    recentSuggestions,
  ] = await Promise.all([
    prisma.place.count(),
    prisma.place.count({ where: { status: "PUBLISHED" } }),
    prisma.place.count({ where: { status: "DRAFT" } }),
    prisma.place.count({ where: { status: "ARCHIVED" } }),
    prisma.suggestion.count(),
    prisma.suggestion.count({ where: { status: "NEW" } }),
    prisma.place.findMany({
      where: { status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, updatedAt: true },
    }),
    prisma.suggestion.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, placeName: true, contactName: true, createdAt: true },
    }),
  ]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Přehled
        </h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/places/new"
            className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-5 py-2.5 text-sm font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Nové místo
          </Link>
          <Link
            href="/admin/places"
            className="inline-flex items-center gap-2 rounded-[14px] border border-line-hover bg-white px-5 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
          >
            Spravovat místa →
          </Link>
        </div>
      </div>

      {/* COUNTS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Publikováno"
          value={publishedCount}
          tone="mint"
          href="/admin/places"
        />
        <StatCard
          label="Koncepty"
          value={draftCount}
          tone="peach"
          href="/admin/places"
          highlight={draftCount > 0}
        />
        <StatCard
          label="Archivované"
          value={archivedCount}
          tone="ink"
          href="/admin/places"
        />
        <StatCard
          label="Nové návrhy"
          value={newSuggestions}
          tone={newSuggestions > 0 ? "rose" : "ink"}
          href="/admin/suggestions"
          highlight={newSuggestions > 0}
        />
      </div>

      {/* WORKFLOWS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Rozpracované koncepty"
          empty="Žádné koncepty. Začni psát nové místo a klikni „Uložit jako koncept&quot;."
          items={recentDrafts.map((d) => ({
            key: d.id,
            href: `/admin/places/${d.id}/edit`,
            primary: d.name,
            secondary: relativeTime(d.updatedAt),
          }))}
          footerHref="/admin/places"
          footerLabel="Vše →"
        />
        <Panel
          title={`Nové návrhy od uživatelů (${newSuggestions})`}
          empty="Žádné nové návrhy."
          items={recentSuggestions.map((s) => ({
            key: s.id,
            href: `/admin/suggestions/${s.id}`,
            primary: s.placeName,
            secondary: `${s.contactName} · ${relativeTime(s.createdAt)}`,
          }))}
          footerHref="/admin/suggestions"
          footerLabel="Schránka →"
        />
      </div>

      <p className="mt-8 text-xs text-ink-light">
        Celkem v databázi: <strong className="text-ink-muted">{placeCount}</strong>{" "}
        míst · <strong className="text-ink-muted">{suggestionCount}</strong>{" "}
        návrhů.
      </p>
    </>
  );
}

function relativeTime(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "právě teď";
  if (min < 60) return `před ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `před ${h} h`;
  const days = Math.floor(h / 24);
  return `před ${days} d`;
}

const TONE: Record<
  "mint" | "peach" | "rose" | "ink",
  { bg: string; text: string }
> = {
  mint: { bg: "bg-mint/40", text: "text-mint-deep" },
  peach: { bg: "bg-peach/40", text: "text-peach-deep" },
  rose: { bg: "bg-rose/40", text: "text-rose-strong" },
  ink: { bg: "bg-surface", text: "text-ink-light" },
};

function StatCard({
  label,
  value,
  tone,
  href,
  highlight,
}: {
  label: string;
  value: number;
  tone: keyof typeof TONE;
  href: string;
  highlight?: boolean;
}) {
  const t = TONE[tone];
  return (
    <Link
      href={href as `/admin${string}`}
      className={`group rounded-card-lg border bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-md ${highlight ? "border-peach-strong/40" : "border-line"}`}
    >
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${t.bg} ${t.text}`}
      >
        {label}
      </span>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
        {value}
      </p>
    </Link>
  );
}

function Panel({
  title,
  items,
  empty,
  footerHref,
  footerLabel,
}: {
  title: string;
  items: { key: string; href: string; primary: string; secondary: string }[];
  empty: string;
  footerHref: string;
  footerLabel: string;
}) {
  return (
    <section className="rounded-card-lg border border-line bg-white p-6 shadow-soft">
      <h2 className="mb-4 text-base font-bold text-ink">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.key}>
              <Link
                href={it.href as `/admin${string}`}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-surface"
              >
                <span className="font-semibold text-ink">{it.primary}</span>
                <span className="text-xs text-ink-light">{it.secondary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={footerHref as `/admin${string}`}
        className="mt-4 inline-block text-sm font-semibold text-ink-muted transition hover:text-ink"
      >
        {footerLabel}
      </Link>
    </section>
  );
}
