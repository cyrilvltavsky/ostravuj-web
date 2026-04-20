"use client";

import { useState, useTransition } from "react";
import type { Role } from "@prisma/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { changeRole, removeUser } from "./actions";

export function UserRow({
  userId,
  email,
  name,
  role,
  createdAt,
  isMe,
}: {
  userId: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
  isMe: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role;
    startTransition(async () => {
      const res = await changeRole(userId, newRole);
      if (res.error) setErrorMsg(res.error);
    });
  }

  function performRemove() {
    startTransition(async () => {
      const res = await removeUser(userId);
      setConfirmOpen(false);
      if (res.error) setErrorMsg(res.error);
    });
  }

  return (
    <tr className="border-t border-line transition-colors hover:bg-surface/50">
      <td className="px-6 py-4">
        <p className="font-semibold text-ink">{name || email}</p>
        {name ? <p className="text-xs text-ink-light">{email}</p> : null}
        {isMe ? (
          <span className="mt-1 inline-block rounded-full bg-mint/40 px-2 py-0.5 text-[10px] font-bold uppercase text-mint-deep">
            Vy
          </span>
        ) : null}
      </td>
      <td className="px-6 py-4">
        {isMe ? (
          <span className="text-sm text-ink-muted">
            {role === "SUPERADMIN" ? "Super admin" : "Editor"}
          </span>
        ) : (
          <select
            value={role}
            onChange={handleRoleChange}
            disabled={pending}
            className="rounded-xl border border-line-hover bg-card px-3 py-1.5 text-sm font-medium text-ink"
          >
            <option value="EDITOR">Editor</option>
            <option value="SUPERADMIN">Super admin</option>
          </select>
        )}
      </td>
      <td className="px-6 py-4 text-xs text-ink-light">
        {new Date(createdAt).toLocaleDateString("cs-CZ")}
      </td>
      <td className="px-6 py-4 text-right">
        {!isMe ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
            className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-rose-strong transition hover:bg-rose/30"
          >
            Odebrat
          </button>
        ) : null}
        <ConfirmDialog
          open={confirmOpen}
          title={`Odebrat uživatele ${email}?`}
          description="Uživatel ztratí přístup do administrace. Účet zmizí ze Supabase Auth i z tabulky profiles."
          confirmLabel="Ano, odebrat"
          pending={pending}
          onConfirm={performRemove}
          onCancel={() => setConfirmOpen(false)}
        />
        <ConfirmDialog
          open={errorMsg !== null}
          title="Chyba"
          description={errorMsg}
          confirmLabel="Rozumím"
          cancelLabel="Zavřít"
          destructive={false}
          onConfirm={() => setErrorMsg(null)}
          onCancel={() => setErrorMsg(null)}
        />
      </td>
    </tr>
  );
}
