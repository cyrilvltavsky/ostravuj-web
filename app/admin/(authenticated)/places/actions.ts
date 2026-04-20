"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PLACE_PHOTOS_BUCKET,
  deletePhotoByUrl,
  ensurePlacePhotosBucket,
  uploadPhoto,
} from "@/lib/supabase/storage";
import {
  normalizeFacebookUrl,
  normalizeInstagramHandle,
  normalizeWebsiteUrl,
} from "@/lib/url-normalize";

export type PlaceFormState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
};

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function readFormPlace(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput ? slugify(slugInput) : slugify(name);
  const categoryId = Number(formData.get("categoryId")) || 0;
  const categorySlugs = parseList(String(formData.get("categorySlugs") ?? ""));
  const subcategories = parseList(
    String(formData.get("subcategories") ?? ""),
  );
  const subcategory = subcategories[0] ?? null;
  const district = String(formData.get("district") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim();
  const shortDesc = String(formData.get("shortDesc") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || shortDesc;
  const tags = parseList(String(formData.get("tags") ?? ""));
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const website = normalizeWebsiteUrl(String(formData.get("website") ?? ""));
  const instagram = normalizeInstagramHandle(
    String(formData.get("instagram") ?? ""),
  );
  const facebook = normalizeFacebookUrl(String(formData.get("facebook") ?? ""));
  const showContacts = formData.get("showContacts") === "on";
  const showDiscount = formData.get("showDiscount") === "on";
  const featured = formData.get("featured") === "on";
  const saveAsDraft = formData.get("saveAsDraft") === "1";
  const rawStatus = String(formData.get("status") ?? "");
  const status: "PUBLISHED" | "ARCHIVED" | "DRAFT" = saveAsDraft
    ? "DRAFT"
    : rawStatus === "ARCHIVED"
      ? "ARCHIVED"
      : rawStatus === "DRAFT"
        ? "DRAFT"
        : "PUBLISHED";
  const discountCode =
    String(formData.get("discountCode") ?? "").trim() || null;
  const youtubeUrl =
    String(formData.get("youtubeUrl") ?? "").trim() || null;

  return {
    name,
    slug,
    categoryId,
    categorySlugs,
    subcategory,
    subcategories,
    district,
    address,
    shortDesc,
    description,
    tags,
    phone,
    email,
    website,
    instagram,
    facebook,
    showContacts,
    showDiscount,
    featured,
    status,
    discountCode,
    youtubeUrl,
  };
}

function validate(d: ReturnType<typeof readFormPlace>): string | null {
  // Minimální požadavky: pouze název + alespoň jedna kategorie.
  // Adresa, popis i fotky jsou volitelné — můžeš doplnit později.
  if (!d.name) return "Vyplňte název.";
  if (!d.slug) return "Slug nemůže být prázdný.";
  if (!d.categoryId || d.categorySlugs.length === 0)
    return "Vyberte alespoň jednu kategorii.";
  return null;
}

async function uploadPhotos(
  placeId: string,
  formData: FormData,
): Promise<{ url: string; sortOrder: number }[]> {
  await ensurePlacePhotosBucket();

  const files: { file: File; sortOrder: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const f = formData.get(`photo_${i}`);
    if (f instanceof File && f.size > 0) {
      files.push({ file: f, sortOrder: i });
    }
  }
  if (files.length === 0) return [];

  const results: { url: string; sortOrder: number }[] = [];
  for (const { file, sortOrder } of files) {
    const url = await uploadPhoto(PLACE_PHOTOS_BUCKET, file, placeId);
    results.push({ url, sortOrder });
  }
  return results;
}

/** Wrap an action body so that any thrown error becomes a friendly state.
 *  Re-throws Next.js redirect/notFound signals so navigation still works. */
function asActionError(label: string, e: unknown): PlaceFormState {
  // Next.js internal control-flow errors carry a `digest` starting with
  // NEXT_REDIRECT, NEXT_NOT_FOUND or NEXT_HTTP_ERROR_FALLBACK. Re-throw so
  // the framework can handle them.
  if (
    e &&
    typeof e === "object" &&
    "digest" in e &&
    typeof (e as { digest: unknown }).digest === "string" &&
    (e as { digest: string }).digest.startsWith("NEXT_")
  ) {
    throw e;
  }
  console.error(`[${label}]`, e);
  const message = e instanceof Error ? e.message : "Neznámá chyba.";
  return { error: `${label}: ${message}` };
}

export async function createPlace(
  _prev: PlaceFormState,
  formData: FormData,
): Promise<PlaceFormState> {
  let profile;
  let data;
  try {
    profile = await requireEditor();
    data = readFormPlace(formData);
  } catch (e) {
    return asActionError("Vstupní data", e);
  }

  const err = validate(data);
  if (err) return { error: err };

  try {
    // Slug uniqueness — auto-suffix if taken
    let finalSlug = data.slug;
    let suffix = 2;
    while (await prisma.place.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${data.slug}-${suffix++}`;
    }

    const place = await prisma.place.create({
      data: {
        slug: finalSlug,
        name: data.name,
        address: data.address,
        district: data.district,
        subcategory: data.subcategory,
        subcategories: data.subcategories,
        categorySlugs: data.categorySlugs,
        shortDesc: data.shortDesc,
        description: data.description,
        categoryId: data.categoryId,
        tags: data.tags,
        phone: data.phone,
        email: data.email,
        website: data.website,
        instagram: data.instagram,
        facebook: data.facebook,
        showContacts: data.showContacts,
        showDiscount: data.showDiscount,
        featured: data.featured,
        status: data.status,
        youtubeUrl: data.youtubeUrl,
        createdById: profile.id,
      },
    });

    // Photos
    try {
      const photos = await uploadPhotos(place.id, formData);
      if (photos.length > 0) {
        await prisma.placePhoto.createMany({
          data: photos.map((p) => ({
            placeId: place.id,
            url: p.url,
            sortOrder: p.sortOrder,
          })),
        });
      }
    } catch (e) {
      console.error("[createPlace.photos]", e);
      return {
        error: e instanceof Error ? e.message : "Nahrání fotek selhalo.",
      };
    }

    if (data.discountCode) {
      await prisma.discountCode.create({
        data: { placeId: place.id, code: data.discountCode },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: profile.id,
        action: "CREATE",
        entityType: "Place",
        entityId: place.id,
        metadata: { name: place.name, slug: place.slug },
      },
    });

    const category = await prisma.category.findUnique({
      where: { id: place.categoryId },
      select: { slug: true },
    });

    revalidatePath("/admin/places");
    revalidatePath("/");
    if (category) revalidatePath(`/${category.slug}/${place.slug}`);
    redirect(`/admin/places/${place.id}/edit?saved=1`);
  } catch (e) {
    return asActionError("Vytvoření místa selhalo", e);
  }
}

export async function updatePlace(
  id: string,
  _prev: PlaceFormState,
  formData: FormData,
): Promise<PlaceFormState> {
  let profile;
  let data;
  try {
    profile = await requireEditor();
    data = readFormPlace(formData);
  } catch (e) {
    return asActionError("Vstupní data", e);
  }

  const err = validate(data);
  if (err) return { error: err };

  try {
    const existing = await prisma.place.findUnique({
      where: { id },
      include: { discountCode: true, category: true },
    });
    if (!existing) return { error: "Místo nenalezeno." };

    let finalSlug = data.slug;
    if (finalSlug !== existing.slug) {
      let suffix = 2;
      while (
        await prisma.place.findFirst({
          where: { slug: finalSlug, NOT: { id } },
        })
      ) {
        finalSlug = `${data.slug}-${suffix++}`;
      }
    }

    await prisma.place.update({
      where: { id },
      data: {
        slug: finalSlug,
        name: data.name,
        address: data.address,
        district: data.district,
        subcategory: data.subcategory,
        subcategories: data.subcategories,
        categorySlugs: data.categorySlugs,
        shortDesc: data.shortDesc,
        description: data.description,
        categoryId: data.categoryId,
        tags: data.tags,
        phone: data.phone,
        email: data.email,
        website: data.website,
        instagram: data.instagram,
        facebook: data.facebook,
        showContacts: data.showContacts,
        showDiscount: data.showDiscount,
        featured: data.featured,
        status: data.status,
        youtubeUrl: data.youtubeUrl,
      },
    });

    // Photos — only ADD/REPLACE the slots the user actually uploaded
    try {
      const newPhotos = await uploadPhotos(id, formData);
      for (const p of newPhotos) {
        const existingAtSlot = await prisma.placePhoto.findFirst({
          where: { placeId: id, sortOrder: p.sortOrder },
        });
        if (existingAtSlot) {
          await deletePhotoByUrl(PLACE_PHOTOS_BUCKET, existingAtSlot.url);
          await prisma.placePhoto.update({
            where: { id: existingAtSlot.id },
            data: { url: p.url },
          });
        } else {
          await prisma.placePhoto.create({
            data: { placeId: id, url: p.url, sortOrder: p.sortOrder },
          });
        }
      }
    } catch (e) {
      console.error("[updatePlace.photos]", e);
      return {
        error: e instanceof Error ? e.message : "Nahrání fotek selhalo.",
      };
    }

    if (data.discountCode) {
      await prisma.discountCode.upsert({
        where: { placeId: id },
        create: { placeId: id, code: data.discountCode },
        update: { code: data.discountCode },
      });
    } else if (existing.discountCode) {
      await prisma.discountCode.delete({ where: { placeId: id } });
    }

    await prisma.auditLog.create({
      data: {
        actorId: profile.id,
        action: "UPDATE",
        entityType: "Place",
        entityId: id,
        metadata: { name: data.name, slug: finalSlug },
      },
    });

    revalidatePath("/admin/places");
    revalidatePath("/");
    revalidatePath(`/${existing.category.slug}/${existing.slug}`);
    if (finalSlug !== existing.slug) {
      revalidatePath(`/${existing.category.slug}/${finalSlug}`);
    }

    return { error: null };
  } catch (e) {
    return asActionError("Uložení místa selhalo", e);
  }
}

export async function deletePhotoAtSlot(placeId: string, sortOrder: number) {
  await requireEditor();
  const photo = await prisma.placePhoto.findFirst({
    where: { placeId, sortOrder },
  });
  if (!photo) return;
  await deletePhotoByUrl(PLACE_PHOTOS_BUCKET, photo.url);
  await prisma.placePhoto.delete({ where: { id: photo.id } });
  revalidatePath(`/admin/places/${placeId}/edit`);
}

export async function deletePlace(id: string) {
  const profile = await requireEditor();
  const place = await prisma.place.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!place) return;

  for (const ph of place.photos) {
    await deletePhotoByUrl(PLACE_PHOTOS_BUCKET, ph.url);
  }

  await prisma.place.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: profile.id,
      action: "DELETE",
      entityType: "Place",
      entityId: id,
      metadata: { name: place.name, slug: place.slug },
    },
  });

  revalidatePath("/admin/places");
  revalidatePath("/");
  redirect("/admin/places");
}
