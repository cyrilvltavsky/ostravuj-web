"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/places";
import { RandomButton } from "./random-picker";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape
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
    `rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
      active ? "bg-surface text-ink" : "text-ink-muted hover:bg-surface hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Link
          href="/"
          className="text-gradient text-2xl font-extrabold tracking-tight"
        >
          Ostravuj
        </Link>

        <nav className="hidden gap-1 md:flex">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            Domů
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={{ pathname: `/${cat.slug}` }}
              className={navLinkClass(isActive(`/${cat.slug}`))}
            >
              {cat.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <RandomButton />
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
        <nav className="absolute left-0 right-0 top-[72px] z-40 flex flex-col gap-1 border-b border-line bg-white px-6 pb-6 pt-4 shadow-soft-lg md:hidden">
          <Link
            href="/"
            className="rounded-xl px-4 py-3.5 text-base font-medium text-ink-muted hover:bg-surface hover:text-ink"
          >
            Domů
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={{ pathname: `/${cat.slug}` }}
              className="rounded-xl px-4 py-3.5 text-base font-medium text-ink-muted hover:bg-surface hover:text-ink"
            >
              {cat.title}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
