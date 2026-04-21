"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  bulkCreate,
  bulkPrepare,
  type BulkPreparedItem,
} from "./actions";

type Cat = { slug: string; name: string };

type Editable = {
  id: string;
  enabled: boolean;
  name: string;
  address: string;
  district: string;
  shortDesc: string;
  tags: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  /** Original AI error if any (for display) */
  aiError: string | null;
};

const inputCls =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink shadow-soft outline-none focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30";

function makeEditable(it: BulkPreparedItem): Editable {
  const e = it.enriched ?? {};
  return {
    id: crypto.randomUUID(),
    enabled: true,
    name: it.name,
    address: e.address ?? "",
    district: e.district ?? "",
    shortDesc: e.shortDesc ?? "",
    tags: (e.tags ?? []).join(", "),
    phone: e.phone ?? "",
    email: e.email ?? "",
    website: e.website ?? "",
    instagram: e.instagram ?? "",
    facebook: e.facebook ?? "",
    aiError: it.error,
  };
}

export function BulkForm({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string>(
    categories[0]?.slug ?? "",
  );
  const [items, setItems] = useState<Editable[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ created: number; skipped: number } | null>(null);

  const lineCount = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean).length;

  function handlePrepare() {
    setError(null);
    setCreated(null);
    if (!category) {
      setError("Vyberte kategorii.");
      return;
    }
    if (lineCount === 0) {
      setError("Vlož alespoň jeden název.");
      return;
    }
    startTransition(async () => {
      const res = await bulkPrepare({ text, category });
      if (!res.ok || !res.items) {
        setError(res.error ?? "Příprava selhala.");
        return;
      }
      setItems(res.items.map(makeEditable));
    });
  }

  function updateItem(id: string, patch: Partial<Editable>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function toggleAll(enabled: boolean) {
    setItems((prev) => prev.map((it) => ({ ...it, enabled })));
  }

  function reset() {
    setItems([]);
    setText("");
    setError(null);
    setCreated(null);
  }

  function handleCreate() {
    setError(null);
    const enabled = items.filter((it) => it.enabled);
    if (enabled.length === 0) {
      setError("Žádné položky k vytvoření.");
      return;
    }
    startTransition(async () => {
      const res = await bulkCreate({
        items: enabled.map((it) => ({
          name: it.name,
          categorySlug: category,
          address: it.address || null,
          district: it.district || null,
          shortDesc: it.shortDesc || null,
          tags: it.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          phone: it.phone || null,
          email: it.email || null,
          website: it.website || null,
          instagram: it.instagram || null,
          facebook: it.facebook || null,
        })),
      });
      if (!res.ok) {
        setError(res.error ?? "Vytváření selhalo.");
        return;
      }
      setCreated({ created: res.created, skipped: res.skipped });
      setItems([]);
      router.refresh();
    });
  }

  // ─── Step 1: textarea + prepare ───
  if (items.length === 0) {
    return (
      <div className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-rose-strong/20 bg-rose/30 px-4 py-3 text-sm font-medium text-rose-strong">
            {error}
          </div>
        ) : null}
        {created ? (
          <div className="rounded-xl border border-mint-deep/20 bg-mint/30 px-4 py-3 text-sm font-medium text-mint-deep">
            Vytvořeno {created.created} míst jako koncepty.{" "}
            {created.skipped > 0
              ? `Přeskočeno ${created.skipped} (problém s daty).`
              : ""}{" "}
            Najdeš je v <strong>Místa</strong> → filtr <strong>Koncepty</strong>.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">
              Společná kategorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="self-end">
            <p className="text-xs text-ink-light">
              Maximum 30 míst najednou. <br />
              Aktuálně vloženo: <strong>{lineCount}</strong>
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">
            Seznam míst (jedno na řádek)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className={inputCls + " resize-y font-mono"}
            placeholder={"HogoFogo Bistro\nHola Bar Tapas\nTrattoria da Romeo\nKavárna Café Daniel\n..."}
          />
          <p className="mt-2 text-xs text-ink-light">
            Tip: Ať se ti AI trefí, vlož celý oficiální název. Můžeš
            přidat i městskou část v závorce, např.{" "}
            <code>Café U Reinerů (Vítkovice)</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrepare}
          disabled={pending || lineCount === 0}
          className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-7 py-3 text-[15px] font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Spinner /> Připravuju (~5–10 s na položku)…
            </>
          ) : (
            <>✨ Připravit {lineCount > 0 ? `(${lineCount})` : ""}</>
          )}
        </button>
      </div>
    );
  }

  // ─── Step 2: review + create ───
  const enabledCount = items.filter((it) => it.enabled).length;
  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-rose-strong/20 bg-rose/30 px-4 py-3 text-sm font-medium text-rose-strong">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card-lg border border-peach-strong/30 bg-peach/20 p-4">
        <div>
          <p className="text-sm font-semibold text-ink">
            Připraveno {items.length} míst, {enabledCount} vybráno
          </p>
          <p className="text-xs text-ink-muted">
            Kategorie:{" "}
            <strong>
              {categories.find((c) => c.slug === category)?.name ?? category}
            </strong>{" "}
            — uloží se jako <strong>Koncepty</strong>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleAll(true)}
            className="rounded-xl border border-line-hover bg-card px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface hover:text-ink"
          >
            Vybrat vše
          </button>
          <button
            type="button"
            onClick={() => toggleAll(false)}
            className="rounded-xl border border-line-hover bg-card px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface hover:text-ink"
          >
            Odznačit vše
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-line-hover bg-card px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface hover:text-ink"
          >
            Začít znovu
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.id}
            className={
              "rounded-card-lg border bg-card p-4 shadow-soft transition " +
              (it.enabled
                ? "border-line"
                : "border-line opacity-50")
            }
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <label className="flex flex-1 items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={it.enabled}
                  onChange={(e) =>
                    updateItem(it.id, { enabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-line-hover text-peach-strong focus:ring-peach-strong/30"
                />
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) => updateItem(it.id, { name: e.target.value })}
                  className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-bold text-ink hover:bg-surface focus:border-peach-strong focus:bg-card focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                aria-label="Odebrat"
                className="rounded-lg border border-line-hover px-2.5 py-1 text-xs text-rose-strong hover:bg-rose/30"
              >
                ✕
              </button>
            </div>

            {it.aiError ? (
              <p className="mb-3 rounded-md bg-rose/20 px-3 py-2 text-xs text-rose-strong">
                AI selhala: {it.aiError}
              </p>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Adresa">
                <input
                  type="text"
                  value={it.address}
                  onChange={(e) =>
                    updateItem(it.id, { address: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Čtvrť">
                <input
                  type="text"
                  value={it.district}
                  onChange={(e) =>
                    updateItem(it.id, { district: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Telefon">
                <input
                  type="tel"
                  value={it.phone}
                  onChange={(e) =>
                    updateItem(it.id, { phone: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="E-mail">
                <input
                  type="email"
                  value={it.email}
                  onChange={(e) =>
                    updateItem(it.id, { email: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Web">
                <input
                  type="text"
                  value={it.website}
                  onChange={(e) =>
                    updateItem(it.id, { website: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Instagram">
                <input
                  type="text"
                  value={it.instagram}
                  onChange={(e) =>
                    updateItem(it.id, { instagram: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Krátký popis" className="mt-2">
              <textarea
                value={it.shortDesc}
                onChange={(e) =>
                  updateItem(it.id, { shortDesc: e.target.value })
                }
                rows={2}
                className={inputCls + " resize-y"}
              />
            </Field>
            <Field label="Štítky (čárkami)" className="mt-2">
              <input
                type="text"
                value={it.tags}
                onChange={(e) => updateItem(it.id, { tags: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
        <button
          type="button"
          onClick={handleCreate}
          disabled={pending || enabledCount === 0}
          className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-6 py-3 text-[15px] font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Spinner /> Vytvářím…
            </>
          ) : (
            <>Vytvořit {enabledCount} koncept(ů)</>
          )}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ink-light">
        {label}
      </p>
      {children}
    </div>
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
