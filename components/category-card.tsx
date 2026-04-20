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
      className="group flex items-stretch gap-5 overflow-hidden rounded-card-xl border border-line bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-line-hover hover:shadow-soft-lg sm:p-6"
    >
      {/* Left — text + chips */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.05] tracking-tight text-ink">
            {category.title}
          </h3>
          <p className="mt-1 text-base font-medium text-ink-muted">
            {count} {countLabel}
          </p>
        </div>

        {subcategories.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {subcategories.slice(0, 4).map((sub) => (
              <span
                key={sub}
                className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink-muted"
              >
                {sub}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Right — photo */}
      <div className="relative aspect-[4/3] w-[40%] shrink-0 overflow-hidden rounded-card bg-surface">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.title}
            fill
            sizes="(max-width: 640px) 40vw, 240px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : null}
      </div>
    </Link>
  );
}
