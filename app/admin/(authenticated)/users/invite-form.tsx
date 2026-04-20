"use client";

import { useActionState } from "react";
import { inviteUser, type InviteState } from "./actions";

const initial: InviteState = { error: null, success: null };

const inputClass =
  "w-full rounded-xl border border-line bg-card px-4 py-2.5 text-[15px] text-ink shadow-soft outline-none transition-all placeholder:text-ink-light focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30";

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteUser, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-xl border border-rose-strong/20 bg-rose/30 px-4 py-2.5 text-sm font-medium text-rose-strong">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="rounded-xl border border-mint-deep/20 bg-mint/30 px-4 py-2.5 text-sm font-medium text-mint-deep">
          {state.success}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr_auto]">
        <input
          type="text"
          name="name"
          placeholder="Jméno"
          className={inputClass}
        />
        <input
          type="email"
          name="email"
          required
          placeholder="email@example.cz"
          className={inputClass}
        />
        <select name="role" defaultValue="EDITOR" className={inputClass}>
          <option value="EDITOR">Editor</option>
          <option value="SUPERADMIN">Super admin</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-peach-strong to-rose-strong px-5 py-2.5 text-sm font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 hover:shadow-soft-lg disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? "Posílám…" : "Pozvat"}
        </button>
      </div>
    </form>
  );
}
