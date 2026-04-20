"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { bulkDeletePlaces, deletePlace } from "./actions";

export type PlaceRow = {
  id: string;
  name: string;
  slug: string;
  district: string | null;
  status: "PUBLISHED" | "ARCHIVED" | "DRAFT";
  featured: boolean;
  categoryName: string;
  photoUrl: string | null;
  discountCode: string | null;
};

export function PlacesTable({ rows }: { rows: PlaceRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [singleToDelete, setSingleToDelete] = useState<PlaceRow | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
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
    const target = singleToDelete;
    if (!target) return;
    startTransition(async () => {
      try {
        await deletePlace(target.id);
      } catch {
        /* redirect throw — ignore */
      }
      setSingleToDelete(null);
      router.refresh();
    });
  }

  function performBulkDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkDeletePlaces(ids);
      setBulkConfirm(false);
      setSelected(new Set());
      router.refresh();
      if (res.error) alert(res.error);
    });
  }

  return (
    <>
      {selected.size > 0 ? (
        <div className="mb-3 flex items-center justify-between rounded-card-lg border border-peach-strong/30 bg-peach/30 px-4 py-3">
          <p className="text-sm font-medium text-ink">
            Vybráno{" "}
            <strong className="text-peach-deep">{selected.size}</strong>{" "}
            {selected.size === 1
              ? "místo"
              : selected.size < 5
                ? "místa"
                : "míst"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-xl border border-line-hover bg-white px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
            >
              Zrušit výběr
            </button>
            <button
              type="button"
              onClick={() => setBulkConfirm(true)}
              className="rounded-xl bg-rose-strong px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5"
            >
              Smazat vybraná
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-card-lg border border-line bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs font-bold uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3 w-10">
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
              <th className="px-4 py-3">Název</th>
              <th className="px-4 py-3">Kategorie</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sleva</th>
              <th className="px-4 py-3 text-right">Akce</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className={
                  "border-t border-line transition-colors " +
                  (selected.has(p.id) ? "bg-peach/10" : "hover:bg-surface/50")
                }
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    aria-label={`Vybrat ${p.name}`}
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4 cursor-pointer rounded border-line-hover text-peach-strong focus:ring-peach-strong/30"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {p.photoUrl ? (
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface">
                        <Image
                          src={p.photoUrl}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-14 shrink-0 rounded-md bg-surface" />
                    )}
                    <div>
                      <p className="font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-light">
                        {p.district || "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-ink-muted">{p.categoryName}</td>
                <td className="px-4 py-4">
                  {p.status === "PUBLISHED" ? (
                    <span className="rounded-full bg-mint/40 px-2.5 py-1 text-[11px] font-bold uppercase text-mint-deep">
                      Publikované
                    </span>
                  ) : p.status === "DRAFT" ? (
                    <span className="rounded-full bg-peach/40 px-2.5 py-1 text-[11px] font-bold uppercase text-peach-deep">
                      Koncept
                    </span>
                  ) : (
                    <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold uppercase text-ink-light">
                      Archivované
                    </span>
                  )}
                  {p.featured ? (
                    <span className="ml-1.5 rounded-full bg-peach/40 px-2.5 py-1 text-[11px] font-bold uppercase text-peach-deep">
                      ⭐
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-4 font-mono text-xs">
                  {p.discountCode ?? <span className="text-ink-light">—</span>}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Link
                      href={`/admin/places/${p.id}/edit`}
                      className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
                    >
                      Upravit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSingleToDelete(p)}
                      className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-rose-strong transition hover:bg-rose/30"
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

      {/* Single delete confirmation */}
      <ConfirmDialog
        open={singleToDelete !== null}
        title="Smazat místo?"
        description={
          singleToDelete ? (
            <>
              Chystáš se smazat <strong className="text-ink">{singleToDelete.name}</strong>.
              Spolu s místem zmizí i všechny jeho fotografie a slevový kód.
              Akce je nevratná.
            </>
          ) : null
        }
        confirmLabel="Ano, smazat"
        pending={pending}
        onConfirm={performSingleDelete}
        onCancel={() => setSingleToDelete(null)}
      />

      {/* Bulk delete confirmation */}
      <ConfirmDialog
        open={bulkConfirm}
        title={`Smazat ${selected.size} ${selected.size === 1 ? "místo" : selected.size < 5 ? "místa" : "míst"}?`}
        description={
          <>
            Smazána budou tato místa:
            <ul className="mt-2 max-h-40 list-disc space-y-0.5 overflow-auto pl-5 text-ink">
              {selectedRows.slice(0, 20).map((r) => (
                <li key={r.id}>{r.name}</li>
              ))}
              {selectedRows.length > 20 ? (
                <li className="text-ink-muted">
                  …a dalších {selectedRows.length - 20}
                </li>
              ) : null}
            </ul>
            <p className="mt-3 text-rose-strong">
              Akce je nevratná — fotografie a slevové kódy budou také
              smazány.
            </p>
          </>
        }
        confirmLabel={`Ano, smazat ${selected.size}`}
        pending={pending}
        onConfirm={performBulkDelete}
        onCancel={() => setBulkConfirm(false)}
      />
    </>
  );
}
