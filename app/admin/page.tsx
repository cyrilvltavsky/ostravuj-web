import { requireEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const profile = await requireEditor();

  return (
    <main className="min-h-screen bg-surface px-6 py-16">
      <div className="container-page max-w-[720px]">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
          Administrace
        </h1>
        <p className="mb-8 text-ink-muted">
          Přihlášen jako <strong className="text-ink">{profile.email}</strong>{" "}
          ({profile.role === "SUPERADMIN" ? "Super admin" : "Editor"}).
        </p>

        <div className="rounded-card-lg border border-line bg-white p-6 shadow-soft">
          <p className="text-sm text-ink-muted">
            Toto je dočasná stránka. Pokračující fáze přidají správu míst,
            uživatelů a návrhů.
          </p>

          <form action="/admin/logout" method="post" className="mt-6">
            <button
              type="submit"
              className="rounded-xl border border-line-hover bg-white px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
            >
              Odhlásit se
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
