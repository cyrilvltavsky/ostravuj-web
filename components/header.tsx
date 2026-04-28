"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { CategoryMeta } from "@/lib/places";
import { RandomButton } from "./random-picker";
import { SearchButton } from "./search";
import { ThemeToggle } from "./theme-toggle";

export function Header({ categories }: { categories: CategoryMeta[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinkClass = (active: boolean) =>
    active
      ? "rounded-xl px-4 py-2.5 text-sm font-semibold text-gradient bg-surface"
      : "rounded-xl px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-gradient hover:bg-surface";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-card/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Link
          href="/"
          className="text-gradient text-2xl font-extrabold tracking-tight"
        >
          Ostravuj
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={`flex items-center justify-center rounded-xl p-2.5 transition-colors ${
              pathname === "/"
                ? "bg-surface text-peach-strong"
                : "text-ink-muted hover:bg-surface hover:text-peach-strong"
            }`}
            aria-label="Domů"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={{ pathname: `/${cat.slug}` }}
              className={navLinkClass(isActive(`/${cat.slug}`))}
            >
              {cat.title}
            </Link>
          ))}
          <SearchButton />
        </nav>

        <div className="flex items-center gap-2">
          <RandomButton />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-card-sm bg-surface text-xl text-ink md:hidden"
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={open}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="absolute left-0 right-0 top-[72px] z-40 flex flex-col gap-1 border-b border-line bg-card px-6 pb-6 pt-4 shadow-soft-lg md:hidden">
          <Link
            href="/"
            className="rounded-xl px-4 py-3.5 text-base font-medium text-ink-muted hover:bg-surface hover:text-gradient"
          >
            Domů
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={{ pathname: `/${cat.slug}` }}
              className="rounded-xl px-4 py-3.5 text-base font-medium text-ink-muted hover:bg-surface hover:text-gradient"
            >
              {cat.title}
            </Link>
          ))}
          <SearchButton variant="menu" />
        </nav>
      )}
    </header>
  );
}
