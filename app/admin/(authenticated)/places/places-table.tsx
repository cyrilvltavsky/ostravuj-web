"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  bulkDeletePlaces,
  deletePlace,
  pinPlaceToTop,
} from "./actions";

export type PlaceRow = {
  id: string;
  name: string;
  slug: string;
  district: string | null;
  status: "PUBLISHED" | "ARCHIVED" | "DRAFT";
  featured: boolean;
  categorySlug: string;
  categoryName: string;
  photoUrl: string | null;
  discountCode: string | null;
};

type CatOption = { slug: string; name: string };

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function PlacesTable({
  rows,
  categories,
}: {
  rows: PlaceRow[];
  categories: CatOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [singleToDelete, setSingleToDelete] = useState<PlaceRow | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const filteredRows = useMemo(() => {
    const q = normalize(query.trim());
    return rows.filter((r) => {
      if (activeCat !== "all" && r.categorySlug !== activeCat) return false;
      if (q.length === 0) return true;
      const haystack = normalize(
        `${r.name} ${r.district ?? ""} ${r.slug} ${r.categoryName}`,
      );
      return haystack.includes(q);
    });
  }, [rows, query, activeCat]);

  const allSelected =
    filteredRows.length > 0 && selected.size === filteredRows.length;
  const someSelected =
    selected.size > 0 && selected.size < filteredRows.length;

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
    else setSelected(new Set(filteredRows.map((r) => r.id)));
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

  function pinTop(id: string) {
    startTransition(async () => {
      await pinPlaceToTop(id);
      router.refresh();
    });
  }

  return (
    <>
      {/* Filter + search bar */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-light"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat podle názvu, lokality, slugu…"
            className="w-full rounded-xl border border-line bg-card pl-10 pr-4 py-2.5 text-sm text-ink shadow-soft outline-none transition-all placeholder:text-ink-light focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <CatChip
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
            label="Vše"
            count={rows.length}
          />
          {categories.map((c) => (
            <CatChip
              key={c.slug}
              active={activeCat === c.slug}
              onClick={() => setActiveCat(c.slug)}
              label={c.name}
              count={rows.filter((r) => r.categorySlug === c.slug).length}
            />
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-card-lg border border-peach-strong/30 bg-peach/30 px-4 py-3">
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
              className="rounded-xl border border-line-hover bg-card px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
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

      {/* Table */}
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
              <th className="px-3 py-3">Název</th>
              <th className="hidden px-3 py-3 md:table-cell">Kategorie</th>
              <th className="hidden px-3 py-3 md:table-cell">Status</th>
              <th className="hidden px-3 py-3 md:table-cell">Sleva</th>
              <th className="px-3 py-3 text-right">Akce</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-ink-muted"
                >
                  Žádné místo neodpovídá hledání.
                </td>
              </tr>
            ) : (
              filteredRows.map((p) => {
                const editHref = `/admin/places/${p.id}/edit` as `/admin${string}`;
                return (
                  <tr
                    key={p.id}
                    className={
                      "border-t border-line transition-colors " +
                      (selected.has(p.id)
                        ? "bg-peach/10"
                        : "hover:bg-surface/50")
                    }
                  >
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        aria-label={`Vybrat ${p.name}`}
                        checked={selected.has(p.id)}
                        onChange={() => toggle(p.id)}
                        className="h-4 w-4 cursor-pointer rounded border-line-hover text-peach-strong focus:ring-peach-strong/30"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <Link
                        href={editHref}
                        className="flex items-center gap-3 group"
                      >
                        {p.photoUrl ? (
                          <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface ring-1 ring-line transition group-hover:ring-peach-strong/40">
                            <Image
                              src={p.photoUrl}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-14 shrink-0 rounded-md bg-surface ring-1 ring-line" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink group-hover:text-peach-strong">
                            {p.name}
                          </p>
                          <p className="truncate text-xs text-ink-light">
                            {p.district || p.categoryName}
                          </p>
                          {/* Mobile-only inline meta */}
                          <p className="mt-1 flex flex-wrap items-center gap-1.5 md:hidden">
                            <StatusPill status={p.status} />
                            {p.featured ? (
                              <span className="rounded-full bg-peach/40 px-1.5 py-0.5 text-[10px] font-bold uppercase text-peach-deep">
                                ⭐
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="hidden px-3 py-4 text-ink-muted md:table-cell">
                      {p.categoryName}
                    </td>
                    <td className="hidden px-3 py-4 md:table-cell">
                      <StatusPill status={p.status} />
                      {p.featured ? (
                        <span className="ml-1.5 rounded-full bg-peach/40 px-2.5 py-1 text-[11px] font-bold uppercase text-peach-deep">
                          ⭐
                        </span>
                      ) : null}
                    </td>
                    <td className="hidden px-3 py-4 font-mono text-xs md:table-cell">
                      {p.discountCode ?? (
                        <span className="text-ink-light">—</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => pinTop(p.id)}
                          disabled={pending}
                          aria-label="TOP nahoru"
                          title="TOP nahoru — posune místo na začátek seznamu"
                          className="hidden rounded-xl border border-line-hover px-2 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink disabled:opacity-50 sm:inline-flex"
                        >
                          ↑↑
                        </button>
                        <Link
                          href={editHref}
                          className="rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
                        >
                          Upravit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSingleToDelete(p)}
                          className="hidden rounded-xl border border-line-hover px-3 py-1.5 text-xs font-medium text-rose-strong transition hover:bg-rose/30 sm:inline-flex"
                        >
                          Smazat
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirms */}
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

function CatChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-peach-strong to-rose-strong px-3.5 py-1.5 text-xs font-semibold text-white shadow-soft"
          : "inline-flex items-center gap-1.5 rounded-full border border-line-hover bg-card px-3.5 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
      }
    >
      {label}
      <span
        className={
          active ? "text-white/80" : "text-ink-light"
        }
      >
        {count}
      </span>
    </button>
  );
}

function StatusPill({
  status,
}: {
  status: "PUBLISHED" | "ARCHIVED" | "DRAFT";
}) {
  if (status === "PUBLISHED")
    return (
      <span className="rounded-full bg-mint/40 px-2.5 py-1 text-[11px] font-bold uppercase text-mint-deep">
        Publikované
      </span>
    );
  if (status === "DRAFT")
    return (
      <span className="rounded-full bg-peach/40 px-2.5 py-1 text-[11px] font-bold uppercase text-peach-deep">
        Koncept
      </span>
    );
  return (
    <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold uppercase text-ink-light">
      Archivované
    </span>
  );
}
