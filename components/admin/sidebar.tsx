"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";

type NavItem = {
  href: string;
  label: string;
  superAdminOnly?: boolean;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Přehled",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/places",
    label: "Místa",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Kategorie",
    superAdminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/suggestions",
    label: "Návrhy",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Uživatelé",
    superAdminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-line bg-card md:flex">
      <Link
        href="/admin"
        className="text-gradient block border-b border-line px-6 py-5 text-2xl font-extrabold tracking-tight"
      >
        Ostravuj
      </Link>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {NAV.filter((n) => !n.superAdminOnly || role === "SUPERADMIN").map(
            (n) => (
              <li key={n.href}>
                <Link
                  href={n.href as `/admin${string}`}
                  className={
                    isActive(n.href)
                      ? "flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5 text-sm font-semibold text-ink"
                      : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                  }
                >
                  {n.icon}
                  {n.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>

      <p className="px-6 py-4 text-[11px] uppercase tracking-wider text-ink-light">
        Administrace
      </p>
    </aside>
  );
}
