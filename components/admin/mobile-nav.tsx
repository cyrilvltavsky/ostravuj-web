"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Role } from "@prisma/client";

type NavItem = {
  href: `/admin${string}`;
  label: string;
  superAdminOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Přehled" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/places", label: "Místa" },
  { href: "/admin/categories", label: "Kategorie", superAdminOnly: true },
  { href: "/admin/suggestions", label: "Návrhy" },
  { href: "/admin/users", label: "Uživatelé", superAdminOnly: true },
];

export function AdminMobileNav({
  role,
  email,
}: {
  role: Role;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = NAV.filter((n) => !n.superAdminOnly || role === "SUPERADMIN");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Otevřít menu"
        className="flex h-10 w-10 items-center justify-center rounded-card-sm bg-surface text-ink-muted transition hover:text-ink md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Administrační menu"
          className="fixed inset-0 z-[200] md:hidden"
        >
          {/* Backdrop */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Zavřít menu"
            className="absolute inset-0 bg-ink/50 backdrop-blur"
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-[280px] max-w-[85%] animate-slide-up bg-card shadow-soft-lg">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Link
                href="/admin"
                className="text-gradient text-xl font-extrabold tracking-tight"
              >
                Ostravuj
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zavřít"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            <nav className="px-3 py-4">
              <ul className="space-y-1">
                {items.map((n) => {
                  const active =
                    n.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(n.href);
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        className={
                          active
                            ? "block rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-ink"
                            : "block rounded-xl px-4 py-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                        }
                      >
                        {n.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="absolute inset-x-0 bottom-0 border-t border-line bg-card px-5 py-4">
              <p className="mb-2 truncate text-xs font-semibold text-ink">
                {email}
              </p>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-ink-light">
                {role === "SUPERADMIN" ? "Super admin" : "Editor"}
              </p>
              <form action="/admin/logout" method="post">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-line-hover bg-card px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
                >
                  Odhlásit
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
