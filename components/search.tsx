"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CategoryMeta, Place } from "@/lib/places";
import {
  searchCategories,
  searchDistricts,
  searchPlaces,
  type ScoredCategory,
  type ScoredPlace,
} from "@/lib/search";

type SearchContextValue = {
  open: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used inside <SearchProvider />");
  }
  return ctx;
}

export function SearchProvider({
  places,
  categories,
  children,
}: {
  places: Place[];
  categories: CategoryMeta[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ESC closes, Cmd/Ctrl+K opens
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const placeResults = useMemo<ScoredPlace[]>(
    () => searchPlaces(places, query),
    [places, query],
  );
  const categoryResults = useMemo<ScoredCategory[]>(
    () => searchCategories(categories, query),
    [categories, query],
  );
  const districtResults = useMemo<string[]>(
    () => searchDistricts(places, query),
    [places, query],
  );

  const noResults =
    query.trim().length > 0 &&
    placeResults.length === 0 &&
    categoryResults.length === 0 &&
    districtResults.length === 0;

  function goToFirstResult() {
    const first =
      placeResults[0]?.place ?? null;
    if (first) {
      close();
      router.push(`/${first.category}/${first.slug}`);
      return;
    }
    const cat = categoryResults[0]?.category;
    if (cat) {
      close();
      router.push(`/${cat.slug}`);
    }
  }

  const value = useMemo(() => ({ open }), [open]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Hledat"
          className="fixed inset-0 z-[300] flex animate-fade-in items-start justify-center bg-ink/60 px-4 pt-[10vh] backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="relative w-full max-w-[640px] animate-slide-up overflow-hidden rounded-card-xl bg-card shadow-soft-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToFirstResult();
              }}
              className="flex items-center gap-3 border-b border-line px-5 py-4"
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
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hledej místo, kategorii nebo obvod…"
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-ink outline-none placeholder:text-ink-light"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Zavřít"
                className="hidden h-7 shrink-0 items-center rounded-md border border-line-hover bg-surface px-2 text-[11px] font-bold uppercase tracking-wider text-ink-light sm:flex"
              >
                ESC
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto">
              {!query.trim() ? (
                <p className="px-5 py-10 text-center text-sm text-ink-muted">
                  Zadej cokoliv — název podniku, kategorii (gastro, rodina…),
                  obvod (Poruba, Moravská Ostrava…) nebo třeba „kavárna&rdquo;.
                </p>
              ) : noResults ? (
                <p className="px-5 py-10 text-center text-sm text-ink-muted">
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
                          onPick={close}
                        />
                      ))}
                    </Section>
                  ) : null}

                  {districtResults.length > 0 ? (
                    <Section label="Obvody">
                      <div className="flex flex-wrap gap-2 px-3 py-2">
                        {districtResults.map((d) => (
                          <DistrictChip key={d} district={d} />
                        ))}
                      </div>
                    </Section>
                  ) : null}

                  {placeResults.length > 0 ? (
                    <Section
                      label={`Místa (${placeResults.length})`}
                    >
                      {placeResults.map(({ place }) => (
                        <PlaceRow
                          key={place.slug}
                          place={place}
                          onPick={close}
                        />
                      ))}
                    </Section>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </SearchContext.Provider>
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

function DistrictChip({ district }: { district: string }) {
  // No standalone district route — link to homepage; user picks
  // a category from there. Prefilling could be a later iteration.
  return (
    <span className="inline-flex items-center rounded-full border border-line-hover bg-surface px-3 py-1 text-xs font-semibold text-ink-muted">
      {district}
    </span>
  );
}

export function SearchButton({
  variant = "icon",
}: {
  variant?: "icon" | "menu" | "iconMobile";
}) {
  const { open } = useSearch();

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={open}
        className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-ink-muted hover:text-gradient"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Hledat
      </button>
    );
  }

  // Mobile top-bar variant — same square icon shape as ThemeToggle
  if (variant === "iconMobile") {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="Hledat"
        title="Hledat"
        className="flex h-10 w-10 items-center justify-center rounded-card-sm bg-surface text-ink-muted transition hover:text-ink"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    );
  }

  // Desktop nav inline icon — text-only hover
  return (
    <button
      type="button"
      onClick={open}
      className="flex items-center justify-center rounded-xl p-2.5 text-ink-muted transition-colors hover:text-peach-strong"
      aria-label="Hledat"
      title="Hledat (⌘K)"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </button>
  );
}
