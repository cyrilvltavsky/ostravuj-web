"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  function move(direction: "up" | "down") {
    startTransition(async () => {
      const res = await reorderCategory(id, direction);
      if (res.error) setBlockedMessage(res.error);
    });
  }

  function requestDelete() {
    if (placeCount > 0) {
      setBlockedMessage(
        `Kategorie "${name}" obsahuje ${placeCount} míst. Nejdřív je přesuňte do jiné kategorie.`,
      );
      return;
    }
    setConfirmOpen(true);
  }

  function performDelete() {
    startTransition(async () => {
      const res = await deleteCategory(id);
      setConfirmOpen(false);
      if (res.error) setBlockedMessage(res.error);
    });
  }

  return (
    <>
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
          onClick={requestDelete}
          disabled={pending}
          className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-rose-strong transition hover:bg-rose/30 disabled:opacity-50"
        >
          Smazat
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Smazat kategorii "${name}"?`}
        description="Tato akce je nevratná. Místo lze později vytvořit znovu, ale veškerá historie spojení s místy zmizí."
        confirmLabel="Ano, smazat"
        pending={pending}
        onConfirm={performDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        open={blockedMessage !== null}
        title="Nelze smazat"
        description={blockedMessage}
        confirmLabel="Rozumím"
        cancelLabel="Zavřít"
        destructive={false}
        onConfirm={() => setBlockedMessage(null)}
        onCancel={() => setBlockedMessage(null)}
      />
    </>
  );
}
