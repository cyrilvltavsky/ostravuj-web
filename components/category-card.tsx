import Link from "next/link";
import { type CategoryMeta } from "@/lib/places";

type CategoryCardProps = {
  category: CategoryMeta;
  count: number;
};

export function CategoryCard({ category, count }: CategoryCardProps) {
  return (
    <Link
      href={{ pathname: `/${category.slug}` }}
      className="group block overflow-hidden rounded-card-lg border border-line bg-white p-7 transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-soft-lg"
    >
      <div
        className={`mb-5 flex h-13 w-13 items-center justify-center rounded-2xl text-2xl ${category.iconBg}`}
        style={{ width: 52, height: 52 }}
      >
        {category.emoji}
      </div>
      <h3 className="mb-1.5 text-[19px] font-bold tracking-tight text-ink">
        {category.title}
      </h3>
      <p className="mb-4 text-sm text-ink-muted">{category.description}</p>
      <div className="text-[13px] font-semibold text-ink-light">
        {count} {count === 1 ? "místo" : count < 5 ? "místa" : "míst"}
      </div>
    </Link>
  );
}
