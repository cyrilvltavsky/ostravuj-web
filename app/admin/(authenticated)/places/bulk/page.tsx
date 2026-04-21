import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BulkForm } from "./bulk-form";

export const dynamic = "force-dynamic";

export default async function BulkPlacesPage() {
  await requireEditor();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <>
      <Link
        href="/admin/places"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
      >
        ← Zpět na seznam
      </Link>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Hromadné vložení míst
      </h1>
      <p className="mb-6 text-sm text-ink-muted">
        Vlož seznam míst (jedno na řádek). AI je doplní informacemi
        z webu — adresu, kontakty, popis, štítky. Pak si je projdeš
        a uložíš jako koncepty.
      </p>

      <BulkForm categories={categories} />
    </>
  );
}
