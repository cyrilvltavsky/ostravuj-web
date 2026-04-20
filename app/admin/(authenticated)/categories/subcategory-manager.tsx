"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  createSubcategory,
  deleteSubcategory,
  type SubcatFormState,
} from "./subcategory-actions";

const initial: SubcatFormState = { error: null };

type Cat = { id: number; name: string; slug: string };
type Sub = { id: number; slug: string; name: string; categoryId: number | null };

export function SubcategoryManager({
  categories,
  subcategories,
}: {
  categories: Cat[];
  subcategories: Sub[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createSubcategory,
    initial,
  );
  const [toDelete, setToDelete] = useState<Sub | null>(null);
  const [deletePending, startDelete] = useTransition();

  function performDelete() {
    if (!toDelete) return;
    startDelete(async () => {
      await deleteSubcategory(toDelete.id);
      setToDelete(null);
      router.refresh();
    });
  }

  const byCategory = new Map<number | "orphan", Sub[]>();
  for (const s of subcategories) {
    const key = s.categoryId ?? ("orphan" as const);
    const arr = byCategory.get(key) ?? [];
    arr.push(s);
    byCategory.set(key, arr);
  }

  return (
    <>
      <section className="mt-10 rounded-card-lg border border-line bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">Subkategorie</h2>
          <p className="text-xs text-ink-light">
            Používají se na frontu (Doporuč) i v detailu místa.
          </p>
        </div>

        {/* New subcategory form */}
        <form
          action={formAction}
          className="mb-6 grid gap-3 sm:grid-cols-[2fr_1.5fr_2fr_auto]"
        >
          {state.error ? (
            <div className="sm:col-span-4 rounded-xl border border-rose-strong/20 bg-rose/30 px-4 py-2.5 text-sm font-medium text-rose-strong">
              {state.error}
            </div>
          ) : null}
          <input
            type="text"
            name="name"
            required
            placeholder="Název (např. Vinárna)"
            className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-ink shadow-soft outline-none focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30"
          />
          <input
            type="text"
            name="slug"
            placeholder="slug (auto)"
            className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-ink shadow-soft outline-none focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30"
          />
          <select
            name="categoryId"
            defaultValue=""
            className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-ink shadow-soft outline-none focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30"
          >
            <option value="">— bez kategorie —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-gradient-to-r from-peach-strong to-rose-strong px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? "Přidávám…" : "Přidat"}
          </button>
        </form>

        {/* Grouped list */}
        <div className="space-y-5">
          {categories.map((c) => {
            const list = byCategory.get(c.id) ?? [];
            if (list.length === 0) return null;
            return (
              <div key={c.id}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-light">
                  {c.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {list.map((s) => (
                    <SubChip key={s.id} sub={s} onDelete={() => setToDelete(s)} />
                  ))}
                </div>
              </div>
            );
          })}
          {byCategory.has("orphan") ? (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-light">
                Bez kategorie
              </p>
              <div className="flex flex-wrap gap-2">
                {(byCategory.get("orphan") ?? []).map((s) => (
                  <SubChip key={s.id} sub={s} onDelete={() => setToDelete(s)} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Smazat subkategorii "${toDelete?.name}"?`}
        description="Z míst, kde je přiřazena, se odebere. Samotná místa zůstanou."
        confirmLabel="Ano, smazat"
        pending={deletePending}
        onConfirm={performDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

function SubChip({ sub, onDelete }: { sub: Sub; onDelete: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-hover bg-surface px-3 py-1.5 text-xs font-medium text-ink">
      {sub.name}
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Smazat ${sub.name}`}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-ink/10 text-[10px] text-ink-muted transition hover:bg-rose-strong hover:text-white"
      >
        ✕
      </button>
    </span>
  );
}
