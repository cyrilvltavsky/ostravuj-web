"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  enrichFields,
  type EnrichData,
} from "@/app/admin/(authenticated)/places/enrich";

export type BulkPreparedItem = {
  /** Original line as the user typed it */
  rawName: string;
  /** Cleaned name we send to AI / use as place name */
  name: string;
  /** AI-generated data, may have nulls if AI didn't find */
  enriched: EnrichData | null;
  /** Error message if enrich failed for this item */
  error: string | null;
};

export type BulkPrepareResult = {
  ok: boolean;
  error: string | null;
  items?: BulkPreparedItem[];
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

function parseNames(text: string): string[] {
  return text
    .split(/\r?\n+/)
    .map((s) => s.trim())
    // Drop empty lines, comments (# starting), and bullets (- *)
    .filter((s) => s.length > 0 && !s.startsWith("#"))
    .map((s) => s.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    // Cap at 30 to keep cost predictable
    .slice(0, 30);
}

export async function bulkPrepare(input: {
  text: string;
  category: string | null;
}): Promise<BulkPrepareResult> {
  try {
    await requireEditor();
  } catch {
    return { ok: false, error: "Pouze pro prihlasene editory." };
  }

  const names = parseNames(input.text);
  if (names.length === 0)
    return {
      ok: false,
      error: "Nepodarilo se parsovat zadny nazev. Vlozte alespon jeden radek.",
    };

  // Run all enrich calls in parallel
  const results = await Promise.all(
    names.map(async (name): Promise<BulkPreparedItem> => {
      try {
        const r = await enrichFields({
          name,
          category: input.category ?? null,
          fields: [
            "address",
            "district",
            "shortDesc",
            "tags",
            "phone",
            "email",
            "website",
            "instagram",
            "facebook",
          ],
        });
        return {
          rawName: name,
          name,
          enriched: r.ok && r.data ? r.data : null,
          error: r.ok ? null : r.error,
        };
      } catch (e) {
        return {
          rawName: name,
          name,
          enriched: null,
          error: e instanceof Error ? e.message : "Neznama chyba.",
        };
      }
    }),
  );

  return { ok: true, error: null, items: results };
}

export type BulkCreateInput = {
  items: {
    name: string;
    categorySlug: string;
    address?: string | null;
    district?: string | null;
    shortDesc?: string | null;
    tags?: string[];
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
  }[];
};

export type BulkCreateResult = {
  ok: boolean;
  error: string | null;
  created: number;
  skipped: number;
};

export async function bulkCreate(
  input: BulkCreateInput,
): Promise<BulkCreateResult> {
  let profile;
  try {
    profile = await requireEditor();
  } catch {
    return { ok: false, error: "Pouze pro editory.", created: 0, skipped: 0 };
  }

  if (!input.items || input.items.length === 0)
    return { ok: false, error: "Zadne polozky.", created: 0, skipped: 0 };

  const cats = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const catIdBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;
  for (const item of input.items) {
    const categoryId = catIdBySlug.get(item.categorySlug);
    if (!categoryId) {
      skipped++;
      continue;
    }
    if (!item.name?.trim()) {
      skipped++;
      continue;
    }

    // Slug uniqueness — auto-suffix if taken
    const baseSlug = slugify(item.name);
    if (!baseSlug) {
      skipped++;
      continue;
    }
    let finalSlug = baseSlug;
    let suffix = 2;
    while (await prisma.place.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${suffix++}`;
    }

    try {
      const created_place = await prisma.place.create({
        data: {
          slug: finalSlug,
          name: item.name.trim(),
          address: item.address?.trim() ?? "",
          district: item.district?.trim() || null,
          shortDesc: item.shortDesc?.trim() ?? "",
          description: item.shortDesc?.trim() ?? "",
          categoryId,
          categorySlugs: [item.categorySlug],
          tags: (item.tags ?? []).map((t) => t.trim()).filter(Boolean),
          phone: item.phone?.trim() || null,
          email: item.email?.trim() || null,
          website: item.website?.trim() || null,
          instagram:
            item.instagram?.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "") ||
            null,
          facebook: item.facebook?.trim() || null,
          // Created as DRAFT so admin can review & publish
          status: "DRAFT",
          showContacts: false,
          showDiscount: false,
          featured: false,
          createdById: profile.id,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: profile.id,
          action: "CREATE",
          entityType: "Place",
          entityId: created_place.id,
          metadata: {
            name: created_place.name,
            slug: created_place.slug,
            bulk: true,
          },
        },
      });
      created++;
    } catch (e) {
      console.error("[bulkCreate]", item.name, e);
      skipped++;
    }
  }

  revalidatePath("/admin/places");
  revalidatePath("/");
  return { ok: true, error: null, created, skipped };
}
