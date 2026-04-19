"use client";

import { useActionState } from "react";
import { PhotoUploader } from "./photo-uploader";
import type { PlaceFormState } from "@/app/admin/(authenticated)/places/actions";

const initial: PlaceFormState = { error: null };

export type PlaceFormCategory = { id: number; name: string; slug: string };

export type PlaceFormPhoto = { url: string; sortOrder: number };

export type PlaceFormDefaults = {
  name?: string;
  slug?: string;
  categoryId?: number;
  subcategory?: string | null;
  district?: string | null;
  address?: string;
  shortDesc?: string;
  description?: string;
  tags?: string[];
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  showContacts?: boolean;
  showDiscount?: boolean;
  featured?: boolean;
  status?: "PUBLISHED" | "ARCHIVED";
  discountCode?: string | null;
  photos?: PlaceFormPhoto[];
};

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink shadow-soft outline-none transition-all placeholder:text-ink-light focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30";

const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

const subcategoryOptions = [
  "restaurace",
  "bistro",
  "kavarna",
  "hospoda",
  "galerie",
  "pamatka",
  "rodina",
  "vyhlidka",
];

export function PlaceForm({
  action,
  defaults = {},
  categories,
  placeId,
  saved,
}: {
  action: (
    prevState: PlaceFormState,
    formData: FormData,
  ) => Promise<PlaceFormState>;
  defaults?: PlaceFormDefaults;
  categories: PlaceFormCategory[];
  placeId?: string;
  saved?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6 pb-12">
      {state.error ? (
        <div className="rounded-xl border border-rose-strong/20 bg-rose/30 px-4 py-3 text-sm font-medium text-rose-strong">
          {state.error}
        </div>
      ) : saved ? (
        <div className="rounded-xl border border-mint-deep/20 bg-mint/30 px-4 py-3 text-sm font-medium text-mint-deep">
          Uloženo ✓
        </div>
      ) : null}

      <Section title="Základní údaje">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Název" required>
            <input
              type="text"
              name="name"
              required
              defaultValue={defaults.name ?? ""}
              className={inputClass}
              placeholder="HogoFogo Bistro"
            />
          </Field>
          <Field label="Slug (URL)" hint="Pokud necháte prázdné, vygeneruje se z názvu">
            <input
              type="text"
              name="slug"
              defaultValue={defaults.slug ?? ""}
              className={inputClass}
              placeholder="hogofogo-bistro"
            />
          </Field>
          <Field label="Kategorie" required>
            <select
              name="categoryId"
              required
              defaultValue={defaults.categoryId}
              className={inputClass}
            >
              <option value="">— vyberte —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subkategorie">
            <select
              name="subcategory"
              defaultValue={defaults.subcategory ?? ""}
              className={inputClass}
            >
              <option value="">— žádná —</option>
              {subcategoryOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Fotografie" hint="Hlavní fotka + až 5 doplňkových (max 5 MB, JPG/PNG/WEBP)">
        <PhotoUploader existing={defaults.photos ?? []} placeId={placeId} />
      </Section>

      <Section title="Adresa a popis">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Adresa" required>
            <input
              type="text"
              name="address"
              required
              defaultValue={defaults.address ?? ""}
              className={inputClass}
              placeholder="Pivovarská 1, 702 00 Moravská Ostrava"
            />
          </Field>
          <Field label="Čtvrť">
            <input
              type="text"
              name="district"
              defaultValue={defaults.district ?? ""}
              className={inputClass}
              placeholder="Moravská Ostrava"
            />
          </Field>
        </div>
        <Field label="Krátký popis" required hint="Zobrazí se v kartě i detailu">
          <textarea
            name="shortDesc"
            required
            rows={3}
            defaultValue={defaults.shortDesc ?? ""}
            className={inputClass + " resize-y"}
            placeholder="Stylové bistro v historickém domě..."
          />
        </Field>
        <Field label="Tagy" hint="Oddělené čárkami, např. lokální suroviny, zahrádka, brunch">
          <input
            type="text"
            name="tags"
            defaultValue={defaults.tags?.join(", ") ?? ""}
            className={inputClass}
            placeholder="lokální suroviny, zahrádka"
          />
        </Field>
      </Section>

      <Section title="Kontakty" hint="Volitelné — zobrazí se na detailu pokud je zaškrtnuto níže">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefon">
            <input
              type="tel"
              name="phone"
              defaultValue={defaults.phone ?? ""}
              className={inputClass}
              placeholder="+420 737 370 572"
            />
          </Field>
          <Field label="E-mail">
            <input
              type="email"
              name="email"
              defaultValue={defaults.email ?? ""}
              className={inputClass}
              placeholder="info@misto.cz"
            />
          </Field>
          <Field label="Web">
            <input
              type="url"
              name="website"
              defaultValue={defaults.website ?? ""}
              className={inputClass}
              placeholder="https://misto.cz"
            />
          </Field>
          <Field label="Instagram">
            <input
              type="text"
              name="instagram"
              defaultValue={defaults.instagram ?? ""}
              className={inputClass}
              placeholder="@misto_oficialni"
            />
          </Field>
          <Field label="Facebook">
            <input
              type="text"
              name="facebook"
              defaultValue={defaults.facebook ?? ""}
              className={inputClass}
              placeholder="misto-oficialni nebo URL"
            />
          </Field>
        </div>
        <Toggle
          name="showContacts"
          defaultChecked={defaults.showContacts ?? true}
          label="Zobrazit kontakty na detailu"
        />
      </Section>

      <Section title="Slevový kód" hint="Volitelný — platí pouze pro toto místo">
        <Field label="Kód">
          <input
            type="text"
            name="discountCode"
            defaultValue={defaults.discountCode ?? ""}
            className={inputClass}
            placeholder="OSTRAVUJ10"
          />
        </Field>
        <Toggle
          name="showDiscount"
          defaultChecked={defaults.showDiscount ?? true}
          label="Zobrazit slevový kód na detailu"
        />
      </Section>

      <Section title="Publikace">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select
              name="status"
              defaultValue={defaults.status ?? "PUBLISHED"}
              className={inputClass}
            >
              <option value="PUBLISHED">Publikované</option>
              <option value="ARCHIVED">Archivované</option>
            </select>
          </Field>
        </div>
        <Toggle
          name="featured"
          defaultChecked={defaults.featured ?? false}
          label="Doporučené (zobrazit na hlavní stránce)"
        />
      </Section>

      <div className="sticky bottom-0 -mx-6 -mb-12 border-t border-line bg-white/95 px-6 py-4 backdrop-blur md:-mx-10 md:px-10">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-7 py-3 text-[15px] font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 hover:shadow-soft-lg disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? "Ukládám…" : placeId ? "Uložit změny" : "Vytvořit místo"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card-lg border border-line bg-white p-6 shadow-soft">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {hint ? <p className="mb-4 mt-1 text-sm text-ink-muted">{hint}</p> : <div className="mb-4" />}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required ? <span className="text-peach-strong"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-ink-light">{hint}</p> : null}
    </div>
  );
}

function Toggle({
  name,
  defaultChecked,
  label,
}: {
  name: string;
  defaultChecked: boolean;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-line-hover text-peach-strong focus:ring-peach-strong/30"
      />
      {label}
    </label>
  );
}
