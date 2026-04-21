"use client";

import { useEffect, useState, useTransition } from "react";
import {
  enrichFields,
  type EnrichData,
  type EnrichField,
} from "@/app/admin/(authenticated)/places/enrich";

const LABELS: Record<EnrichField, string> = {
  address: "Adresa",
  district: "Čtvrť",
  shortDesc: "Krátký popis",
  tags: "Štítky",
  phone: "Telefon",
  email: "E-mail",
  website: "Web",
  instagram: "Instagram",
  facebook: "Facebook",
};

/**
 * Reads the current Place form values via the DOM. PlaceForm is mostly
 * uncontrolled, so we walk form.elements by name. This avoids prop-drilling
 * setters into every section.
 */
function readContext() {
  const form = document.querySelector(
    "form[data-place-form]",
  ) as HTMLFormElement | null;
  if (!form) return { name: "", category: null, address: null };
  const get = (n: string) =>
    (form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | null)
      ?.value ?? "";
  const name = get("name").trim();
  const slugsRaw = get("categorySlugs");
  const firstSlug = slugsRaw.split(",")[0]?.trim() || null;
  const address = get("address").trim() || null;
  return { name, category: firstSlug, address };
}

function readFieldValue(field: EnrichField): string {
  const form = document.querySelector(
    "form[data-place-form]",
  ) as HTMLFormElement | null;
  if (!form) return "";
  return (
    (
      form.elements.namedItem(field) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null
    )?.value ?? ""
  );
}

