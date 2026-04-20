import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategory } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) notFound();

  const cat = await prisma.category.findUnique({ where: { id: numId } });
  if (!cat) notFound();

  const action = updateCategory.bind(null, numId);

  return (
    <>
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
      >
        ← Zpět na seznam
      </Link>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
        {cat.name}
      </h1>
      <p className="mb-8 font-mono text-sm text-ink-light">/{cat.slug}</p>

      <CategoryForm
        action={action}
        isEdit
        defaults={{
          name: cat.name,
          slug: cat.slug,
          subtitle: cat.subtitle,
          eyebrow: cat.eyebrow,
          description: cat.description,
          imageUrl: cat.imageUrl,
        }}
      />
    </>
  );
}
