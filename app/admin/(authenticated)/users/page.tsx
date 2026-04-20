import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InviteForm } from "./invite-form";
import { UserRow } from "./user-row";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await requireSuperAdmin();

  const users = await prisma.profile.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
        Uživatelé
      </h1>
      <p className="mb-8 text-sm text-ink-muted">
        Pozvi editory pomocí jejich e-mailu. Dostanou magic link a po
        prvním přihlášení uvidí administraci.
      </p>

      <section className="mb-8 rounded-card-lg border border-line bg-card p-6 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-ink">Pozvat uživatele</h2>
        <InviteForm />
      </section>

      <section className="overflow-hidden rounded-card-lg border border-line bg-card shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs font-bold uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-6 py-3">Jméno / E-mail</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Přidán</th>
              <th className="px-6 py-3 text-right">Akce</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow
                key={u.id}
                userId={u.id}
                email={u.email}
                name={u.name}
                role={u.role}
                createdAt={u.createdAt.toISOString()}
                isMe={u.id === me.id}
              />
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
