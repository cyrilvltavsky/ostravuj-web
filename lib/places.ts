// Frontend dataset extracted from the static prototype.
// Will be replaced by Prisma queries in Fáze 4.

export type CategorySlug = "gastro" | "aktivity" | "rande" | "zdarma";

export type SubcategorySlug =
  | "restaurace"
  | "bistro"
  | "kavarna"
  | "hospoda"
  | "galerie"
  | "pamatka"
  | "rodina"
  | "vyhlidka";

export type Place = {
  id: number;
  slug: string;
  name: string;
  category: CategorySlug;
  subcategory: SubcategorySlug;
  tags: string[];
  address: string;
  district: string;
  shortDesc: string;
  discountCode: string | null;
  image: string;
};

export type CategoryMeta = {
  slug: CategorySlug;
  title: string;
  subtitle: string;
  eyebrow: string;
  description: string;
  emoji: string;
  /** Tailwind background class for the icon tile */
  iconBg: string;
  /** Unsplash thumbnail used in the category card */
  image: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "gastro",
    title: "Gastro",
    subtitle:
      "Restaurace, bistra, kavárny a hospody – od autentických tapas po specialty kávu.",
    eyebrow: "Gastro scéna",
    description: "Restaurace, bistra, kavárny a hospody",
    emoji: "🍷",
    iconBg: "bg-peach",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
  },
  {
    slug: "aktivity",
    title: "Aktivity",
    subtitle:
      "Galerie, památky a místa, kam se vydat za kulturou i rodinnou zábavou.",
    eyebrow: "Co dělat",
    description: "Galerie, památky, rodinné výlety",
    emoji: "🏛️",
    iconBg: "bg-lavender",
    image: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=400&q=80",
  },
  {
    slug: "rande",
    title: "Kam na rande",
    subtitle:
      "Romantická místa, vyhlídky a tipy, které udělají dojem.",
    eyebrow: "Pro dva",
    description: "Romantická místa a vyhlídky",
    emoji: "💕",
    iconBg: "bg-rose",
    image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400&q=80",
  },
  {
    slug: "zdarma",
    title: "Zdarma",
    subtitle: "Místa, která nic nestojí a přitom stojí za to navštívit.",
    eyebrow: "Bez vstupného",
    description: "Parky, vyhlídky a místa bez vstupného",
    emoji: "🌿",
    iconBg: "bg-mint",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
  },
];

export const SUBCATEGORY_LABELS: Record<SubcategorySlug, string> = {
  restaurace: "Restaurace",
  bistro: "Bistro",
  kavarna: "Kavárna",
  hospoda: "Hospoda",
  galerie: "Galerie",
  pamatka: "Památka",
  rodina: "Rodina",
  vyhlidka: "Vyhlídka",
};

