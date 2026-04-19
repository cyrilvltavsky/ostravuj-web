import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlaceForm } from "@/components/admin/place-form";
import { createPlace } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPlacePage() {
  await requireEditor();
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <>
      <Link
        href="/admin/places"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
      >
        ← Zpět na seznam
      </Link>
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-ink">
        Nové místo
      </h1>

      <PlaceForm action={createPlace} categories={categories} />
    </>
  );
}
