import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlaceForm } from "@/components/admin/place-form";
import { updatePlace } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPlacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireEditor();
  const { id } = await params;
  const { saved } = await searchParams;

  const [place, categories] = await Promise.all([
    prisma.place.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        discountCode: true,
        category: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!place) notFound();

  // Bind id into the action so the form can call it without prop drilling
  const action = updatePlace.bind(null, id);

  return (
    <>
      <Link
        href="/admin/places"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
      >
        ← Zpět na seznam
      </Link>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
        {place.name}
      </h1>
      <p className="mb-8 text-sm text-ink-muted">
        /{place.category.slug}/{place.slug}
      </p>

      <PlaceForm
        action={action}
        placeId={id}
        saved={saved === "1"}
        categories={categories}
        defaults={{
          name: place.name,
          slug: place.slug,
          categoryId: place.categoryId,
          subcategory: place.subcategory,
          district: place.district,
          address: place.address,
          shortDesc: place.shortDesc,
          description: place.description,
          tags: place.tags,
          phone: place.phone,
          email: place.email,
          website: place.website,
          instagram: place.instagram,
          facebook: place.facebook,
          showContacts: place.showContacts,
          showDiscount: place.showDiscount,
          featured: place.featured,
          status: place.status as "PUBLISHED" | "ARCHIVED",
          discountCode: place.discountCode?.code ?? null,
          photos: place.photos.map((ph) => ({
            url: ph.url,
            sortOrder: ph.sortOrder,
          })),
        }}
      />
    </>
  );
}
