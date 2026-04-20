import Image from "next/image";
import Link from "next/link";
import { type Place, SUBCATEGORY_LABELS } from "@/lib/places";

type PlaceCardProps = {
  place: Place;
};

export function PlaceCard({ place }: PlaceCardProps) {
  const subLabel = SUBCATEGORY_LABELS[place.subcategory];

  return (
    <Link
      href={{ pathname: `/${place.category}/${place.slug}` }}
      className="group flex flex-col overflow-hidden rounded-card-lg border border-line bg-card text-left transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-soft-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Image
          src={place.image}
          alt={place.name}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {place.discountCode ? (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-peach-strong px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-px mr-0.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>{" "}Sleva
          </span>
        ) : (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink backdrop-blur">
            {subLabel}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        <div className="mb-2 flex items-center gap-2 text-[12px] font-medium uppercase tracking-wider text-ink-light">
          <span>{place.district}</span>
          <span className="h-[3px] w-[3px] rounded-full bg-ink-light" />
          <span>{subLabel}</span>
        </div>
        <h3 className="mb-2.5 text-[19px] font-bold leading-tight tracking-tight text-ink">
          {place.name}
        </h3>
        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-muted">
          {place.shortDesc}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {place.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
