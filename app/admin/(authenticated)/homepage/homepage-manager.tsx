"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { setFeatured } from "./actions";

type Cat = { slug: string; name: string };
type Row = {
  id: string;
  name: string;
  slug: string;
  district: string | null;
  featured: boolean;
  categorySlug: string;
  categoryName: string;
  photoUrl: string | null;
};

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function HomepageManager({
  places,
  categories,
}: {
  places: Row[];
  categories: Cat[];
}) {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  const featuredCount = places.reduce(
    (sum, p) => sum + (optimistic[p.id] ?? p.featured ? 1 : 0),
    0,
  );

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return places.filter((p) => {
      if (activeCat !== "all" && p.categorySlug !== activeCat) return false;
      const isFeatured = optimistic[p.id] ?? p.featured;
      if (showFeaturedOnly && !isFeatured) return false;
      if (q.length === 0) return true;
      return normalize(`${p.name} ${p.district ?? ""}`).includes(q);
    });
  }, [places, query, activeCat, showFeaturedOnly, optimistic]);

  function toggle(id: string) {
    const current = optimistic[id] ?? places.find((p) => p.id === id)?.featured;
    const next = !current;
    setOptimistic((prev) => ({ ...prev, [id]: next }));
    startTransition(async () => {
      const res = await setFeatured(id, next);
      if (!res.ok) {
        // Revert on error
        setOptimistic((prev) => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
        alert(res.error ?? "Chyba.");
      }
    });
  }

  const perCategoryCount = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of categories) out[c.slug] = 0;
    for (const p of places) {
      if (optimistic[p.id] ?? p.featured) {
        out[p.categorySlug] = (out[p.categorySlug] ?? 0) + 1;
      }
    }
    return out;
  }, [places, categories, optimistic]);

  return (
    <>
      {/* Filter bar */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-light"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat místo…"
            className="w-full rounded-xl border border-line bg-card pl-10 pr-4 py-2.5 text-sm text-ink shadow-soft outline-none placeholder:text-ink-light focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
            label="Vše"
            count={places.length}
          />
          {categories.map((c) => (
            <Chip
              key={c.slug}
              active={activeCat === c.slug}
              onClick={() => setActiveCat(c.slug)}
              label={c.name}
              count={
                <span>
                  {perCategoryCount[c.slug] ?? 0}
                  <span className="text-ink-light">
                    /{places.filter((p) => p.categorySlug === c.slug).length}
                  </span>
                </span>
              }
            />
          ))}

          <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-muted">
            <input
              type="checkbox"
              checked={showFeaturedOnly}
              onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-line-hover text-peach-strong focus:ring-peach-strong/30"
            />
            Jen doporučené ({featuredCount})
          </label>
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="rounded-card-lg border border-line bg-card p-10 text-center text-ink-muted shadow-soft">
          Nic neodpovídá výběru.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const isFeatured = optimistic[p.id] ?? p.featured;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                disabled={pending}
                className={
                  "group flex items-center gap-3 rounded-card-lg border bg-card p-3 text-left shadow-soft transition disabled:opacity-50 " +
                  (isFeatured
                    ? "border-peach-strong/50 ring-2 ring-peach-strong/30"
                    : "border-line hover:border-line-hover hover:bg-surface")
                }
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-surface ring-1 ring-line">
                  {p.photoUrl ? (
                    <Image
                      src={p.photoUrl}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                  {isFeatured ? (
                    <span className="absolute right-1 top-1 rounded-full bg-peach-strong px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      ⭐
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink group-hover:text-peach-strong">
                    {p.name}
                  </p>
                  <p className="truncate text-xs text-ink-light">
                    {p.categoryName}
                    {p.district ? ` · ${p.district}` : ""}
                  </p>
                </div>
                <div
                  className={
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition " +
                    (isFeatured
                      ? "bg-gradient-to-r from-peach-strong to-rose-strong text-white shadow-soft"
                      : "border border-line-hover bg-card text-ink-light")
                  }
                  aria-label={isFeatured ? "Doporučené" : "Nedoporučené"}
                >
                  {isFeatured ? "✓" : "+"}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-ink-light">
        Tip: Filtrem zobraz <strong>Jen doporučené</strong> a uvidíš co
        právě je na HP. <Link href="/" className="underline">Otevřít HP</Link>.
      </p>
    </>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-peach-strong to-rose-strong px-3.5 py-1.5 text-xs font-semibold text-white shadow-soft"
          : "inline-flex items-center gap-1.5 rounded-full border border-line-hover bg-card px-3.5 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
      }
    >
      {label}
      <span className={active ? "text-white/80" : "text-ink-light"}>
        {count}
      </span>
    </button>
  );
}
