"use server";

import { generateText, Output } from "ai";
import { z } from "zod";
import { requireEditor } from "@/lib/auth";

export type EnrichField =
  | "address"
  | "district"
  | "shortDesc"
  | "tags"
  | "phone"
  | "email"
  | "website"
  | "instagram"
  | "facebook";

export type EnrichData = Partial<{
  address: string | null;
  district: string | null;
  shortDesc: string | null;
  tags: string[];
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
}>;

export type EnrichResult = {
  ok: boolean;
  error: string | null;
  data?: EnrichData;
};

const FIELD_SCHEMA: Record<EnrichField, z.ZodType> = {
  address: z
    .string()
    .nullable()
    .describe(
      "Plna adresa vcetne cisla popisneho a PSC v Ostrave. null pokud neznama.",
    ),
  district: z
    .string()
    .nullable()
    .describe(
      "Ctvrt nebo cast Ostravy (Moravska Ostrava, Poruba, Slezska Ostrava, Vitkovice, Petrkovice...). null pokud neznama.",
    ),
  shortDesc: z
    .string()
    .nullable()
    .describe(
      "Kratky popis mista v cestine, 2-3 vety popisujici atmosferu a co tam najit. Prirozeny jazyk, zadne marketingove fraze. null pokud nedokazes spolehlive popsat.",
    ),
  tags: z
    .array(z.string())
    .describe(
      "3 az 6 kratkych ceskych stitku (1-2 slova) charakterizujicich misto: 'lokalni suroviny', 'vyberova kava', 'pet-friendly', 'terasa' apod. Prazdne pole pokud nejsou jiste.",
    ),
  phone: z
    .string()
    .nullable()
    .describe(
      "Telefonni cislo v mezinarodnim formatu +420 XXX XXX XXX. null pokud nezname.",
    ),
  email: z
    .string()
    .nullable()
    .describe("Kontaktni e-mail. null pokud nezname."),
  website: z
    .string()
    .nullable()
    .describe(
      "URL oficialniho webu vcetne https://. null pokud nezname.",
    ),
  instagram: z
    .string()
    .nullable()
    .describe(
      "Instagram handle bez znaku @ (priklad: hogofogo_bistro). null pokud nezname.",
    ),
  facebook: z
    .string()
    .nullable()
    .describe(
      "Facebook stranka jako handle/cesta nebo plna URL. null pokud nezname.",
    ),
};

export async function enrichFields(input: {
  name: string;
  category?: string | null;
  knownAddress?: string | null;
  fields: EnrichField[];
}): Promise<EnrichResult> {
  try {
    await requireEditor();
  } catch {
    return { ok: false, error: "Pouze pro prihlasene editory." };
  }

  const name = input.name?.trim();
  if (!name) {
    return {
      ok: false,
      error:
        "Nejdriv vyplnte nazev mista (a ideálne i kategorii) — pak mu mohu hledat informace.",
    };
  }
  if (!input.fields || input.fields.length === 0) {
    return { ok: false, error: "Zadne pole k vyplneni." };
  }

  // Build dynamic schema with only requested fields
  const shape: Record<string, z.ZodType> = {};
  for (const f of input.fields) {
    shape[f] = FIELD_SCHEMA[f];
  }
  const schema = z.object(shape);

  const ctxParts = [
    `Hledam informace o ostravskem podniku nebo miste s nazvem: "${name}".`,
  ];
  if (input.category) ctxParts.push(`Kategorie: ${input.category}.`);
  if (input.knownAddress)
    ctxParts.push(`Znama adresa nebo napoveda: ${input.knownAddress}.`);
  ctxParts.push("Mesto: Ostrava, Ceska republika.");
  ctxParts.push(
    `Vrat strukturovana data POUZE pro tyto pole: ${input.fields.join(", ")}.`,
  );
  const prompt = ctxParts.join(" ");

  const systemPrompt = [
    "Jsi pomocnik pro ostravsky katalog mist. Vyplnujes strukturovane udaje o realnych ostravskych podnicich.",
    "DULEZITA pravidla:",
    "- Pokud si nejsi JIST konkretni informaci, vrat null (nebo prazdne pole pro tagy). NIKDY si nevymyslej.",
    "- Adresy musi byt realne ostravske adresy. Pokud misto neznas, vrat null pro vsechna pole.",
    "- Kontaktni udaje (telefon, e-mail, web, IG, FB) doplnuj jen pokud mas spolehlivou znalost.",
    "- Krátké popisy piste prirozenou cestinou s diakritikou, BEZ marketingovych klise (nejlepsi, uzasny, famozni...).",
    "- Stitky volte kratke (1-2 slova) zamerene na atmosferu, kuchyni, vlastnosti.",
    "- VSECHNY TEXTY V CESTINE s plnou diakritikou.",
  ].join("\n");

  try {
    const result = await generateText({
      model: "openai/gpt-5.4",
      system: systemPrompt,
      prompt,
      output: Output.object({ schema }),
    });

    const out = result.output as EnrichData;
    return { ok: true, error: null, data: out };
  } catch (e) {
    console.error("[enrichFields]", e);
    const msg = e instanceof Error ? e.message : "Neznama chyba.";
    return { ok: false, error: `AI volani selhalo: ${msg}` };
  }
}
