"use client";

import { useEffect, useState, useTransition } from "react";
import { enrichPlaceFromWeb, type EnrichResult } from "@/app/admin/(authenticated)/places/enrich";

type EnrichData = NonNullable<EnrichResult["data"]>;

type FieldKey = keyof EnrichData;

const FIELD_LABELS: Record<FieldKey, string> = {
  address: "Adresa",
  district: "Čtvrť",
  phone: "Telefon",
  email: "E-mail",
  website: "Web",
  instagram: "Instagram",
  facebook: "Facebook",
  shortDesc: "Krátký popis",
  tags: "Štítky",
};

/**
 * Reads the current values from the place form and asks AI to fill in
 * what's missing. Shows a per-field diff modal before applying changes.
 *
 * Plain DOM access by `name` attribute — no React state coupling needed.
 * Works on both /admin/places/new and /admin/places/[id]/edit.
 */
export function EnrichButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [proposed, setProposed] = useState<EnrichData | null>(null);
  const [current, setCurrent] = useState<Partial<EnrichData>>({});
  const [chosen, setChosen] = useState<Set<FieldKey>>(new Set());

  function readForm(): {
    name: string;
    category: string | null;
    address: string | null;
  } {
    const form = document.querySelector("form") as HTMLFormElement | null;
    if (!form) return { name: "", category: null, address: null };
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value ?? "";
    const address =
      (form.elements.namedItem("address") as HTMLInputElement)?.value ?? "";
    // Pick the first selected category slug for context (the form stores
    // categorySlugs as a comma-joined hidden input)
    const slugsRaw =
      (form.elements.namedItem("categorySlugs") as HTMLInputElement)?.value ??
      "";
    const firstSlug = slugsRaw.split(",")[0]?.trim() || null;
    return { name: name.trim(), category: firstSlug, address: address.trim() || null };
  }

  function readCurrentValues(): Partial<EnrichData> {
    const form = document.querySelector("form") as HTMLFormElement | null;
    if (!form) return {};
    const get = (n: string) =>
      (form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | null)
        ?.value ?? "";
    const tagsStr = get("tags");
    return {
      address: get("address") || null,
      district: get("district") || null,
      phone: get("phone") || null,
      email: get("email") || null,
      website: get("website") || null,
      instagram: get("instagram") || null,
      facebook: get("facebook") || null,
      shortDesc: get("shortDesc") || null,
      tags: tagsStr
        ? tagsStr.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
  }

  function trigger() {
    setError(null);
    const ctx = readForm();
    if (!ctx.name) {
      setError("Nejdřív vyplňte název místa.");
      return;
    }
    startTransition(async () => {
      const res = await enrichPlaceFromWeb(ctx);
      if (!res.ok || !res.data) {
        setError(res.error ?? "AI nevrátila data.");
        return;
      }
      setCurrent(readCurrentValues());
      setProposed(res.data);
      // Pre-select fields that are currently empty + AI returned something
      const auto = new Set<FieldKey>();
      const cur = readCurrentValues();
      (Object.keys(FIELD_LABELS) as FieldKey[]).forEach((k) => {
        const newVal = res.data?.[k];
        const curVal = cur[k];
        const newIsEmpty = isEmptyValue(newVal);
        const curIsEmpty = isEmptyValue(curVal);
        if (!newIsEmpty && curIsEmpty) auto.add(k);
      });
      setChosen(auto);
    });
  }

  function applySelected() {
    if (!proposed) return;
    const form = document.querySelector("form") as HTMLFormElement | null;
    if (!form) return;
    chosen.forEach((k) => {
      const value = proposed[k];
      if (k === "tags") {
        const inp = form.elements.namedItem("tags") as HTMLInputElement | null;
        if (inp && Array.isArray(value)) {
          inp.value = value.join(", ");
          inp.dispatchEvent(new Event("input", { bubbles: true }));
        }
      } else {
        const el = form.elements.namedItem(k) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | null;
        if (el && typeof value === "string") {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });
    setProposed(null);
    setChosen(new Set());
  }

  function close() {
    setProposed(null);
    setChosen(new Set());
    setError(null);
  }

  // ESC closes modal
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
      <div className="mb-4 rounded-card-lg border border-line bg-gradient-to-br from-peach/30 via-rose/10 to-lavender/30 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">
              ✨ AI doplnění z internetu
            </p>
            <p className="text-xs text-ink-muted">
              Vyplň název (a ideálně kategorii) a já se pokusím doplnit
              adresu, kontakty a popis.
            </p>
            {error ? (
              <p className="mt-2 text-xs font-medium text-rose-strong">
                {error}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={trigger}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-peach-strong to-rose-strong px-4 py-2 text-sm font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? "Hledám…" : "✨ Doplnit z internetu"}
          </button>
        </div>
      </div>

      {proposed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="enrich-title"
          className="fixed inset-0 z-[200] flex animate-fade-in items-center justify-center bg-ink/50 p-6 backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-[640px] animate-slide-up rounded-card-xl bg-card p-6 shadow-soft-lg">
            <h3
              id="enrich-title"
              className="mb-1 text-xl font-extrabold tracking-tight text-ink"
            >
              Návrhy od AI
            </h3>
            <p className="mb-5 text-sm text-ink-muted">
              Vyber, která pole chceš přepsat. Předvybrána jsou ta, která máš
              ve formuláři prázdná.
            </p>

            <div className="max-h-[60vh] space-y-2 overflow-auto">
              {(Object.keys(FIELD_LABELS) as FieldKey[]).map((key) => {
                const newVal = proposed[key];
                const curVal = current[key];
                const newIsEmpty = isEmptyValue(newVal);
                const curIsEmpty = isEmptyValue(curVal);
                const checked = chosen.has(key);
                const willOverwrite = !newIsEmpty && !curIsEmpty;
                return (
                  <label
                    key={key}
                    className={
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition " +
                      (newIsEmpty
                        ? "border-line bg-surface opacity-50 cursor-not-allowed"
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
                        {FIELD_LABELS[key]}
                        {willOverwrite ? (
                          <span className="rounded-full bg-rose/30 px-1.5 py-0.5 text-[10px] font-bold normal-case text-rose-strong">
                            přepíše stávající
                          </span>
                        ) : null}
                      </p>
                      {newIsEmpty ? (
                        <p className="text-sm text-ink-light italic">
                          AI nenašla
                        </p>
                      ) : (
                        <p className="text-sm text-ink break-words">
                          {Array.isArray(newVal) ? newVal.join(", ") : newVal}
                        </p>
                      )}
                      {willOverwrite && !newIsEmpty ? (
                        <p className="mt-1 text-xs text-ink-muted break-words">
                          Stávající:{" "}
                          {Array.isArray(curVal) ? curVal.join(", ") : curVal}
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

function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}
