"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteCategory, reorderCategory } from "./actions";

export function CategoryRow({
  id,
  name,
  canMoveUp,
  canMoveDown,
  placeCount,
}: {
  id: number;
  name: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  placeCount: number;
}) {
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      const res = await reorderCategory(id, direction);
      if (res.error) alert(res.error);
    });
  }

  function handleDelete() {
    if (placeCount > 0) {
      alert(
        `Kategorie "${name}" obsahuje ${placeCount} míst. Nejdřív je přesuňte do jiné kategorie.`,
      );
      return;
    }
    if (
      !confirm(
        `Opravdu smazat kategorii "${name}"?\nTato akce je nevratná.`,
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.error) alert(res.error);
    });
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={!canMoveUp || pending}
        className="rounded-lg border border-line-hover px-2 py-1 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink disabled:opacity-40"
        aria-label="Posunout nahoru"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => move("down")}
        disabled={!canMoveDown || pending}
        className="rounded-lg border border-line-hover px-2 py-1 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink disabled:opacity-40"
        aria-label="Posunout dolů"
      >
        ↓
      </button>
      <Link
        href={`/admin/categories/${id}/edit`}
        className="ml-2 rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
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
