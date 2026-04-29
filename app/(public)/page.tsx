import Link from "next/link";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { CategoryCard } from "@/components/category-card";
import { FeaturedShuffled } from "@/components/featured-shuffled";
import { HomeSearch } from "@/components/home-search";
import { BigRandomButton, HeroRandomButton } from "@/components/random-picker";
import {
  getAllCategories,
  getAllFeaturedPlaces,
  getAllPlaces,
  getCategoryCounts,
  getSubcategoriesInCategory,
  getTotalPlaceCount,
} from "@/lib/queries/places";
import { SUBCATEGORY_LABELS, type SubcategorySlug } from "@/lib/places";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, counts, featured, allPlaces, total] = await Promise.all([
    getAllCategories(),
    getCategoryCounts(),
    getAllFeaturedPlaces(),
    getAllPlaces(),
    getTotalPlaceCount(),
  ]);
  const subsByCategory = await Promise.all(
    categories.map((c) => getSubcategoriesInCategory(c.slug)),
  );

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
            Objevuj
            <br />
            nejlepší místa
            <br />
            <span className="text-gradient">v Ostravě</span>
          </h1>
          <p className="mb-10 max-w-[620px] text-[19px] text-ink-muted">
            Ručně vybrané restaurace, kavárny, hospody, galerie, památky i tipy
            na rande. Jen ta místa, která stojí za to.
          </p>
          <div className="mb-7">
            <HomeSearch places={allPlaces} categories={categories} />
          </div>
          <div className="flex flex-wrap gap-3">
            <HeroRandomButton>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/></svg> Překvap mě
            </HeroRandomButton>
            <Link
              href="/doporuc"
              className="inline-flex items-center gap-2.5 rounded-[14px] border border-line-hover bg-card px-6 py-3.5 text-[15px] font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-surface"
            >
              Doporuč mi místo →
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-10 pb-20">
        <div className="container-page">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {categories.map((cat, i) => (
              <AnimateOnScroll key={cat.slug} delay={i * 80}>
                <CategoryCard
                  category={cat}
                  count={counts[cat.slug]}
                  subcategories={
                    (subsByCategory[i] as SubcategorySlug[])
                      .map(
                        (s) =>
                          SUBCATEGORY_LABELS[s as SubcategorySlug] ?? s,
                      )
                      .slice(0, 6)
                  }
                />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="pb-20 pt-10">
        <div className="container-page">
          <AnimateOnScroll>
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
                <span className="transition-all group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </AnimateOnScroll>
          <FeaturedShuffled places={featured} />
        </div>
      </section>

      {/* RANDOM CTA */}
      <AnimateOnScroll>
        <section className="py-20">
          <div className="container-page">
            <div className="relative overflow-hidden rounded-card-xl bg-gradient-to-br from-[#fff7ed] via-[#fef3f2] to-[#f5f3ff] px-14 py-16 text-center dark:from-[#1f1f23] dark:via-[#27272a] dark:to-[#1a1a1d]">
              <span
                aria-hidden
                className="absolute left-14 top-10 opacity-60"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-peach-strong"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </span>
              <span
                aria-hidden
                className="absolute bottom-10 right-14 opacity-60"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </span>
              <span className="text-[13px] font-bold uppercase tracking-wider text-peach-deep dark:text-peach-strong">
                Nevíš kam?
              </span>
              <h2 className="mb-3.5 mt-3 text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight text-ink dark:text-white">
                Objevuj nejlepší místa v Ostravě
              </h2>
              <p className="mx-auto mb-8 max-w-[500px] text-[17px] text-ink-muted dark:text-white/80">
                Máme pro tebe {total} ověřených míst. Klikni a my ti jedno
                náhodně vybereme. Třeba objevíš něco, co bys sám nenašel.
              </p>
              <BigRandomButton>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/></svg> Vybrat náhodně
              </BigRandomButton>
            </div>
          </div>
        </section>
      </AnimateOnScroll>
    </>
  );
}
