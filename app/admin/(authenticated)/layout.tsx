import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireEditor();

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar role={profile.role} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center justify-between gap-2 border-b border-line bg-card px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 min-w-0">
            <AdminMobileNav role={profile.role} email={profile.email} />
            <div className="min-w-0 text-sm text-ink-muted">
              <p className="truncate font-semibold text-ink sm:inline">
                {profile.email}
              </p>{" "}
              <span className="hidden rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted sm:inline">
                {profile.role === "SUPERADMIN" ? "Super admin" : "Editor"}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-ink-muted hover:text-ink"
              aria-label="Zpět na web"
            >
              <span className="hidden md:inline">← Zpět na web</span>
              <span className="md:hidden text-lg">←</span>
            </Link>
            <ThemeToggle />
            <form action="/admin/logout" method="post" className="hidden sm:block">
              <button
                type="submit"
                className="rounded-xl border border-line-hover bg-card px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
              >
                Odhlásit
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
