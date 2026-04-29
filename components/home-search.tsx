"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  searchCategories,
  searchDistricts,
  searchPlaces,
} from "@/lib/search";
import type { CategoryMeta, Place } from "@/lib/places";

/** Inline search on the homepage. Input shows a dropdown below itself
 *  with results split into Categories / Districts / Places. Click outside
 *  closes the dropdown. Enter navigates to the first result. */
export function HomeSearch({
  places,
  categories,
}: {
  places: Place[];
  categories: CategoryMeta[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const placeResults = useMemo(
    () => searchPlaces(places, query, 8),
    [places, query],
  );
  const categoryResults = useMemo(
    () => searchCategories(categories, query, 4),
    [categories, query],
  );
  const districtResults = useMemo(
    () => searchDistricts(places, query, 6),
    [places, query],
  );

  // Close on click outside
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // ESC clears + blurs
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && focused) {
        setFocused(false);
        setQuery("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused]);

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;
  const showDropdown = focused && hasQuery;
  const noResults =
    hasQuery &&
    placeResults.length === 0 &&
    categoryResults.length === 0 &&
    districtResults.length === 0;

  function goToFirstResult() {
    const first = placeResults[0]?.place;
    if (first) {
      setFocused(false);
      router.push(`/${first.category}/${first.slug}`);
      return;
    }
    const cat = categoryResults[0]?.category;
    if (cat) {
      setFocused(false);
      router.push(`/${cat.slug}`);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[640px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToFirstResult();
        }}
        className="flex items-center gap-3 rounded-[14px] border border-line bg-card px-5 py-3.5 shadow-soft transition focus-within:border-line-hover focus-within:shadow-soft-md"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-ink-muted"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          role="combobox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Hledej místo, kategorii nebo obvod…"
          aria-label="Hledat"
          aria-autocomplete="list"
          aria-controls={showDropdown ? listboxId : undefined}
          aria-expanded={showDropdown}
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-ink outline-none placeholder:text-ink-light"
        />
        {hasQuery ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
            }}
            aria-label="Smazat"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-light transition hover:bg-surface hover:text-ink"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        ) : null}
      </form>

      {showDropdown ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[60vh] overflow-y-auto rounded-card-lg border border-line bg-card shadow-soft-lg"
        >
          {noResults ? (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">
              Nic jsme nenašli. Zkus jiné slovo.
            </p>
          ) : (
            <div className="py-2">
              {categoryResults.length > 0 ? (
                <Section label="Kategorie">
                  {categoryResults.map(({ category }) => (
                    <CategoryRow
                      key={category.slug}
                      category={category}
                      onPick={() => setFocused(false)}
                    />
                  ))}
                </Section>
              ) : null}

              {districtResults.length > 0 ? (
                <Section label="Obvody">
                  <div className="flex flex-wrap gap-2 px-3 py-2">
                    {districtResults.map((d) => (
                      <DistrictChip
                        key={d}
                        district={d}
                        onPick={() => setFocused(false)}
                      />
                    ))}
                  </div>
                </Section>
              ) : null}

              {placeResults.length > 0 ? (
                <Section label={`Místa (${placeResults.length})`}>
                  {placeResults.map(({ place }) => (
                    <PlaceRow
                      key={place.slug}
                      place={place}
                      onPick={() => setFocused(false)}
                    />
                  ))}
                </Section>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <p className="px-5 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-ink-light">
        {label}
      </p>
      {children}
    </div>
  );
}

function PlaceRow({ place, onPick }: { place: Place; onPick: () => void }) {
  return (
    <Link
      href={`/${place.category}/${place.slug}` as `/${string}`}
      onClick={onPick}
      className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-card-sm bg-surface">
        {place.image ? (
          <Image
            src={place.image}
            alt=""
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{place.name}</p>
        <p className="truncate text-xs text-ink-light">
          /{place.category}
          {place.district ? ` · ${place.district}` : ""}
        </p>
      </div>
    </Link>
  );
}

function CategoryRow({
  category,
  onPick,
}: {
  category: CategoryMeta;
  onPick: () => void;
}) {
  return (
    <Link
      href={`/${category.slug}` as `/${string}`}
      onClick={onPick}
      className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card-sm bg-surface text-lg">
        {category.emoji || "★"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {category.title}
        </p>
        {category.subtitle ? (
          <p className="truncate text-xs text-ink-light">{category.subtitle}</p>
        ) : null}
      </div>
    </Link>
  );
}

function DistrictChip({
  district,
  onPick,
}: {
  district: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="rounded-full border border-line-hover bg-card px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
    >
      {district}
    </button>
  );
}
