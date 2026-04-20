import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlaceForm, type PlaceFormDefaults } from "@/components/admin/place-form";
import { createPlace } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPlacePage({
  searchParams,
}: {
  searchParams: Promise<{ fromSuggestion?: string }>;
}) {
  await requireEditor();
  const { fromSuggestion } = await searchParams;

  const [categories, subcategoryOptions] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.subcategory.findMany({
      orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
      select: { slug: true, name: true },
    }),
  ]);

  let defaults: PlaceFormDefaults = {};
  let fromTitle: string | null = null;

  if (fromSuggestion) {
    const s = await prisma.suggestion.findUnique({
      where: { id: fromSuggestion },
    });
    if (s) {
      const cat = categories.find((c) => c.slug === s.category);
      defaults = {
        name: s.placeName,
        categoryId: cat?.id,
        shortDesc: s.description,
        description: s.description,
      };
      fromTitle = s.placeName;
    }
  }

  return (
    <>
      <Link
        href={
          fromSuggestion
            ? `/admin/suggestions/${fromSuggestion}`
            : "/admin/places"
        }
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
      >
        ← {fromSuggestion ? "Zpět na návrh" : "Zpět na seznam"}
      </Link>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
        {fromTitle ? `Nové místo: ${fromTitle}` : "Nové místo"}
      </h1>
      {fromSuggestion ? (
        <p className="mb-8 text-sm text-ink-muted">
          Předvyplněno z návrhu od uživatele. Doplňte adresu, fotky
          a ověřte ostatní údaje.
        </p>
      ) : (
        <div className="mb-8" />
      )}

      <PlaceForm
        action={createPlace}
        categories={categories}
        subcategoryOptions={subcategoryOptions}
        defaults={defaults}
      />
    </>
  );
}
