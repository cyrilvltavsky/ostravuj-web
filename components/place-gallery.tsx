"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Detail-page gallery: one large 4:3 main photo, then thumbnails of
 * additional photos beneath it. Clicking any photo opens a lightbox
 * (zoom view) with arrow / ESC navigation.
 */
export function PlaceGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Keyboard nav inside lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight")
        setActive((i) => Math.min(photos.length - 1, i + 1));
      else if (e.key === "ArrowLeft") setActive((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen, photos.length]);

  if (photos.length === 0) return null;

  return (
    <>
      {/* Main photo */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-card-lg bg-surface"
        aria-label="Zvětšit fotku"
      >
        <Image
          src={photos[active]}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 1100px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority
        />
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink opacity-0 backdrop-blur transition group-hover:opacity-100">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M21 14v7H3V3h7" />
          </svg>
          Zvětšit
        </span>
      </button>

      {/* Thumbnails */}
      {photos.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {photos.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => {
                setActive(i);
                setLightboxOpen(true);
              }}
              onMouseEnter={() => setActive(i)}
              className={`relative aspect-[4/3] overflow-hidden rounded-card-sm bg-surface ring-2 transition ${
                i === active
                  ? "ring-peach-strong"
                  : "ring-transparent hover:ring-line-hover"
              }`}
              aria-label={`Fotka ${i + 1}`}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* Lightbox */}
      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zvětšená fotka"
          className="fixed inset-0 z-[200] flex animate-fade-in flex-col items-center justify-center bg-ink/90 p-4 backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Zavřít"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            ✕
          </button>

          {/* Prev / Next */}
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setActive((i) => Math.max(0, i - 1))}
                disabled={active === 0}
                aria-label="Předchozí"
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() =>
                  setActive((i) => Math.min(photos.length - 1, i + 1))
                }
                disabled={active === photos.length - 1}
                aria-label="Další"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
              >
                ›
              </button>
            </>
          ) : null}

          {/* Image */}
          <div className="relative mx-auto h-[80vh] w-full max-w-[1200px]">
            <Image
              src={photos[active]}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {photos.length > 1 ? (
            <p className="mt-4 text-sm font-medium text-white/70">
              {active + 1} / {photos.length}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
