import Link from "next/link";
import { requireEditor } from "@/lib/auth";
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

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-card px-6 py-4">
          <div className="text-sm text-ink-muted">
            <span className="font-semibold text-ink">{profile.email}</span>{" "}
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {profile.role === "SUPERADMIN" ? "Super admin" : "Editor"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-ink-muted hover:text-ink"
            >
              ← Zpět na web
            </Link>
            <ThemeToggle />
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-xl border border-line-hover bg-card px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
              >
                Odhlásit
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
