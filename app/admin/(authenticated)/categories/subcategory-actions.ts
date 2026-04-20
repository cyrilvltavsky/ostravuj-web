"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SubcatFormState = { error: string | null };

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createSubcategory(
  _prev: SubcatFormState,
  formData: FormData,
): Promise<SubcatFormState> {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim();
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;

  if (!name) return { error: "Zadejte název subkategorie." };
  const slug = slugInput ? slugify(slugInput) : slugify(name);
  if (!slug) return { error: "Slug nemůže být prázdný." };

  const exists = await prisma.subcategory.findUnique({ where: { slug } });
  if (exists) return { error: `Slug "${slug}" už existuje.` };

  const max = await prisma.subcategory.aggregate({
    _max: { sortOrder: true },
  });

  await prisma.subcategory.create({
    data: {
      slug,
      name,
      categoryId,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/admin/categories");
  return { error: null };
}

export async function deleteSubcategory(
  id: number,
): Promise<{ error: string | null }> {
  await requireSuperAdmin();
  const sub = await prisma.subcategory.findUnique({ where: { id } });
  if (!sub) return { error: "Subkategorie neexistuje." };

  // Remove the slug from any Place.subcategories arrays + clear legacy field
  const places = await prisma.place.findMany({
    where: {
      OR: [
        { subcategories: { has: sub.slug } },
        { subcategory: sub.slug },
      ],
    },
    select: { id: true, subcategories: true, subcategory: true },
  });
  for (const p of places) {
    await prisma.place.update({
      where: { id: p.id },
      data: {
        subcategories: p.subcategories.filter((s) => s !== sub.slug),
        subcategory: p.subcategory === sub.slug ? null : p.subcategory,
      },
    });
  }

  await prisma.subcategory.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { error: null };
}
