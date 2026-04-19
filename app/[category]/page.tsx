import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilterChips } from "@/components/filter-chips";
import {
  getAllCategories,
  getPlacesByCategory,
  getSubcategoriesInCategory,
} from "@/lib/queries/places";
import type { CategorySlug, SubcategorySlug } from "@/lib/places";

type Params = { category: string };

const KNOWN_SLUGS: CategorySlug[] = ["gastro", "aktivity", "rande", "zdarma"];

function isCategorySlug(s: string): s is CategorySlug {
  return (KNOWN_SLUGS as string[]).includes(s);
}

export const revalidate = 60;

export async function generateStaticParams(): Promise<Params[]> {
  const cats = await getAllCategories();
  return cats.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  const cats = await getAllCategories();
  const meta = cats.find((c) => c.slug === category);
  if (!meta) return { title: "Ostravuj" };
  return {
    title: `${meta.title} — Ostravuj`,
    description: meta.subtitle,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;
  if (!isCategorySlug(category)) notFound();

  const [cats, places, subs] = await Promise.all([
    getAllCategories(),
    getPlacesByCategory(category),
    getSubcategoriesInCategory(category),
  ]);
  const meta = cats.find((c) => c.slug === category);
  if (!meta) notFound();

  return (
    <>
      <div className="container-page">
        <Link
          href="/"
          className="mb-2 mt-6 inline-flex items-center gap-2 py-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
        >
          ← Zpět na hlavní stranu
        </Link>
      </div>

      <section className="pb-10 pt-10">
        <div className="container-page">
          <span className="mb-5 inline-block rounded-full bg-mint px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-mint-deep">
            {meta.eyebrow}
          </span>
          <h1 className="text-[clamp(36px,6vw,60px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
            {meta.title}
          </h1>
          <p className="mt-3 max-w-[620px] text-lg text-ink-muted">
            {meta.subtitle}
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <FilterChips
            places={places}
            subcategories={subs as SubcategorySlug[]}
          />
        </div>
      </section>
    </>
  );
}
