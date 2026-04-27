"use client";

import { useState } from "react";
import {
  type Place,
  type SubcategorySlug,
  SUBCATEGORY_LABELS,
} from "@/lib/places";
import { PlaceCard } from "./place-card";

type FilterChipsProps = {
  places: Place[];
  subcategories: SubcategorySlug[];
};

export function FilterChips({ places, subcategories }: FilterChipsProps) {
  const [filter, setFilter] = useState<SubcategorySlug | "all">("all");

  const filtered =
    filter === "all"
      ? places
      : places.filter((p) =>
          p.subcategories.length > 0
            ? p.subcategories.includes(filter)
            : p.subcategory === filter,
        );

  const chipClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "border border-ink bg-ink text-white"
        : "border border-line-hover bg-card text-ink-muted hover:bg-surface hover:text-ink"
    }`;

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2 border-b border-line pb-8">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={chipClass(filter === "all")}
        >
          Vše
        </button>
        {subcategories.map((sub) => (
          <button
            key={sub}
            type="button"
            onClick={() => setFilter(sub)}
            className={chipClass(filter === sub)}
          >
            {SUBCATEGORY_LABELS[sub]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">
          Zatím žádná místa v této kategorii.
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
