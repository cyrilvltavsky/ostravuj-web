"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Cat = { slug: string; name: string };
type Sub = { slug: string; label: string };

export function RecommenderForm({
  categories,
  subcategories,
  defaultQuery,
  defaultSelectedCategories,
  defaultSelectedSubcategories,
}: {
  categories: Cat[];
  subcategories: Sub[];
  defaultQuery: string;
  defaultSelectedCategories: string[];
  defaultSelectedSubcategories: string[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [selectedCats, setSelectedCats] = useState<string[]>(
    defaultSelectedCategories,
  );
  const [selectedSubs, setSelectedSubs] = useState<string[]>(
    defaultSelectedSubcategories,
  );

  function toggle(list: string[], set: (n: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((s) => s !== value) : [...list, value]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCats.length > 0) params.set("c", selectedCats.join(","));
    if (selectedSubs.length > 0) params.set("s", selectedSubs.join(","));
    const qs = params.toString();
    router.push(`/doporuc${qs ? `?${qs}` : ""}`);
  }

  function handleReset() {
    setQuery("");
    setSelectedCats([]);
    setSelectedSubs([]);
    router.push("/doporuc");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          className="w-full rounded-xl border border-line bg-card px-5 py-3.5 text-[17px] text-ink shadow-soft outline-none transition-all placeholder:text-ink-light focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          Kategorie{" "}
          <span className="text-ink-light">— stačí splnit alespoň jednu</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = selectedCats.includes(c.slug);
            return (
              <Chip
                key={c.slug}
                active={active}
                onClick={() => toggle(selectedCats, setSelectedCats, c.slug)}
              >
                {c.name}
              </Chip>
            );
          })}
        </div>
      </div>

      {subcategories.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">
            Typ místa{" "}
            <span className="text-ink-light">— co tě konkrétně zajímá</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((s) => {
              const active = selectedSubs.includes(s.slug);
              return (
                <Chip
                  key={s.slug}
                  active={active}
                  onClick={() =>
                    toggle(selectedSubs, setSelectedSubs, s.slug)
                  }
                  size="sm"
                >
                  {s.label}
                </Chip>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-7 py-3 text-[15px] font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 hover:shadow-soft-lg"
        >
          Najít místa
        </button>
        {(defaultQuery ||
          defaultSelectedCategories.length > 0 ||
          defaultSelectedSubcategories.length > 0) && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-[14px] border border-line-hover bg-card px-5 py-3 text-[15px] font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
          >
            Vyresetovat
          </button>
        )}
      </div>
    </form>
  );
}

function Chip({
  active,
  onClick,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? `inline-flex items-center rounded-full bg-gradient-to-r from-peach-strong to-rose-strong ${padding} font-semibold text-white shadow-soft transition hover:-translate-y-0.5`
          : `inline-flex items-center rounded-full border border-line-hover bg-card ${padding} font-medium text-ink-muted transition hover:bg-surface hover:text-ink`
      }
    >
      {children}
    </button>
  );
}
