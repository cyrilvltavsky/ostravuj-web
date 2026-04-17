import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiscountCode } from "@/components/discount-code";
import {
  PLACES,
  getCategory,
  getPlace,
  googleMapsUrl,
} from "@/lib/places";

type Params = { category: string; slug: string };

export function generateStaticParams(): Params[] {
  return PLACES.map((p) => ({ category: p.category, slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) return { title: "Ostravuj" };
  return {
    title: `${place.name} — Ostravuj`,
    description: place.shortDesc,
    openGraph: {
      title: place.name,
      description: place.shortDesc,
      images: [{ url: place.image }],
    },
  };
}

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, slug } = await params;
  const place = getPlace(slug);
  if (!place || place.category !== category) notFound();

  const meta = getCategory(place.category)!;
  const mapsUrl = googleMapsUrl(place.address);

  return (
    <>
      <div className="container-page">
        <Link
          href={{ pathname: `/${place.category}` }}
          className="mb-2 mt-6 inline-flex items-center gap-2 py-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
        >
          ← Zpět na {meta.title}
        </Link>
      </div>

      <section className="pb-10 pt-4">
        <div className="container-page">
          <div className="mb-4 flex flex-wrap items-center gap-2.5 text-[13px] font-medium text-ink-muted">
            <span className="rounded-full bg-surface px-3 py-1.5 font-semibold text-ink">
              {meta.title}
            </span>
            <span>{place.district}</span>
          </div>
          <h1 className="mb-4 text-[clamp(36px,6vw,60px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink">
            {place.name}
          </h1>
          <p className="flex items-center gap-2 text-[17px] text-ink-muted">
            <span aria-hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span>
            <span>{place.address}</span>
          </p>
        </div>
      </section>

      <div className="container-page">
        {/* Gallery — uses the same image multiple times until photos table is wired up */}
        <div className="mb-12 grid aspect-[16/9] grid-cols-1 grid-rows-1 gap-3 overflow-hidden rounded-card-lg md:aspect-[16/9] md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2">
          <div className="relative bg-surface md:row-span-2">
            <Image
              src={place.image}
              alt={place.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative hidden bg-surface md:block">
              <Image
                src={place.image}
                alt=""
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="grid gap-12 pb-20 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="mb-3.5 text-[13px] font-bold uppercase tracking-wider text-ink-light">
              O místě
            </h2>
            <p className="mb-8 text-[18px] leading-[1.75] text-ink">
              {place.shortDesc}
            </p>

            <h2 className="mb-3.5 text-[13px] font-bold uppercase tracking-wider text-ink-light">
              Štítky
            </h2>
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface px-3.5 py-1.5 text-[13px] font-medium text-ink-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <aside className="space-y-4 self-start md:sticky md:top-[100px]">
            <div className="rounded-card-lg border border-line bg-white p-7">
              <h4 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-ink-light">
                Navigace
              </h4>
              <p className="mb-5 text-[15px] leading-relaxed text-ink">
                {place.address}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-ink px-5 py-3.5 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1f2937]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Navigovat přes Google Maps
              </a>
            </div>

            {place.discountCode ? (
              <DiscountCode code={place.discountCode} />
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
