import type { Metadata } from "next";
import Link from "next/link";
import { PlaceCard } from "@/components/place-card";
import {
  getAllCategories,
  getAllPlaces,
} from "@/lib/queries/places";
import { recommend } from "@/lib/recommender";
import { RecommenderForm } from "./form";

export const metadata: Metadata = {
  title: "Doporuč mi místo — Ostravuj",
  description:
    "Vybírej z preferencí: napiš co tě baví a klikni na kategorie. My doporučíme místa, která sedí.",
};

export const revalidate = 60;

type SP = { q?: string; c?: string };

export default async function RecommendPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").toString().trim();
  const selected = (sp.c ?? "")
    .toString()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const [categories, places] = await Promise.all([
    getAllCategories(),
    getAllPlaces(),
  ]);

  const hasInput = query.length > 0 || selected.length > 0;
  const scored = hasInput
    ? recommend(places, { query, categories: selected })
    : [];

  return (
    <section className="pb-20 pt-16">
      <div className="container-page max-w-[920px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
        >
          ← Zpět na hlavní stranu
        </Link>

        <h1 className="mb-3 text-[clamp(32px,5vw,48px)] font-extrabold leading-tight tracking-tight text-ink">
          Doporuč mi <span className="text-gradient">místo</span>
        </h1>
        <p className="mb-8 max-w-[620px] text-[17px] text-ink-muted">
          Napiš, co tě baví — třeba brunch s kávou nebo klidná zahrádka —
          a vyber kategorie. Najdeme místa, kde to nejvíc sedí.
        </p>

        <RecommenderForm
          categories={categories.map((c) => ({ slug: c.slug, name: c.title }))}
          defaultQuery={query}
          defaultSelected={selected}
        />

        {hasInput ? (
          <div className="mt-12">
            {scored.length === 0 ? (
              <div className="rounded-card-lg border border-line bg-white p-10 text-center text-ink-muted shadow-soft">
                <p className="font-semibold text-ink">
                  Nic přesně nesedí na tvé hledání.
                </p>
                <p className="mt-2 text-sm">
                  Zkus jiné slovo nebo zruš filtr kategorií.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-baseline justify-between">
                  <h2 className="text-2xl font-extrabold tracking-tight text-ink">
                    {scored.length} doporuče{scored.length === 1 ? "ní" : "ní"}
                  </h2>
                  <p className="text-sm text-ink-light">
                    Seřazeno podle relevance
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {scored.slice(0, 30).map(({ place, reasons }) => (
                    <div key={place.slug} className="flex flex-col gap-2">
                      <PlaceCard place={place} />
                      {reasons.length > 0 ? (
                        <p className="px-1 text-[11px] font-medium uppercase tracking-wider text-ink-light">
                          Shoda: {reasons.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="mt-12 rounded-card-lg border border-line bg-white p-8 text-center text-sm text-ink-muted shadow-soft">
            Zadej dotaz nebo vyber kategorii pro doporučení. Nebo si nech
            <Link
              href="/"
              className="font-medium text-ink underline underline-offset-2 hover:text-peach-strong"
            >
              {" "}náhodně vybrat na hlavní stránce
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
