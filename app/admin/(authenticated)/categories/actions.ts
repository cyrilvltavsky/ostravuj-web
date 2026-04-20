"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PLACE_PHOTOS_BUCKET,
  deletePhotoByUrl,
  ensurePlacePhotosBucket,
  uploadPhoto,
} from "@/lib/supabase/storage";

export type CategoryFormState = { error: string | null };

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function read(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput ? slugify(slugInput) : slugify(name);
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const eyebrow = String(formData.get("eyebrow") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  return { name, slug, subtitle, eyebrow, description };
}

async function uploadCategoryImage(
  slug: string,
  formData: FormData,
): Promise<string | null> {
  const f = formData.get("image");
  if (!(f instanceof File) || f.size === 0) return null;
  await ensurePlacePhotosBucket();
  return uploadPhoto(PLACE_PHOTOS_BUCKET, f, `categories/${slug}`);
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  let me;
  try {
    me = await requireSuperAdmin();
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "digest" in e &&
      typeof (e as { digest: unknown }).digest === "string" &&
      (e as { digest: string }).digest.startsWith("NEXT_")
    )
      throw e;
    return { error: "Není povoleno." };
  }
  const data = read(formData);
  if (!data.name) return { error: "Vyplňte název kategorie." };
  if (!data.slug) return { error: "Slug nemůže být prázdný." };

  try {
    const exists = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (exists) return { error: `Slug "${data.slug}" už existuje.` };

    const maxOrder = await prisma.category.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const imageUrl = await uploadCategoryImage(data.slug, formData);

    await prisma.category.create({
      data: {
        slug: data.slug,
        name: data.name,
        subtitle: data.subtitle,
        eyebrow: data.eyebrow,
        description: data.description,
        imageUrl,
        sortOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: me.id,
        action: "CREATE",
        entityType: "Category",
        entityId: data.slug,
        metadata: { name: data.name },
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "digest" in e &&
      typeof (e as { digest: unknown }).digest === "string" &&
      (e as { digest: string }).digest.startsWith("NEXT_")
    )
      throw e;
    console.error("[createCategory]", e);
    return {
      error: e instanceof Error ? e.message : "Vytvoření selhalo.",
    };
  }

  redirect("/admin/categories?saved=1");
}

export async function updateCategory(
  id: number,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  let me;
  try {
    me = await requireSuperAdmin();
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "digest" in e &&
      typeof (e as { digest: unknown }).digest === "string" &&
      (e as { digest: string }).digest.startsWith("NEXT_")
    )
      throw e;
    return { error: "Není povoleno." };
  }

  const data = read(formData);
  if (!data.name) return { error: "Vyplňte název kategorie." };

  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return { error: "Kategorie neexistuje." };

    // If slug changed, ensure uniqueness, then update + cascade rename in
    // Place.categorySlugs
    const finalSlug = data.slug;
    if (finalSlug !== existing.slug) {
      const dup = await prisma.category.findFirst({
        where: { slug: finalSlug, NOT: { id } },
      });
      if (dup) return { error: `Slug "${finalSlug}" už existuje.` };

      // Rewrite Place.categorySlugs[] entries from old → new slug
      const places = await prisma.place.findMany({
        where: { categorySlugs: { has: existing.slug } },
        select: { id: true, categorySlugs: true },
      });
      for (const p of places) {
        const next = p.categorySlugs.map((s) =>
          s === existing.slug ? finalSlug : s,
        );
        await prisma.place.update({
          where: { id: p.id },
          data: { categorySlugs: next },
        });
      }
    }

    // Replace image if a new one was uploaded
    let imageUrl: string | undefined;
    const newImage = await uploadCategoryImage(finalSlug, formData);
    if (newImage) {
      imageUrl = newImage;
      // Try to remove the old image from storage
      if (existing.imageUrl) {
        await deletePhotoByUrl(PLACE_PHOTOS_BUCKET, existing.imageUrl).catch(
          () => undefined,
        );
      }
    }

    await prisma.category.update({
      where: { id },
      data: {
        slug: finalSlug,
        name: data.name,
        subtitle: data.subtitle,
        eyebrow: data.eyebrow,
        description: data.description,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: me.id,
        action: "UPDATE",
        entityType: "Category",
        entityId: String(id),
        metadata: {
          name: data.name,
          slug: finalSlug,
          renamedFrom: finalSlug !== existing.slug ? existing.slug : undefined,
        },
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath(`/${finalSlug}`);
    if (finalSlug !== existing.slug) revalidatePath(`/${existing.slug}`);
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "digest" in e &&
      typeof (e as { digest: unknown }).digest === "string" &&
      (e as { digest: string }).digest.startsWith("NEXT_")
    )
      throw e;
    console.error("[updateCategory]", e);
    return {
      error: e instanceof Error ? e.message : "Uložení selhalo.",
    };
  }

  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(id: number): Promise<{
  error: string | null;
}> {
  const me = await requireSuperAdmin();
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { places: true } } },
  });
  if (!cat) return { error: "Kategorie neexistuje." };
  if (cat._count.places > 0) {
    return {
      error: `Kategorie obsahuje ${cat._count.places} míst — nejdřív je přesuňte.`,
    };
  }

  if (cat.imageUrl) {
    await deletePhotoByUrl(PLACE_PHOTOS_BUCKET, cat.imageUrl).catch(
      () => undefined,
    );
  }

  // Remove this slug from any Place.categorySlugs (in case of stale data)
  const places = await prisma.place.findMany({
    where: { categorySlugs: { has: cat.slug } },
    select: { id: true, categorySlugs: true },
  });
  for (const p of places) {
    await prisma.place.update({
      where: { id: p.id },
      data: { categorySlugs: p.categorySlugs.filter((s) => s !== cat.slug) },
    });
  }

  await prisma.category.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: me.id,
      action: "DELETE",
      entityType: "Category",
      entityId: String(id),
      metadata: { name: cat.name, slug: cat.slug },
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { error: null };
}

export async function reorderCategory(
  id: number,
  direction: "up" | "down",
): Promise<{ error: string | null }> {
  await requireSuperAdmin();
  const all = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return { error: "Nenalezeno." };
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= all.length) return { error: null };

  const a = all[idx];
  const b = all[swapWith];
  await prisma.$transaction([
    prisma.category.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.category.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { error: null };
}
