"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Place } from "@/lib/places";

type RandomPickerContextValue = {
  open: () => void;
};

const RandomPickerContext = createContext<RandomPickerContextValue | null>(null);

function useRandomPicker() {
  const ctx = useContext(RandomPickerContext);
  if (!ctx) {
    throw new Error("useRandomPicker must be used inside <RandomPickerProvider />");
  }
  return ctx;
}

function pickRandomPlace(places: Place[], except?: Place | null): Place {
  if (places.length === 1) return places[0];
  let next: Place;
  do {
    next = places[Math.floor(Math.random() * places.length)];
  } while (except && next.slug === except.slug);
  return next;
}

export function RandomPickerProvider({
  places,
  children,
}: {
  places: Place[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [picked, setPicked] = useState<Place | null>(null);

  const open = useCallback(() => {
    if (places.length === 0) return;
    setPicked(pickRandomPlace(places));
    setIsOpen(true);
  }, [places]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const reroll = useCallback(() => {
    setPicked((prev) => pickRandomPlace(places, prev));
  }, [places]);

  const goToPicked = useCallback(() => {
    if (!picked) return;
    close();
    router.push(`/${picked.category}/${picked.slug}`);
  }, [picked, router, close]);

  // ESC closes the modal
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <RandomPickerContext.Provider value={value}>
      {children}
      {isOpen && picked ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Náhodný tip"
          className="fixed inset-0 z-[200] flex animate-fade-in items-center justify-center bg-ink/50 p-6 backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="relative w-full max-w-[480px] animate-slide-up rounded-card-xl bg-card p-10 text-center shadow-soft-lg">
            <button
              type="button"
              onClick={close}
              aria-label="Zavřít"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg text-ink-muted hover:text-ink"
            >
              ✕
            </button>
            <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wider text-ink-light">
              Náhodný tip
            </h3>
            <h2 className="mb-3.5 text-[32px] font-extrabold leading-tight tracking-tight text-ink">
              {picked.name}
            </h2>
            <p className="mb-5 text-ink-muted">{picked.shortDesc}</p>
            <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-card bg-surface">
              <Image
                src={picked.image}
                alt={picked.name}
                fill
                sizes="480px"
                className="object-cover"
              />
            </div>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={reroll}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-line-hover bg-card px-6 py-3.5 text-[15px] font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-surface sm:flex-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/></svg> Zkusit znovu
              </button>
              <button
                type="button"
                onClick={goToPicked}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-6 py-3.5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-soft-md sm:flex-1"
              >
                Zobrazit detail →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RandomPickerContext.Provider>
  );
}

export function RandomButton() {
  const { open } = useRandomPicker();
  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-peach-strong to-rose-strong px-4 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-soft-md"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/></svg>
      <span className="hidden sm:inline">Náhodný výběr</span>
    </button>
  );
}

export function HeroRandomButton({ children }: { children: React.ReactNode }) {
  const { open } = useRandomPicker();
  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex items-center gap-2.5 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-6 py-3.5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-soft-md"
    >
      {children}
    </button>
  );
}

export function BigRandomButton({ children }: { children: React.ReactNode }) {
  const { open } = useRandomPicker();
  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex items-center gap-2.5 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-8 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-soft-md"
    >
      {children}
    </button>
  );
}