export const PLACES: Place[] = [
  { id: 1, slug: "hogofogo-bistro", name: "HogoFogo Bistro", category: "gastro", subcategory: "restaurace", tags: ["lokální suroviny", "zahrádka", "sezónní menu"], address: "Pivovarská 1, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Stylové bistro v historickém domě s krásnou zahrádkou v srdci Ostravy. Menu čerpá z tradice, přírody a udržitelnosti – inovativní pokrmy z místních surovin.", discountCode: null, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80" },
  { id: 2, slug: "hola-bar-tapas", name: "Hola Bar & Tapas", category: "gastro", subcategory: "restaurace", tags: ["španělská", "tapas", "víno"], address: "Stodolní 21, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Skvost s jedinečnou atmosférou, výtečnou obsluhou a autentickými španělskými tapas – studenými i teplými. Nejlepší sangria ve městě.", discountCode: "OSTRAVUJ10", image: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1200&q=80" },
  { id: 3, slug: "taverna-agiu-georgiu", name: "Taverna Agiu Georgiu", category: "gastro", subcategory: "restaurace", tags: ["řecká", "autentická", "rodinná"], address: "Sokolská třída 26, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Pravá řecká kuchyně z originálních surovin – prvotřídní olivový olej, ovčí sýr i horské oregano. Jako v malé taverně na Peloponésu.", discountCode: null, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80" },
  { id: 4, slug: "babetti-pizza-pasta", name: "Babetti Pizza & Pasta", category: "gastro", subcategory: "restaurace", tags: ["italská", "pizza", "poblíž Stodolní"], address: "Škroupova 16, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Tradiční italské speciality, luxusní těstoviny a křupavá pizza z kamenné pece. Nedaleko Stodolní – ideální před nebo po večerním programu.", discountCode: null, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80" },
  { id: 5, slug: "cauky-nauky-cafe", name: "Čauky mňauky cafe", category: "gastro", subcategory: "kavarna", tags: ["kočičí kavárna", "pet-friendly", "klidné místo"], address: "Havlíčkovo nábřeží 6, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Útulná kočičí kavárna v srdci Ostravy. Výběrová káva, domácí dezerty a pohlazení od rezidentních kočiček. Nejlepší místo na pomalé odpoledne.", discountCode: "MNAUKY15", image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200&q=80" },
  { id: 6, slug: "crosscafe-zamecka", name: "CrossCafe Zámecká", category: "gastro", subcategory: "kavarna", tags: ["industriální", "wifi", "snídaně"], address: "Zámecká 20, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Dvoupatrová kavárna v industriálním stylu. Kvalitní káva, samoobslužná vitrína a útulný ostrov klidu pár kroků od Masarykova náměstí.", discountCode: null, image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1200&q=80" },
  { id: 7, slug: "cokafe-centrum", name: "CØKAFE Centrum", category: "gastro", subcategory: "kavarna", tags: ["výběrová káva", "minimalistické", "specialty"], address: "28. října 14, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Minimalistická specialty kavárna s výběrovou kávou světových praháren. Pro milovníky čistého espressa a perfektního flat white.", discountCode: null, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80" },
  { id: 8, slug: "dock-cafe-bistro", name: "Dock", category: "gastro", subcategory: "bistro", tags: ["brunch", "víkendové snídaně", "neformální"], address: "Nádražní 42, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Neformální prostor kombinující kavárnu, bistro a večerní bar. O víkendu obsluhované snídaně, přes den obědy, večer drinky.", discountCode: null, image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&q=80" },
  { id: 9, slug: "sladke-casy", name: "Sladké časy", category: "gastro", subcategory: "kavarna", tags: ["cukrárna", "domácí dezerty", "snídaně"], address: "Tyršova 6, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Kavárno-cukrárna naproti hotelu Imperial, proslavená vyhlášenými snídaněmi a vlastnoručně pečenými zákusky. Sladká pauza v centru.", discountCode: null, image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&q=80" },
  { id: 10, slug: "kafe-palaca", name: "Kafe Palača", category: "gastro", subcategory: "kavarna", tags: ["rodinné", "dětský koutek", "palačinky"], address: "Hlavní třída 583, 708 00 Ostrava-Poruba", district: "Poruba", shortDesc: "Ideální místo pro rodiny v Porubě. Výborné palačinky, káva a především dětský koutek – rodiče si odpočinou, děti se baví.", discountCode: null, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80" },
  { id: 11, slug: "tsuri-ramen-sushi", name: "Tsurī", category: "gastro", subcategory: "restaurace", tags: ["japonská", "ramen", "sushi"], address: "Hlavní třída 864, 708 00 Ostrava-Poruba", district: "Poruba", shortDesc: "Autentická japonská kuchyně v srdci Poruby. Výborný ramen, čerstvé sushi a izakaya atmosféra. Tip pro milovníky japonského streetfoodu.", discountCode: null, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80" },
  { id: 12, slug: "sbeerka", name: "Sbeerka", category: "gastro", subcategory: "hospoda", tags: ["craft beer", "pivní bar", "široký výběr"], address: "Francouzská 6170, 708 00 Ostrava-Poruba", district: "Poruba", shortDesc: "Bar s unikátní sbírkou českých i zahraničních pivovarů. Stálá nabídka 12 piv na čepu a chlazená lednička plná raritních láhví.", discountCode: null, image: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=1200&q=80" },
  { id: 13, slug: "cokafe-poruba", name: "CØKAFE Poruba", category: "gastro", subcategory: "kavarna", tags: ["výběrová káva", "snídaně", "wifi"], address: "Hlavní třída 679, 708 00 Ostrava-Poruba", district: "Poruba", shortDesc: "Porubská pobočka oblíbené specialty kavárny. Snídaňové menu, obědové bowls a bezkonkurenční káva. Tichý koutek pro práci.", discountCode: null, image: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1200&q=80" },
  { id: 14, slug: "dolni-vitkovice", name: "Dolní Vítkovice", category: "aktivity", subcategory: "pamatka", tags: ["industriální", "prohlídky", "kultura"], address: "Vítkovice 3004, 703 00 Ostrava-Vítkovice", district: "Vítkovice", shortDesc: "Legendární průmyslový areál zapsaný v seznamu Evropského kulturního dědictví. Huť, Bolt Tower, Gong, Svět techniky – ikonická Ostrava.", discountCode: null, image: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1200&q=80" },
  { id: 15, slug: "slezskoostravsky-hrad", name: "Slezskoostravský hrad", category: "aktivity", subcategory: "pamatka", tags: ["hrad", "historie", "výhledy"], address: "Hradní 1, 710 00 Slezská Ostrava", district: "Slezská Ostrava", shortDesc: "Gotický hrad ze 13. století nad soutokem Ostravice a Lučiny. Prohlídky, výstavy, letní koncerty i středověká hospoda na nádvoří.", discountCode: null, image: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=1200&q=80" },
  { id: 16, slug: "landek-park", name: "Landek Park", category: "aktivity", subcategory: "galerie", tags: ["muzeum", "hornictví", "prohlídky"], address: "Pod Landekem 64, 725 29 Ostrava-Petřkovice", district: "Petřkovice", shortDesc: "Největší hornické muzeum v ČR. Fárání do podzemí s bývalými horníky, venkovní expozice techniky a krásné procházky v CHKO Landek.", discountCode: null, image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&q=80" },
  { id: 17, slug: "galerie-vytvarneho-umeni", name: "Galerie výtvarného umění (GVUO)", category: "aktivity", subcategory: "galerie", tags: ["umění", "výstavy", "Dům umění"], address: "Jurečkova 9, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Největší sbírkotvorná galerie v Moravskoslezském kraji. Stálá expozice českého umění i rotující výstavy v krásném Domě umění.", discountCode: null, image: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1200&q=80" },
  { id: 18, slug: "velky-svet-techniky", name: "Velký svět techniky", category: "aktivity", subcategory: "rodina", tags: ["interaktivní", "děti", "věda"], address: "Vítkovice 3004, 703 00 Ostrava-Vítkovice", district: "Vítkovice", shortDesc: "Interaktivní science centrum v areálu Dolních Vítkovic. Přes 100 exponátů, které si můžete osahat – ideální celodenní výlet s dětmi.", discountCode: null, image: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=1200&q=80" },
  { id: 19, slug: "zoo-ostrava", name: "ZOO a botanický park Ostrava", category: "aktivity", subcategory: "rodina", tags: ["zoo", "zvířata", "rodina"], address: "Michálkovická 2081/197, 710 00 Slezská Ostrava", district: "Slezská Ostrava", shortDesc: "Přes 3000 zvířat v prostorné Stromovce. Safari, safari bus, interaktivní expozice a dětská hřiště – celodenní dobrodružství pro rodiny.", discountCode: null, image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=1200&q=80" },
  { id: 20, slug: "bolt-tower", name: "Bolt Tower", category: "rande", subcategory: "vyhlidka", tags: ["výhled", "rande", "Dolní Vítkovice"], address: "Ruská 2993, 703 00 Ostrava-Vítkovice", district: "Vítkovice", shortDesc: "Nástavba na bývalé vysoké peci s kavárnou a vyhlídkou ve výšce 80 metrů. Úchvatný pohled na Ostravu i Beskydy – nejlepší tip na rande při západu slunce.", discountCode: null, image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&q=80" },
  { id: 21, slug: "halda-ema", name: "Halda Ema", category: "zdarma", subcategory: "vyhlidka", tags: ["zdarma", "výhled", "procházka"], address: "Michálkovice, 715 00 Ostrava", district: "Michálkovice", shortDesc: "Umělý kopec ze zbytků hlušiny s jedinečnou atmosférou – stále uvnitř hoří a vrchol je nejvyšším bodem Ostravy. Výhledy na celé město zdarma.", discountCode: null, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80" },
  { id: 22, slug: "komenskeho-sady", name: "Komenského sady", category: "zdarma", subcategory: "vyhlidka", tags: ["zdarma", "park", "centrum"], address: "Komenského sady, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Největší park v centru Ostravy podél řeky Ostravice. Procházky, cyklostezka, dětská hřiště a letní kino – zelené srdce města.", discountCode: null, image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=1200&q=80" },
  { id: 23, slug: "masarykovo-namesti", name: "Masarykovo náměstí", category: "zdarma", subcategory: "pamatka", tags: ["zdarma", "historie", "procházka"], address: "Masarykovo náměstí, 702 00 Moravská Ostrava", district: "Moravská Ostrava", shortDesc: "Historické srdce Ostravy se Starou radnicí, morovým sloupem a kavárnami. Ideální startovní bod pro objevování centra.", discountCode: null, image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80" },
  { id: 24, slug: "porubsky-sorela", name: "Hlavní třída Poruba (Sorela)", category: "zdarma", subcategory: "pamatka", tags: ["zdarma", "sorela", "architektura"], address: "Hlavní třída, 708 00 Ostrava-Poruba", district: "Poruba", shortDesc: "Unikátní urbanistický celek v sorelovém stylu – 'Porubská sorela' je chráněná památková zóna. Krásné arkády, fontány a kavárny.", discountCode: null, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80" },
];

// ───────────── Helpers ─────────────

export function getCategory(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORIES.some((c) => c.slug === slug);
}

export function getPlace(slug: string): Place | undefined {
  return PLACES.find((p) => p.slug === slug);
}

export function placesInCategory(category: CategorySlug): Place[] {
  return PLACES.filter((p) => p.category === category);
}

export function subcategoriesInCategory(
  category: CategorySlug,
): SubcategorySlug[] {
  return [...new Set(placesInCategory(category).map((p) => p.subcategory))];
}

export function categoryCounts(): Record<CategorySlug, number> {
  const counts = { gastro: 0, aktivity: 0, rande: 0, zdarma: 0 } as Record<
    CategorySlug,
    number
  >;
  for (const p of PLACES) counts[p.category]++;
  return counts;
}

export function googleMapsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/** Curated featured selection used on the homepage. */
export const FEATURED_SLUGS = [
  "hogofogo-bistro",
  "cauky-nauky-cafe",
  "dolni-vitkovice",
  "hola-bar-tapas",
  "bolt-tower",
  "halda-ema",
] as const;

export function featuredPlaces(): Place[] {
  return FEATURED_SLUGS.map((slug) => getPlace(slug)).filter(
    (p): p is Place => Boolean(p),
  );
}
