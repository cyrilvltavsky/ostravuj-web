import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiscountCode } from "@/components/discount-code";
import { hasVisibleContacts, mapyComUrl, youtubeIdFromUrl } from "@/lib/places";
import {
  getAllCategories,
  getAllPlaceParams,
  getPlaceBySlug,
  getPlacePhotos,
} from "@/lib/queries/places";

type Params = { category: string; slug: string };

export const revalidate = 60;

export async function generateStaticParams(): Promise<Params[]> {
  return getAllPlaceParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
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
  const [place, cats, allPhotos] = await Promise.all([
    getPlaceBySlug(slug),
    getAllCategories(),
    getPlacePhotos(slug),
  ]);
  if (!place || place.category !== category) notFound();

  const meta = cats.find((c) => c.slug === place.category);
  if (!meta) notFound();

  const mapsUrl = mapyComUrl(place.address);
  const showContacts = hasVisibleContacts(place);
  const c = place.contacts;
  const ytId = youtubeIdFromUrl(place.youtubeUrl);
  // Gallery: pad with main photo up to 5 placeholders for the layout
  const galleryPhotos = [
    ...allPhotos,
    ...Array(Math.max(0, 5 - allPhotos.length)).fill(place.image),
  ].slice(0, 5);

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
              src={galleryPhotos[0]}
              alt={place.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          {galleryPhotos.slice(1, 5).map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative hidden bg-surface md:block"
            >
              <Image
                src={url}
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

            {ytId ? (
              <>
                <h2 className="mb-3.5 text-[13px] font-bold uppercase tracking-wider text-ink-light">
                  Video
                </h2>
                <div className="mb-8 aspect-video overflow-hidden rounded-card-lg bg-ink">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title={`${place.name} — video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </>
            ) : null}

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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Navigovat přes Mapy.com
              </a>
            </div>

            {showContacts && c ? (
              <div className="rounded-card-lg border border-line bg-white p-7">
                <h4 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-ink-light">
                  Kontakty
                </h4>
                <ul className="space-y-3 text-[15px]">
                  {c.phone ? (
                    <li>
                      <a
                        href={`tel:${c.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-3 text-ink transition-colors hover:text-peach-strong"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-peach/50 text-peach-strong">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </span>
                        {c.phone}
                      </a>
                    </li>
                  ) : null}
                  {c.email ? (
                    <li>
                      <a
                        href={`mailto:${c.email}`}
                        className="flex items-center gap-3 break-all text-ink transition-colors hover:text-peach-strong"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender/50 text-violet-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        </span>
                        {c.email}
                      </a>
                    </li>
                  ) : null}
                  {c.website ? (
                    <li>
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 break-all text-ink transition-colors hover:text-peach-strong"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint/50 text-mint-deep">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                        </span>
                        {c.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    </li>
                  ) : null}
                  {c.instagram ? (
                    <li>
                      <a
                        href={`https://instagram.com/${c.instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-ink transition-colors hover:text-peach-strong"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose/50 text-rose-strong">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </span>
                        @{c.instagram.replace(/^@/, "")}
                      </a>
                    </li>
                  ) : null}
                  {c.facebook ? (
                    <li>
                      <a
                        href={c.facebook.startsWith("http") ? c.facebook : `https://facebook.com/${c.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-ink transition-colors hover:text-peach-strong"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky/50 text-sky-700">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </span>
                        Facebook
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}

            {place.discountCode ? (
              <DiscountCode code={place.discountCode} />
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
