/**
 * Curated seed: top podniky z Moravské Ostravy a Poruby.
 * Vkládá je se status=DRAFT a bez fotek — projdi si je v adminu,
 * doplň fotky a kontakty, pak publikuj.
 *
 * Spuštění:
 *   pnpm db:seed-curated
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Curated = {
  slug: string;
  name: string;
  category: "gastro" | "aktivity" | "rande" | "zdarma";
  subcategory?: string;
  district: string;
  address: string;
  shortDesc: string;
  tags?: string[];
};

const places: Curated[] = [
  // ─── Moravská Ostrava — gastro / kavárny ───
  {
    slug: "la-petite-conversation",
    name: "La Petite Conversation",
    category: "gastro",
    subcategory: "kavarna",
    district: "Moravská Ostrava",
    address: "Masarykovo náměstí 17, 702 00 Moravská Ostrava",
    shortDesc:
      "Útulná kavárna v centru s vynikající výběrovou kávou a domácími dezerty.",
    tags: ["výběrová káva", "dezerty", "centrum"],
  },
  {
    slug: "comix-cafe",
    name: "Comix Café",
    category: "gastro",
    subcategory: "kavarna",
    district: "Moravská Ostrava",
    address: "Stodolní 11, 702 00 Moravská Ostrava",
    shortDesc:
      "Komiksová kavárna s kvalitní kávou, deskovkami a klidnou atmosférou.",
    tags: ["deskové hry", "komiksy", "klidné"],
  },
  {
    slug: "u-zlateho-pelikana",
    name: "U Zlatého Pelikána",
    category: "gastro",
    subcategory: "restaurace",
    district: "Moravská Ostrava",
    address: "Smetanovo náměstí 1, 702 00 Moravská Ostrava",
    shortDesc:
      "Tradiční česká restaurace s domácí kuchyní a širokým výběrem piva.",
    tags: ["česká", "tradice", "pivo"],
  },
  {
    slug: "atelier-bistro",
    name: "Atelier Bistro",
    category: "gastro",
    subcategory: "bistro",
    district: "Moravská Ostrava",
    address: "Nádražní 218, 702 00 Moravská Ostrava",
    shortDesc:
      "Moderní bistro s důrazem na sezónní suroviny a kreativní pokrmy.",
    tags: ["sezónní", "moderní", "kreativní"],
  },
  {
    slug: "u-rady-podniku",
    name: "U Rady",
    category: "gastro",
    subcategory: "hospoda",
    district: "Moravská Ostrava",
    address: "Stodolní 9, 702 00 Moravská Ostrava",
    shortDesc:
      "Klasická hospoda na Stodolní s rychlou obsluhou a dobrým pivem.",
    tags: ["pivo", "stodolní", "klasika"],
  },
  {
    slug: "buddha-bowl-ostrava",
    name: "Buddha Bowl",
    category: "gastro",
    subcategory: "bistro",
    district: "Moravská Ostrava",
    address: "Nádražní 60, 702 00 Moravská Ostrava",
    shortDesc:
      "Zdravé bowls, smoothies a vegan/vegetariánské obědy v centru města.",
    tags: ["vegan", "zdravé", "bowls"],
  },
  {
    slug: "soul-of-india",
    name: "Soul of India",
    category: "gastro",
    subcategory: "restaurace",
    district: "Moravská Ostrava",
    address: "Tyršova 2, 702 00 Moravská Ostrava",
    shortDesc:
      "Autentická indická kuchyně s kořeněným curry, tandoori a domácími chleby.",
    tags: ["indická", "curry", "vegetariánské"],
  },
  {
    slug: "pizzeria-trattoria-da-romeo",
    name: "Trattoria da Romeo",
    category: "gastro",
    subcategory: "restaurace",
    district: "Moravská Ostrava",
    address: "Sokolská 3, 702 00 Moravská Ostrava",
    shortDesc:
      "Italská trattorie s pizzou z kamenné pece a čerstvými těstovinami.",
    tags: ["italská", "pizza", "těstoviny"],
  },
  {
    slug: "pivnice-u-mikulase",
    name: "Pivnice U Mikuláše",
    category: "gastro",
    subcategory: "hospoda",
    district: "Moravská Ostrava",
    address: "Hornopolní 12, 702 00 Moravská Ostrava",
    shortDesc:
      "Lokálka s ostravským pivem, výbornými řízky a klidným prostředím.",
    tags: ["pivo", "lokální", "řízky"],
  },
  {
    slug: "kantyna-ostrava",
    name: "Kantýna Ostrava",
    category: "gastro",
    subcategory: "restaurace",
    district: "Moravská Ostrava",
    address: "Smetanovo náměstí 6, 702 00 Moravská Ostrava",
    shortDesc:
      "Steaková kantýna se sklepem masa a polední nabídkou pro náročné.",
    tags: ["steak", "maso", "obědy"],
  },

  // ─── Poruba — gastro ───
  {
    slug: "rest-poruba-tom",
    name: "Restaurace Tom",
    category: "gastro",
    subcategory: "restaurace",
    district: "Poruba",
    address: "Hlavní třída 1023/55, 708 00 Ostrava-Poruba",
    shortDesc:
      "Rodinná restaurace s českou kuchyní, polední nabídkou a velkou zahrádkou.",
    tags: ["česká", "rodinná", "zahrádka"],
  },
  {
    slug: "kavarna-knihovna-poruba",
    name: "Kavárna v Knihovně",
    category: "gastro",
    subcategory: "kavarna",
    district: "Poruba",
    address: "L. Podéště 1970, 708 00 Ostrava-Poruba",
    shortDesc:
      "Klidná kavárna v Krajské knihovně — ideální místo na čtení a práci.",
    tags: ["klidné", "knihovna", "wifi"],
  },
  {
    slug: "pivnice-u-jelena-poruba",
    name: "Pivnice U Jelena",
    category: "gastro",
    subcategory: "hospoda",
    district: "Poruba",
    address: "Opavská 6201, 708 00 Ostrava-Poruba",
    shortDesc:
      "Tradiční pivnice s točeným pivem a domácí kuchyní za rozumnou cenu.",
    tags: ["pivo", "tradice", "domácí kuchyně"],
  },
  {
    slug: "asia-poruba",
    name: "Asia",
    category: "gastro",
    subcategory: "restaurace",
    district: "Poruba",
    address: "Hlavní třída 678, 708 00 Ostrava-Poruba",
    shortDesc:
      "Asijská kuchyně — ramen, sushi, wok. Rychlé, čerstvé, dostupné.",
    tags: ["asijská", "wok", "sushi"],
  },
  {
    slug: "porubska-cukrarna",
    name: "Porubská cukrárna",
    category: "gastro",
    subcategory: "kavarna",
    district: "Poruba",
    address: "Hlavní třída 583, 708 00 Ostrava-Poruba",
    shortDesc:
      "Klasická cukrárna s domácími zákusky, dorty na zakázku a dobrou kávou.",
    tags: ["cukrárna", "dezerty", "domácí"],
  },

  // ─── Aktivity ───
  {
    slug: "stadion-bazaly",
    name: "Stadion Bazaly",
    category: "aktivity",
    subcategory: "pamatka",
    district: "Slezská Ostrava",
    address: "Bazaly 1, 710 00 Slezská Ostrava",
    shortDesc:
      "Kultovní fotbalový stadion FC Baník Ostrava — atmosféra, prohlídky, kus historie města.",
    tags: ["fotbal", "Baník", "historie"],
  },
  {
    slug: "miniuni-svet-miniatur",
    name: "Miniuni — Svět miniatur",
    category: "aktivity",
    subcategory: "rodina",
    district: "Moravská Ostrava",
    address: "Černého 8, 702 00 Moravská Ostrava",
    shortDesc:
      "Park s modely slavných evropských staveb v měřítku 1:25 — výlet pro celou rodinu.",
    tags: ["miniatury", "rodina", "park"],
  },
  {
    slug: "trojhali-karoliny",
    name: "Trojhalí Karolina",
    category: "aktivity",
    subcategory: "pamatka",
    district: "Moravská Ostrava",
    address: "Karolinská 654/2, 702 00 Moravská Ostrava",
    shortDesc:
      "Industriální areál s farmářskými trhy, koncerty a večerními akcemi.",
    tags: ["industriální", "trhy", "akce"],
  },
  {
    slug: "plato-ostrava",
    name: "PLATO Ostrava",
    category: "aktivity",
    subcategory: "galerie",
    district: "Moravská Ostrava",
    address: "Janáčkova 22, 702 00 Moravská Ostrava",
    shortDesc:
      "Současná galerie v bývalém porcelánovém obchodě — silné výstavy, dobré ceny.",
    tags: ["současné umění", "výstavy", "moderní"],
  },
  {
    slug: "divadlo-antonina-dvoraka",
    name: "Divadlo Antonína Dvořáka",
    category: "aktivity",
    subcategory: "pamatka",
    district: "Moravská Ostrava",
    address: "Smetanovo náměstí 1, 702 00 Moravská Ostrava",
    shortDesc:
      "Hlavní operní a baletní scéna města v krásné secesní budově.",
    tags: ["opera", "balet", "secese"],
  },

  // ─── Rande ───
  {
    slug: "vyhlidkova-vez-noveho-radnice",
    name: "Vyhlídková věž Nové radnice",
    category: "rande",
    subcategory: "vyhlidka",
    district: "Moravská Ostrava",
    address: "Prokešovo náměstí 8, 702 00 Moravská Ostrava",
    shortDesc:
      "85 metrů vysoká věž s úchvatným výhledem na celé město a Beskydy.",
    tags: ["výhled", "věž", "rande"],
  },
  {
    slug: "kavarna-dvanactka",
    name: "Kavárna Dvanáctka",
    category: "rande",
    subcategory: "kavarna",
    district: "Moravská Ostrava",
    address: "Sokolská tř. 12, 702 00 Moravská Ostrava",
    shortDesc:
      "Romantická kavárna se zahradou, ideální na první rande nebo večerní setkání.",
    tags: ["romantika", "zahrada", "klidné"],
  },

  // ─── Zdarma ───
  {
    slug: "smetanovy-sady",
    name: "Smetanovy sady",
    category: "zdarma",
    subcategory: "vyhlidka",
    district: "Moravská Ostrava",
    address: "Smetanovy sady, 702 00 Moravská Ostrava",
    shortDesc:
      "Park v samém centru s kašnou a klidnou zelení — pauza od ruchu města.",
    tags: ["park", "centrum", "klid"],
  },
  {
    slug: "ema-petrkovice-vyhled",
    name: "Vyhlídka na Landeku",
    category: "zdarma",
    subcategory: "vyhlidka",
    district: "Petřkovice",
    address: "Pod Landekem, 725 29 Ostrava-Petřkovice",
    shortDesc:
      "CHKO Landek s výhledem na soutok Odry s Ostravicí a celou Ostravu.",
    tags: ["výhled", "příroda", "procházka"],
  },
  {
    slug: "park-svinov-mosty",
    name: "Park u Svinovských mostů",
    category: "zdarma",
    subcategory: "vyhlidka",
    district: "Svinov",
    address: "Park u Svinovských mostů, 721 00 Ostrava-Svinov",
    shortDesc:
      "Klidný park ideální na procházku, jogging nebo s dětmi na piknik.",
    tags: ["park", "procházka", "jogging"],
  },
];

async function main() {
  console.log("🌱 Seeding curated places (status=DRAFT, no photos)…");

  const cats = await prisma.category.findMany();
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  let inserted = 0;
  let skipped = 0;
  for (const p of places) {
    const exists = await prisma.place.findUnique({ where: { slug: p.slug } });
    if (exists) {
      skipped++;
      continue;
    }
    const categoryId = catBySlug.get(p.category);
    if (!categoryId) {
      console.warn(`  ✗ Unknown category for ${p.slug}: ${p.category}`);
      continue;
    }
    await prisma.place.create({
      data: {
        slug: p.slug,
        name: p.name,
        address: p.address,
        district: p.district,
        subcategory: p.subcategory ?? null,
        subcategories: p.subcategory ? [p.subcategory] : [],
        categorySlugs: [p.category],
        shortDesc: p.shortDesc,
        description: p.shortDesc,
        categoryId,
        tags: p.tags ?? [],
        status: "DRAFT",
        featured: false,
        showContacts: false,
        showDiscount: false,
      },
    });
    inserted++;
  }

  console.log(`✓ Vloženo ${inserted} nových míst, přeskočeno ${skipped}.`);
  console.log(
    "Místa najdeš v /admin/places (filtr Koncepty) — doplň fotky/kontakty a publikuj.",
  );
}

main()
  .catch((e) => {
    console.error("Seed selhal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
