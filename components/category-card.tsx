import Image from "next/image";
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
      className="group block overflow-hidden rounded-card-lg border border-line bg-white transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-soft-lg"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-surface">
        <Image
          src={category.image}
          alt={category.title}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="mb-1 text-[17px] font-bold tracking-tight text-ink">
          {category.title}
        </h3>
        <p className="mb-3 text-sm leading-snug text-ink-muted">
          {category.description}
        </p>
        <div className="text-[13px] font-semibold text-ink-light">
          {count} {count === 1 ? "místo" : count < 5 ? "místa" : "míst"}
        </div>
      </div>
    </Link>
  );
}
