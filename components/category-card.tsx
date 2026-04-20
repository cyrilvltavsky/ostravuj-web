import Image from "next/image";
import Link from "next/link";
import { type CategoryMeta } from "@/lib/places";

type CategoryCardProps = {
  category: CategoryMeta;
  count: number;
  subcategories?: string[];
};

export function CategoryCard({
  category,
  count,
  subcategories = [],
}: CategoryCardProps) {
  const countLabel =
    count === 1 ? "místo" : count >= 2 && count <= 4 ? "místa" : "míst";

  return (
    <Link
      href={{ pathname: `/${category.slug}` }}
      className="group relative block overflow-hidden rounded-card-xl bg-ink shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
    >
      {/* Photo with dark overlay */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : null}
        {/* Gradient overlay for text legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40"
        />

        {/* Centered title + count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <h3 className="mb-3 text-[clamp(28px,4vw,42px)] font-extrabold leading-tight tracking-tight drop-shadow-lg">
            {category.title}
          </h3>
          <p className="text-[clamp(40px,6vw,64px)] font-extrabold leading-none tracking-tight drop-shadow-lg">
            {count}
          </p>
          <p className="mt-1 text-sm font-medium uppercase tracking-wider opacity-90">
            {countLabel}
          </p>
        </div>

        {/* Subcategory chips at bottom */}
        {subcategories.length > 0 ? (
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-1.5 px-4 pb-4">
            {subcategories.map((sub) => (
              <span
                key={sub}
                className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
              >
                {sub}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
