"use client";

import { useActionState } from "react";
import { submitSuggestion, type SuggestState } from "./action";

const CATEGORIES = [
  { value: "gastro", label: "Gastro (restaurace, kavárna, bistro, hospoda)" },
  { value: "aktivity", label: "Aktivity (galerie, památka, rodina)" },
  { value: "rande", label: "Kam na rande" },
  { value: "zdarma", label: "Zdarma" },
];

const initial: SuggestState = { success: false, error: null };

const inputClass =
  "w-full rounded-xl border border-line-hover bg-white px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-ink-light focus:border-ink focus:ring-1 focus:ring-ink";

export function SuggestForm() {
  const [state, formAction, pending] = useActionState(submitSuggestion, initial);

  if (state.success) {
    return (
      <div className="rounded-card-lg border border-mint-strong/30 bg-mint/40 p-10 text-center">
        <p className="mb-2 text-2xl font-bold text-mint-deep">Odesláno!</p>
        <p className="text-ink-muted">
          Děkujeme za váš návrh. Podíváme se na něj a&nbsp;pokud bude
          vyhovovat, místo přidáme.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-xl border border-rose-strong/30 bg-rose/40 px-5 py-3 text-sm font-medium text-rose-strong">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="placeName" className="mb-1.5 block text-sm font-semibold text-ink">
          Název místa <span className="text-rose-strong">*</span>
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
        <label htmlFor="category" className="mb-1.5 block text-sm font-semibold text-ink">
          Kategorie <span className="text-rose-strong">*</span>
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

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-ink">
          Krátký popis <span className="text-rose-strong">*</span>
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contactName" className="mb-1.5 block text-sm font-semibold text-ink">
            Vaše jméno <span className="text-rose-strong">*</span>
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
          <label htmlFor="contactEmail" className="mb-1.5 block text-sm font-semibold text-ink">
            Váš e-mail <span className="text-rose-strong">*</span>
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

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center gap-2 rounded-[14px] bg-ink px-7 py-3.5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1f2937] hover:shadow-soft-md disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Odesílám…" : "Odeslat návrh"}
      </button>
    </form>
  );
}
