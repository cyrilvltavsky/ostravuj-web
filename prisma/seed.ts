/**
 * Seed: nahraje 4 kategorie a 24 míst z lib/places.ts do databáze.
 * Idempotentní — používá upsert podle slugu.
 *
 * Spuštění:
 *   pnpm db:seed
 */
import { PrismaClient } from "@prisma/client";
import { CATEGORIES, FEATURED_SLUGS, PLACES } from "../lib/places";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding categories…");

  // Upsert kategorií
  for (const [i, c] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.title,
        emoji: c.emoji,
        description: c.description,
        subtitle: c.subtitle,
        eyebrow: c.eyebrow,
        iconBg: c.iconBg,
        imageUrl: c.image,
        sortOrder: i,
      },
      update: {
        name: c.title,
        emoji: c.emoji,
        description: c.description,
        subtitle: c.subtitle,
        eyebrow: c.eyebrow,
        iconBg: c.iconBg,
        imageUrl: c.image,
        sortOrder: i,
      },
    });
  }

  console.log(`✓ ${CATEGORIES.length} kategorií`);

  // Předem si načti kategorie pro mapování slug → id
  const dbCategories = await prisma.category.findMany();
  const categoryIdBySlug = new Map(dbCategories.map((c) => [c.slug, c.id]));

  console.log("🌱 Seeding places…");

  const featuredSet = new Set(FEATURED_SLUGS);

  for (const p of PLACES) {
    const categoryId = categoryIdBySlug.get(p.category);
    if (!categoryId) {
      console.error(`  ✗ Category not found for ${p.slug} (${p.category})`);
      continue;
    }

    const place = await prisma.place.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        address: p.address,
        district: p.district,
        subcategory: p.subcategory,
        shortDesc: p.shortDesc,
        description: p.shortDesc, // zatím použijeme shortDesc i pro description
        categoryId,
        tags: p.tags,
        featured: featuredSet.has(p.slug as (typeof FEATURED_SLUGS)[number]),
        showContacts: true,
        showDiscount: true,
      },
      update: {
        name: p.name,
        address: p.address,
        district: p.district,
        subcategory: p.subcategory,
        shortDesc: p.shortDesc,
        description: p.shortDesc,
        categoryId,
        tags: p.tags,
        featured: featuredSet.has(p.slug as (typeof FEATURED_SLUGS)[number]),
      },
    });

    // Hlavní fotografie (sortOrder = 0). Mažu staré a vkládám novou,
    // ať seed funguje deterministicky.
    await prisma.placePhoto.deleteMany({
      where: { placeId: place.id, sortOrder: 0 },
    });
    await prisma.placePhoto.create({
      data: {
        placeId: place.id,
        url: p.image,
        alt: p.name,
        sortOrder: 0,
      },
    });

    // Slevový kód (jen pokud existuje)
    if (p.discountCode) {
      await prisma.discountCode.upsert({
        where: { placeId: place.id },
        create: {
          placeId: place.id,
          code: p.discountCode,
        },
        update: {
          code: p.discountCode,
        },
      });
    } else {
      // Smaž starý slevový kód, pokud byl ale už není
      await prisma.discountCode
        .delete({ where: { placeId: place.id } })
        .catch(() => undefined);
    }
  }

  console.log(`✓ ${PLACES.length} míst`);
  console.log("✅ Seed dokončen");
}

main()
  .catch((e) => {
    console.error("Seed selhal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
