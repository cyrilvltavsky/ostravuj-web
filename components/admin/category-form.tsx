"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import type { CategoryFormState } from "@/app/admin/(authenticated)/categories/actions";

const initial: CategoryFormState = { error: null };

const inputClass =
  "w-full rounded-xl border border-line bg-card px-4 py-2.5 text-[15px] text-ink shadow-soft outline-none transition-all placeholder:text-ink-light focus:border-peach-strong focus:ring-1 focus:ring-peach-strong/30";
const labelClass = "mb-1.5 block text-sm font-semibold text-ink";

function slugifyClient(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function CategoryForm({
  action,
  defaults,
  isEdit,
}: {
  action: (
    prevState: CategoryFormState,
    formData: FormData,
  ) => Promise<CategoryFormState>;
  defaults?: {
    name?: string;
    slug?: string;
    subtitle?: string | null;
    eyebrow?: string | null;
    description?: string | null;
    imageUrl?: string | null;
  };
  isEdit?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  const [name, setName] = useState(defaults?.name ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));
  const [imagePreview, setImagePreview] = useState<string | null>(
    defaults?.imageUrl ?? null,
  );

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setName(v);
    if (!slugTouched) setSlug(slugifyClient(v));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setImagePreview(URL.createObjectURL(f));
  }

  return (
    <form action={formAction} className="space-y-6 max-w-[640px]">
      {state.error ? (
        <div className="rounded-xl border border-rose-strong/20 bg-rose/30 px-4 py-3 text-sm font-medium text-rose-strong">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Název <span className="text-peach-strong">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={name}
            onChange={handleNameChange}
            className={inputClass}
            placeholder="Gastro"
          />
        </div>
        <div>
          <label className={labelClass}>
            Slug (URL) <span className="text-peach-strong">*</span>
          </label>
          <input
            type="text"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className={inputClass}
            placeholder="gastro"
          />
          {isEdit ? (
            <p className="mt-1 text-xs text-peach-deep">
              Změna slugu přepíše URL kategorie i odkazy z míst.
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className={labelClass}>Eyebrow (malý badge nad nadpisem)</label>
        <input
          type="text"
          name="eyebrow"
          defaultValue={defaults?.eyebrow ?? ""}
          className={inputClass}
          placeholder="Gastro scéna"
        />
      </div>

      <div>
        <label className={labelClass}>Podtitulek</label>
        <textarea
          name="subtitle"
          rows={2}
          defaultValue={defaults?.subtitle ?? ""}
          className={inputClass + " resize-y"}
          placeholder="Restaurace, bistra, kavárny a hospody…"
        />
      </div>

      <div>
        <label className={labelClass}>Krátký popis (pro karty)</label>
        <input
          type="text"
          name="description"
          defaultValue={defaults?.description ?? ""}
          className={inputClass}
          placeholder="Restaurace, bistra, kavárny a hospody"
        />
      </div>

      <div>
        <label className={labelClass}>Hlavní fotka kategorie</label>
        <label
          htmlFor="image"
          className="block cursor-pointer rounded-xl border border-dashed border-line-hover bg-surface/40 p-3 transition hover:bg-surface"
        >
          {imagePreview ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface">
              <Image
                src={imagePreview}
                alt=""
                fill
                sizes="640px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-sm text-ink-light">
              Klikněte pro nahrání fotky
            </div>
          )}
          <p className="mt-2 text-xs text-ink-light">
            JPG / PNG / WEBP, max 5 MB. Pokud necháte prázdné, zachová se
            stávající.
          </p>
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-7 py-3 text-[15px] font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5 hover:shadow-soft-lg disabled:pointer-events-none disabled:opacity-60"
      >
        {pending
          ? "Ukládám…"
          : isEdit
            ? "Uložit změny"
            : "Vytvořit kategorii"}
      </button>
    </form>
  );
}
