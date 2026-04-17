import Link from "next/link";
import { CategoryCard } from "@/components/category-card";
import { PlaceCard } from "@/components/place-card";
import { BigRandomButton, HeroRandomButton } from "@/components/random-picker";
import {
  CATEGORIES,
  PLACES,
  categoryCounts,
  featuredPlaces,
} from "@/lib/places";

export default function HomePage() {
  const counts = categoryCounts();
  const featured = featuredPlaces();
  const total = PLACES.length;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pb-16 pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[10%] -top-[20%] -z-10 h-[500px] w-[500px] rounded-full opacity-50 blur-[2px]"
          style={{
            background:
              "radial-gradient(circle, var(--peach, #ffe4d6) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[15%] top-[10%] -z-10 h-[400px] w-[400px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, var(--lavender, #ede9fe) 0%, transparent 70%)",
          }}
        />
        <div className="container-page">
          <h1 className="mb-6 max-w-[820px] text-[clamp(40px,7vw,72px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink">
            Objevuj nejlepší místa
            <br />
            <span className="text-gradient">v Ostravě</span>.
          </h1>
          <p className="mb-10 max-w-[620px] text-[19px] text-ink-muted">
            Ručně vybrané restaurace, kavárny, hospody, galerie, památky i tipy
            na rande. Jen ta místa, která stojí za to.
          </p>
          <div className="flex flex-wrap gap-3">
            <HeroRandomButton>
              <span>🎲</span> Překvap mě
            </HeroRandomButton>
            <Link
              href={{ pathname: "/gastro" }}
              className="inline-flex items-center gap-2.5 rounded-[14px] border border-line-hover bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-surface"
            >
              Procházet gastro →
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-10 pb-20">
        <div className="container-page">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.slug}
                category={cat}
                count={counts[cat.slug]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="pb-20 pt-10">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight text-ink">
                Doporučená místa
              </h2>
              <p className="mt-2 text-base text-ink-muted">
                Ručně vybraný výběr toho nejlepšího v Ostravě a Porubě
              </p>
            </div>
            <Link
              href={{ pathname: "/gastro" }}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-all"
            >
              Zobrazit vše{" "}
              <span className="transition-all group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((place) => (
              <PlaceCard key={place.slug} place={place} />
            ))}
          </div>
        </div>
      </section>

      {/* RANDOM CTA */}
      <section className="py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-card-xl bg-gradient-to-br from-[#fff7ed] via-[#fef3f2] to-[#f5f3ff] px-14 py-16 text-center">
            <span
              aria-hidden
              className="absolute left-14 top-10 text-2xl opacity-60"
            >
              ✨
            </span>
            <span
              aria-hidden
              className="absolute bottom-10 right-14 text-2xl opacity-60"
            >
              ✨
            </span>
            <span className="text-[13px] font-bold uppercase tracking-wider text-peach-deep">
              Nevíš kam?
            </span>
            <h2 className="mb-3.5 mt-3 text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-ink">
              Nech se překvapit
            </h2>
            <p className="mx-auto mb-8 max-w-[500px] text-[17px] text-ink-muted">
              Máme pro tebe {total} ověřených míst. Klikni a my ti jedno náhodně
              vybereme – třeba objevíš něco, co bys sám nenašel.
            </p>
            <BigRandomButton>
              <span>🎲</span> Vybrat náhodně
            </BigRandomButton>
          </div>
        </div>
      </section>
    </>
  );
}
