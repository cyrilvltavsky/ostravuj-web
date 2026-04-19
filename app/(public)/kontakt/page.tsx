import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PlaceCard } from "@/components/place-card";
import {
  getAllCategories,
  getPlacesByCategory,
} from "@/lib/queries/places";
import type { Place } from "@/lib/places";

export const metadata: Metadata = {
  title: "Kontakt — Ostravuj",
  description: "Kontaktní údaje projektu Ostravuj.",
};

export const revalidate = 60;

async function pickRandomFromCategory(): Promise<Place[]> {
  const cats = await getAllCategories();
  const lists = await Promise.all(
    cats.map((cat) => getPlacesByCategory(cat.slug)),
  );
  return lists
    .map((places) =>
      places.length === 0
        ? null
        : places[Math.floor(Math.random() * places.length)],
    )
    .filter((p): p is Place => Boolean(p));
}

export default async function ContactPage() {
  const randomPlaces = await pickRandomFromCategory();

  return (
    <>
      <section className="pb-20 pt-16">
        <div className="container-page max-w-[720px]">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
          >
            ← Zpět na hlavní stranu
          </Link>

          <h1 className="mb-10 text-[clamp(32px,5vw,48px)] font-extrabold leading-tight tracking-tight text-ink">
            Kontakt
          </h1>

          {/* CONTACT CARD */}
          <div className="relative overflow-hidden rounded-card-xl border border-line bg-white shadow-soft-md">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full opacity-30"
              style={{
                background:
                  "radial-gradient(circle, var(--peach, #ffe4d6) 0%, transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 h-[160px] w-[160px] rounded-full opacity-25"
              style={{
                background:
                  "radial-gradient(circle, var(--lavender, #ede9fe) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex flex-col items-center gap-8 p-8 sm:flex-row-reverse sm:items-center md:p-10">
              {/* PHOTO */}
              <div className="shrink-0">
                <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-white shadow-soft-lg sm:h-40 sm:w-40">
                  <Image
                    src="/cyril.jpg"
                    alt="Cyril Vltavský"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* DETAILS */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-gradient text-[clamp(24px,4vw,32px)] font-extrabold tracking-tight">
                  Cyril Vltavský
                </h2>

                <div className="mt-4 space-y-2.5">
                  <a
                    href="tel:+420737370572"
                    className="flex items-center justify-center gap-3 text-lg text-ink transition-colors hover:text-peach-strong sm:justify-start"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-peach/50 text-peach-strong">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </span>
                    +420 737 370 572
                  </a>
                  <a
                    href="mailto:info@ostravuj.cz"
                    className="flex items-center justify-center gap-3 text-lg text-ink transition-colors hover:text-peach-strong sm:justify-start"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender/50 text-violet-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </span>
                    info@ostravuj.cz
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* SUGGEST CTA */}
          <div className="mt-10 relative overflow-hidden rounded-card-xl bg-gradient-to-br from-[#fff7ed] via-[#fef3f2] to-[#f5f3ff] p-8 text-center shadow-soft md:p-10">
            <span
              aria-hidden
              className="absolute left-8 top-6 opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-peach-strong"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </span>
            <span
              aria-hidden
              className="absolute bottom-6 right-8 opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </span>
            <h3 className="text-[clamp(20px,3vw,28px)] font-extrabold tracking-tight text-ink">
              Máte tip na další místo?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[16px] text-ink-muted">
              Pošlete nám svůj návrh a my se na něj podíváme. Třeba ho
              přidáme do našeho výběru.
            </p>
            <Link
              href="/navrh-misto"
              className="mt-6 inline-flex items-center gap-2.5 rounded-[14px] bg-gradient-to-r from-peach-strong to-rose-strong px-7 py-3.5 text-[15px] font-semibold text-white shadow-soft-md transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              Navrhnout místo →
            </Link>
          </div>
        </div>
      </section>

      {/* RANDOM PLACES */}
      <section className="pb-20">
        <div className="container-page">
          <h2 className="mb-8 text-center text-[clamp(24px,4vw,36px)] font-extrabold tracking-tight text-ink">
            Objevte něco nového
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {randomPlaces.map((place) => (
              <PlaceCard key={place.slug} place={place} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/gastro"
              className="inline-flex items-center gap-2.5 rounded-[14px] border border-line-hover bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-surface"
            >
              Prohlédnout všechna místa →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
