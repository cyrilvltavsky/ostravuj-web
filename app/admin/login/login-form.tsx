"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const initial: LoginState = { error: null };

export function LoginForm({
  from,
  initialError,
}: {
  from?: string;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState(sendMagicLink, {
    error: initialError ?? null,
  });

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div className="rounded-xl border border-rose-strong/20 bg-rose/30 px-4 py-3 text-sm font-medium text-rose-strong">
          {state.error}
        </div>
      ) : null}

      {from ? <input type="hidden" name="from" value={from} /> : null}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-ink"
        >
          E-mail
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="vas@email.cz"
          className="w-full rounded-xl border border-line bg-surface/50 px-4 py-3 text-[15px] text-ink shadow-soft outline-none transition-all placeholder:text-ink-light focus:border-peach-strong focus:bg-white focus:ring-1 focus:ring-peach-strong/30"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-6 py-3.5 text-[15px] font-semibold text-white shadow-soft-md transition-all hover:-translate-y-0.5 hover:shadow-soft-lg disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Odesílám…" : "Poslat přihlašovací odkaz"}
      </button>
    </form>
  );
}
