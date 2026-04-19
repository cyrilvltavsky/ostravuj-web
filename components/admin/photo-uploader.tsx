"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { deletePhotoAtSlot } from "@/app/admin/(authenticated)/places/actions";
import type { PlaceFormPhoto } from "./place-form";

const SLOTS = 6; // 1 main + 5 extras

export function PhotoUploader({
  existing,
  placeId,
}: {
  existing: PlaceFormPhoto[];
  placeId?: string;
}) {
  // Map sortOrder → existing url
  const existingMap = new Map(existing.map((p) => [p.sortOrder, p.url]));
  const [previews, setPreviews] = useState<Record<number, string | null>>({});
  const [pending, startTransition] = useTransition();

  function handleChange(slot: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviews((p) => ({ ...p, [slot]: URL.createObjectURL(file) }));
    } else {
      setPreviews((p) => ({ ...p, [slot]: null }));
    }
  }

  function handleDelete(slot: number) {
    if (!placeId) return;
    if (!confirm("Smazat fotku?")) return;
    startTransition(async () => {
      await deletePhotoAtSlot(placeId, slot);
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SLOTS }).map((_, slot) => {
        const previewUrl = previews[slot] ?? existingMap.get(slot) ?? null;
        const isMain = slot === 0;
        const inputId = `photo-${slot}`;
        const hasExisting = existingMap.has(slot);

        return (
          <div
            key={slot}
            className="relative rounded-xl border border-line bg-surface/40 p-3"
          >
            <label htmlFor={inputId} className="block cursor-pointer">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-light">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs font-semibold text-ink">
                {isMain ? "★ Hlavní fotka" : `Fotka ${slot + 1}`}
              </p>
              <p className="text-[11px] text-ink-light">
                {previewUrl ? "Klikněte pro změnu" : "Klikněte pro nahrání"}
              </p>
            </label>
            <input
              type="file"
              id={inputId}
              name={`photo_${slot}`}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleChange(slot, e)}
            />
            {hasExisting && placeId ? (
              <button
                type="button"
                onClick={() => handleDelete(slot)}
                disabled={pending}
                className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-rose-strong shadow-soft transition hover:bg-rose hover:text-white disabled:opacity-50"
                aria-label="Smazat fotku"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
