"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deletePlace } from "./actions";

export function PlaceRowActions({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Opravdu smazat místo "${name}"?\nTato akce je nevratná — fotografie a slevový kód budou také smazány.`,
      )
    )
      return;
    startTransition(async () => {
      await deletePlace(id);
    });
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <Link
        href={`/admin/places/${id}/edit`}
        className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
      >
        Upravit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-rose-strong transition hover:bg-rose/30 disabled:opacity-50"
      >
        Smazat
      </button>
    </div>
  );
}