function setFieldValue(field: EnrichField, value: string | string[] | null) {
  const form = document.querySelector(
    "form[data-place-form]",
  ) as HTMLFormElement | null;
  if (!form) return;
  const el = form.elements.namedItem(field) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;
  if (!el) return;
  const next =
    value === null
      ? ""
      : Array.isArray(value)
        ? value.join(", ")
        : String(value);
  el.value = next;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  // Brief highlight to confirm the change
  el.classList.add("ring-2", "ring-peach-strong");
  setTimeout(() => {
    el.classList.remove("ring-2", "ring-peach-strong");
  }, 800);
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/* ─────────────────────────  SECTION BUTTON  ───────────────────────── */

/**
 * Section-level enrich: fetches multiple fields at once, shows a diff
 * modal so the user can pick which ones to apply.
 */
export function EnrichSectionButton({
  fields,
  label = "Doplnit z internetu",
}: {
  fields: EnrichField[];
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [proposed, setProposed] = useState<EnrichData | null>(null);
  const [chosen, setChosen] = useState<Set<EnrichField>>(new Set());

  function trigger() {
    setError(null);
    const ctx = readContext();
    if (!ctx.name) {
      setError(
        "Nejdřív vyplňte název místa (a ideálně i kategorii), pak mu mohu hledat informace.",
      );
      return;
    }
    startTransition(async () => {
      const res = await enrichFields({
        name: ctx.name,
        category: ctx.category,
        knownAddress: ctx.address,
        fields,
      });
      if (!res.ok || !res.data) {
        setError(res.error ?? "AI nevrátila data.");
        return;
      }
      setProposed(res.data);
      // Pre-select fields that are currently empty + AI returned something
      const auto = new Set<EnrichField>();
      for (const f of fields) {
        const newVal = res.data[f];
        const curVal = readFieldValue(f);
        if (!isEmpty(newVal) && isEmpty(curVal)) auto.add(f);
      }
      setChosen(auto);
    });
  }

  function applySelected() {
    if (!proposed) return;
    chosen.forEach((f) => {
      const v = proposed[f];
      if (v === undefined) return;
      setFieldValue(f, v as string | string[] | null);
    });
    close();
  }

  function close() {
    setProposed(null);
    setChosen(new Set());
  }

  // ESC closes
  useEffect(() => {
    if (!proposed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [proposed]);

  return (
    <>
      <button
        type="button"
        onClick={trigger}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-peach-strong/30 bg-peach/20 px-3 py-1.5 text-xs font-semibold text-peach-deep transition hover:bg-peach/40 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Spinner /> Hledám…
          </>
        ) : (
          <>✨ {label}</>
        )}
      </button>

      {error ? (
        <p className="mt-2 text-xs font-medium text-rose-strong">{error}</p>
      ) : null}

      {proposed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="enrich-section-title"
          className="fixed inset-0 z-[200] flex animate-fade-in items-center justify-center bg-ink/50 p-6 backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-[560px] animate-slide-up rounded-card-xl bg-card p-6 shadow-soft-lg">
            <h3
              id="enrich-section-title"
              className="mb-1 text-xl font-extrabold tracking-tight text-ink"
            >
              Návrhy od AI
            </h3>
            <p className="mb-5 text-sm text-ink-muted">
              Vyber, co chceš použít. Předvybrána jsou pole, která máš
              prázdná.
            </p>

            <div className="max-h-[55vh] space-y-2 overflow-auto">
              {fields.map((key) => {
                const newVal = proposed[key];
                const curVal = readFieldValue(key);
                const newIsEmpty = isEmpty(newVal);
                const curIsEmpty = isEmpty(curVal);
                const checked = chosen.has(key);
                const willOverwrite = !newIsEmpty && !curIsEmpty;
                return (
                  <label
                    key={key}
                    className={
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition " +
                      (newIsEmpty
                        ? "cursor-not-allowed border-line bg-surface opacity-50"
                        : checked
                          ? "border-peach-strong/40 bg-peach/10"
                          : "border-line hover:bg-surface")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={newIsEmpty}
                      onChange={(e) => {
                        setChosen((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(key);
                          else next.delete(key);
                          return next;
                        });
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-line-hover text-peach-strong focus:ring-peach-strong/30"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-light">
                        {LABELS[key]}
                        {willOverwrite ? (
                          <span className="rounded-full bg-rose/30 px-1.5 py-0.5 text-[10px] font-bold normal-case text-rose-strong">
                            přepíše stávající
                          </span>
                        ) : null}
                      </p>
                      {newIsEmpty ? (
                        <p className="text-sm italic text-ink-light">
                          AI nenašla
                        </p>
                      ) : (
                        <p className="break-words text-sm text-ink">
                          {Array.isArray(newVal) ? newVal.join(", ") : newVal}
                        </p>
                      )}
                      {willOverwrite && !newIsEmpty ? (
                        <p className="mt-1 break-words text-xs text-ink-muted">
                          Stávající: {curVal}
                        </p>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-xl border border-line-hover bg-card px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={applySelected}
                disabled={chosen.size === 0}
                className="rounded-xl bg-gradient-to-r from-peach-strong to-rose-strong px-5 py-2 text-sm font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                Použít {chosen.size > 0 ? `(${chosen.size})` : ""}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ─────────────────────────  FIELD BUTTON  ───────────────────────── */

/**
 * Per-field enrich. Inline behaviour:
 * - empty field → fill directly with subtle highlight
 * - field has content → confirm before overwrite (window.confirm is fine
 *   here since this is an admin-internal optional convenience)
 */
export function EnrichFieldButton({ field }: { field: EnrichField }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function trigger() {
    setError(null);
    const ctx = readContext();
    if (!ctx.name) {
      setError("Vyplň nejdřív název místa.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    startTransition(async () => {
      const res = await enrichFields({
        name: ctx.name,
        category: ctx.category,
        knownAddress: ctx.address,
        fields: [field],
      });
      if (!res.ok || !res.data) {
        setError(res.error ?? "AI nevrátila data.");
        setTimeout(() => setError(null), 3000);
        return;
      }
      const value = res.data[field];
      if (isEmpty(value)) {
        setError("AI tuto informaci nenašla.");
        setTimeout(() => setError(null), 3000);
        return;
      }
      const current = readFieldValue(field);
      if (current.trim() !== "") {
        const ok = confirm(
          `Pole "${LABELS[field]}" už obsahuje "${current.length > 60 ? current.slice(0, 60) + "…" : current}".\n\nPřepsat hodnotou:\n"${
            Array.isArray(value)
              ? value.join(", ")
              : String(value).length > 80
                ? String(value).slice(0, 80) + "…"
                : value
          }"?`,
        );
        if (!ok) return;
      }
      setFieldValue(field, value as string | string[] | null);
    });
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={trigger}
        disabled={pending}
        title={`Doplnit ${LABELS[field]} z internetu`}
        aria-label={`Doplnit ${LABELS[field]} z internetu`}
        className="ml-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line-hover bg-card text-ink-muted transition hover:bg-peach/20 hover:text-peach-deep disabled:opacity-60"
      >
        {pending ? <Spinner /> : <span className="text-sm">✨</span>}
      </button>
      {error ? (
        <span className="absolute left-0 top-full mt-1 whitespace-nowrap rounded-md bg-rose-strong px-2 py-1 text-[11px] font-medium text-white shadow-soft-md">
          {error}
        </span>
      ) : null}
    </span>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
