import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireSuperAdmin();
  return (
    <>
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
      >
        ← Zpět na seznam
      </Link>
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-ink">
        Nová kategorie
      </h1>
      <CategoryForm action={createCategory} />
    </>
  );
}
