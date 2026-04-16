import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilterChips } from "@/components/filter-chips";
import {
  CATEGORIES,
  getCategory,
  isCategorySlug,
  placesInCategory,
  subcategoriesInCategory,
} from "@/lib/places";

type Params = { category: string };

export function generateStaticParams(): Params[] {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = getCategory(category);
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

  const meta = getCategory(category)!;
  const places = placesInCategory(category);
  const subs = subcategoriesInCategory(category);

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
          <FilterChips places={places} subcategories={subs} />
        </div>
      </section>
    </>
  );
}
