import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireSuperAdmin();
  return (
    <>
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-ink">
        Uživatelé
      </h1>
      <div className="rounded-card-lg border border-line bg-white p-8 text-center text-ink-muted shadow-soft">
        Pozvánky uživatelů přijdou ve Fázi 5.
      </div>
    </>
  );
}
