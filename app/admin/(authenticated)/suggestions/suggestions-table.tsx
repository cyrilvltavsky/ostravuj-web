"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { bulkSuggestionAction, deleteSuggestion } from "./actions";

export type SuggestionRow = {
  id: string;
  placeName: string;
  category: string;
  contactName: string;
  contactEmail: string;
  status: "NEW" | "APPROVED" | "REJECTED";
  createdAtIso: string;
};

export function SuggestionsTable({ rows }: { rows: SuggestionRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [singleDelete, setSingleDelete] = useState<SuggestionRow | null>(null);
  const [bulkOp, setBulkOp] = useState<"REJECT" | "DELETE" | null>(null);
  const [pending, startTransition] = useTransition();

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0 && selected.size < rows.length;

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.id)),
    [rows, selected],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  }

  function performSingleDelete() {
    const target = singleDelete;
    if (!target) return;
    startTransition(async () => {
      await deleteSuggestion(target.id);
      setSingleDelete(null);
      router.refresh();
    });
  }

  function performBulk() {
    if (!bulkOp) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkSuggestionAction(ids, bulkOp);
      setBulkOp(null);
      setSelected(new Set());
      router.refresh();
      if (res.error) alert(res.error);
    });
  }

  return (
    <>
      {selected.size > 0 ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-card-lg border border-peach-strong/30 bg-peach/30 px-4 py-3">
          <p className="text-sm font-medium text-ink">
            Vybráno{" "}
            <strong className="text-peach-deep">{selected.size}</strong>{" "}
            {selected.size === 1
              ? "návrh"
              : selected.size < 5
                ? "návrhy"
                : "návrhů"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-xl border border-line-hover bg-card px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
            >
              Zrušit výběr
            </button>
            <button
              type="button"
              onClick={() => setBulkOp("REJECT")}
              className="rounded-xl border border-line-hover bg-card px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-surface hover:text-ink"
            >
              Hromadně zamítnout
            </button>
            <button
              type="button"
              onClick={() => setBulkOp("DELETE")}
              className="rounded-xl bg-rose-strong px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5"
            >
              Hromadně smazat
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-card-lg border border-line bg-card shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs font-bold uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  aria-label="Vybrat všechna"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer rounded border-line-hover text-peach-strong focus:ring-peach-strong/30"
                />
              </th>
              <th className="px-3 py-3">Název / Kategorie</th>
              <th className="hidden px-3 py-3 md:table-cell">Od koho</th>
              <th className="hidden px-3 py-3 md:table-cell">Status</th>
              <th className="hidden px-3 py-3 md:table-cell">Přijato</th>
              <th className="px-3 py-3 text-right">Akce</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                className={
                  "border-t border-line transition-colors " +
                  (selected.has(s.id) ? "bg-peach/10" : "hover:bg-surface/50")
                }
              >
                <td className="px-3 py-4">
                  <input
                    type="checkbox"
                    aria-label={`Vybrat ${s.placeName}`}
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                    className="h-4 w-4 cursor-pointer rounded border-line-hover text-peach-strong focus:ring-peach-strong/30"
                  />
                </td>
                <td className="px-3 py-4">
                  <Link
                    href={`/admin/suggestions/${s.id}`}
                    className="block group"
                  >
                    <p className="truncate font-semibold text-ink group-hover:text-peach-strong">
                      {s.placeName}
                    </p>
                    <p className="truncate text-xs text-ink-light">
                      {s.category}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs md:hidden">
                      <StatusBadge status={s.status} />
                      <span className="text-ink-light">{s.contactName}</span>
                    </p>
                  </Link>
                </td>
                <td className="hidden px-3 py-4 md:table-cell">
                  <p className="text-ink">{s.contactName}</p>
                  <p className="text-xs text-ink-light">{s.contactEmail}</p>
                </td>
                <td className="hidden px-3 py-4 md:table-cell">
                  <StatusBadge status={s.status} />
                </td>
                <td className="hidden px-3 py-4 text-xs text-ink-light md:table-cell">
                  {new Date(s.createdAtIso).toLocaleString("cs-CZ", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-3 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Link
                      href={`/admin/suggestions/${s.id}`}
                      className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
                    >
                      Otevřít
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSingleDelete(s)}
                      className="hidden rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-rose-strong transition hover:bg-rose/30 sm:inline-flex"
                    >
                      Smazat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={singleDelete !== null}
        title="Smazat návrh?"
        description={
          singleDelete ? (
            <>
              Smazán bude návrh <strong className="text-ink">{singleDelete.placeName}</strong> od{" "}
              {singleDelete.contactName}. Akce je nevratná.
            </>
          ) : null
        }
        confirmLabel="Ano, smazat"
        pending={pending}
        onConfirm={performSingleDelete}
        onCancel={() => setSingleDelete(null)}
      />

      <ConfirmDialog
        open={bulkOp !== null}
        title={
          bulkOp === "DELETE"
            ? `Smazat ${selected.size} návrhů?`
            : `Zamítnout ${selected.size} návrhů?`
        }
        description={
          <>
            {bulkOp === "DELETE"
              ? "Smazány budou tyto návrhy:"
              : "Zamítnuty budou tyto návrhy:"}
            <ul className="mt-2 max-h-40 list-disc space-y-0.5 overflow-auto pl-5 text-ink">
              {selectedRows.slice(0, 20).map((r) => (
                <li key={r.id}>
                  {r.placeName}{" "}
                  <span className="text-ink-light">— {r.contactName}</span>
                </li>
              ))}
              {selectedRows.length > 20 ? (
                <li className="text-ink-muted">
                  …a dalších {selectedRows.length - 20}
                </li>
              ) : null}
            </ul>
            {bulkOp === "DELETE" ? (
              <p className="mt-3 text-rose-strong">Akce je nevratná.</p>
            ) : null}
          </>
        }
        confirmLabel={
          bulkOp === "DELETE"
            ? `Ano, smazat ${selected.size}`
            : `Ano, zamítnout ${selected.size}`
        }
        destructive={bulkOp === "DELETE"}
        pending={pending}
        onConfirm={performBulk}
        onCancel={() => setBulkOp(null)}
      />
    </>
  );
}

function StatusBadge({
  status,
}: {
  status: "NEW" | "APPROVED" | "REJECTED";
}) {
  const map = {
    NEW: { label: "Nový", cls: "bg-peach/40 text-peach-deep" },
    APPROVED: { label: "Schválený", cls: "bg-mint/40 text-mint-deep" },
    REJECTED: { label: "Zamítnutý", cls: "bg-surface text-ink-light" },
  } as const;
  const t = map[status];
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${t.cls}`}
    >
      {t.label}
    </span>
  );
}
