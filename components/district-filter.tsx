"use client";

import { useMemo, useState } from "react";
import { PlaceCard } from "./place-card";
import type { Place } from "@/lib/places";

export function DistrictFilter({ places }: { places: Place[] }) {
  const districts = useMemo(() => {
    const set = new Set<string>();
    for (const p of places) {
      const d = p.district?.trim();
      if (d) set.add(d);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "cs"));
  }, [places]);

  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all" ? places : places.filter((p) => p.district === filter);

  const chipClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "border border-ink bg-ink text-white"
        : "border border-line-hover bg-card text-ink-muted hover:bg-surface hover:text-ink"
    }`;

  return (
    <>
      {districts.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-2 border-b border-line pb-8">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={chipClass(filter === "all")}
          >
            Všechny obvody
          </button>
          {districts.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFilter(d)}
              className={chipClass(filter === d)}
            >
              {d}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">
          V tomto obvodu zatím nejsou žádná místa.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((place) => (
            <PlaceCard key={place.slug} place={place} />
          ))}
        </div>
      )}
    </>
  );
}
