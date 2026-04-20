"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { submitSuggestion, type SuggestState } from "./action";

const CATEGORIES = [
  { value: "gastro", label: "Gastro (restaurace, kavárna, bistro, hospoda)" },
  { value: "aktivity", label: "Aktivity (galerie, památka, rodina)" },
  { value: "rande", label: "Kam na rande" },
  { value: "zdarma", label: "Zdarma" },
];

const initial: SuggestState = { success: false, error: null };

const inputClass =
  "w-full rounded-xl border border-line bg-surface/50 px-4 py-3 text-[15px] text-ink shadow-soft outline-none transition-all placeholder:text-ink-light focus:border-peach-strong focus:bg-card focus:shadow-soft-md focus:ring-1 focus:ring-peach-strong/30";

export function SuggestForm() {
  const [state, formAction, pending] = useActionState(submitSuggestion, initial);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  if (state.success) {
    return (
      <div className="rounded-card-lg bg-gradient-to-br from-mint/60 to-mint/30 p-12 text-center shadow-soft-md">
        <div className="mb-4 text-4xl">&#10003;</div>
        <p className="mb-2 text-2xl font-bold text-mint-deep">Odesláno!</p>
        <p className="text-ink-muted">
          Děkujeme za váš návrh. Podíváme se na něj a&nbsp;pokud bude
          vyhovovat, místo přidáme.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-xl border border-rose-strong/20 bg-rose/30 px-5 py-3.5 text-sm font-medium text-rose-strong shadow-soft">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="placeName" className="mb-2 block text-sm font-semibold text-ink">
            Název místa <span className="text-peach-strong">*</span>
          </label>
          <input
            type="text"
            id="placeName"
            name="placeName"
            required
            placeholder="např. Café XY"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-semibold text-ink">
            Kategorie <span className="text-peach-strong">*</span>
          </label>
          <select id="category" name="category" required className={inputClass}>
            <option value="">Vyberte kategorii</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-semibold text-ink">
          Krátký popis <span className="text-peach-strong">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="Proč by tu místo mělo být? Co ho dělá výjimečným?"
          className={inputClass + " resize-y"}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">
          Fotografie místa <span className="font-normal text-ink-light">(nepovinné)</span>
        </label>
        <label
          htmlFor="photo"
          className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line-hover bg-surface/50 px-6 py-8 shadow-soft transition-all hover:border-peach-strong/50 hover:bg-peach/20 hover:shadow-soft-md"
        >
          {preview ? (
            <div className="relative h-32 w-full overflow-hidden rounded-lg">
              <Image
                src={preview}
                alt="Náhled fotky"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-peach/50 text-xl text-peach-strong transition-colors group-hover:bg-peach">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <span className="text-sm text-ink-muted">
                Klikněte pro nahrání fotky <span className="text-ink-light">(JPG, PNG, max 5 MB)</span>
              </span>
            </>
          )}
        </label>
        <input
          type="file"
          id="photo"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="border-t border-line" />

      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-light">
          Vaše kontaktní údaje
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contactName" className="mb-2 block text-sm font-semibold text-ink">
              Jméno <span className="text-peach-strong">*</span>
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              required
              placeholder="Jan Novák"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="mb-2 block text-sm font-semibold text-ink">
              E-mail <span className="text-peach-strong">*</span>
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              required
              placeholder="jan@email.cz"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2.5 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-8 py-3.5 text-[15px] font-semibold text-white shadow-soft-md transition-all hover:-translate-y-0.5 hover:shadow-soft-lg disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? "Odesílám…" : "Odeslat návrh"}
        </button>
        <p className="text-xs leading-relaxed text-ink-light">
          Odesláním souhlasím se{" "}
          <Link
            href="/ochrana-osobnich-udaju"
            className="text-ink-muted underline underline-offset-2 transition-colors hover:text-peach-strong"
          >
            zpracováním osobních údajů
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
