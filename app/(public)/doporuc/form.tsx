"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Cat = { slug: string; name: string };

export function RecommenderForm({
  categories,
  defaultQuery,
  defaultSelected,
}: {
  categories: Cat[];
  defaultQuery: string;
  defaultSelected: string[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selected.length > 0) params.set("c", selected.join(","));
    const qs = params.toString();
    router.push(`/doporuc${qs ? `?${qs}` : ""}`);
  }

  function handleReset() {
    setQuery("");
    setSelected([]);
    router.push("/doporuc");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="q"
          className="mb-2 block text-sm font-semibold text-ink"
        >
          Co hledáš?
        </label>
        <input
          type="text"
          id="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="brunch, výhled, výběrová káva, romantika..."
          className="w-full rounded-xl border border-line bg-white px-5 py-3.5 text-[17px] text-ink shadow-soft outline-none transition-all placeholder:text-ink-light focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Kategorie</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = selected.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle(c.slug)}
                className={
                  active
                    ? "inline-flex items-center rounded-full bg-gradient-to-r from-peach-strong to-rose-strong px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                    : "inline-flex items-center rounded-full border border-line-hover bg-white px-5 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
                }
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-7 py-3 text-[15px] font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 hover:shadow-soft-lg"
        >
          Najít místa
        </button>
        {(defaultQuery || defaultSelected.length > 0) && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-[14px] border border-line-hover bg-white px-5 py-3 text-[15px] font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
          >
            Vyresetovat
          </button>
        )}
      </div>
    </form>
  );
}
