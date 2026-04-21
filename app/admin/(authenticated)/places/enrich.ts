"use server";

import { generateText, Output } from "ai";
import { z } from "zod";
import { requireEditor } from "@/lib/auth";

export type EnrichResult = {
  ok: boolean;
  error: string | null;
  data?: {
    address: string | null;
    district: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    shortDesc: string | null;
    tags: string[];
  };
};

const EnrichSchema = z.object({
  address: z
    .string()
    .nullable()
    .describe(
      "Plna adresa vcetne cisla popisneho a PSC. null pokud neznama.",
    ),
  district: z
    .string()
    .nullable()
    .describe(
      "Ctvrt nebo cast Ostravy (Moravska Ostrava, Poruba, Slezska Ostrava, ...). null pokud neznama.",
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
  shortDesc: z
    .string()
    .nullable()
    .describe(
      "Kratky popis mista v cestine, 2-3 vety, popisuje atmosferu a co tam najit. Prirozeny jazyk, zadne marketingove fraze. null pokud nedokazes popsat.",
    ),
  tags: z
    .array(z.string())
    .describe(
      "3 az 6 kratkych ceskych stitku (1-2 slova) charakterizujicich misto: lokalni suroviny, vyberova kava, pet-friendly, terasa apod. Prazdne pole pokud nejsou jiste.",
    ),
});

export async function enrichPlaceFromWeb(input: {
  name: string;
  category?: string | null;
  address?: string | null;
}): Promise<EnrichResult> {
  try {
    await requireEditor();
  } catch {
    return { ok: false, error: "Pouze pro prihlasene editory." };
  }

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Zadejte nazev mista." };

  const ctxParts = [
    `Hledam informace o ostravskem podniku nebo miste s nazvem: ${name}.`,
  ];
  if (input.category) ctxParts.push(`Kategorie: ${input.category}.`);
  if (input.address) ctxParts.push(`Znama adresa nebo napoveda: ${input.address}.`);
  ctxParts.push("Ostrava, Ceska republika.");
  const ctx = ctxParts.join(" ");

  const systemPrompt = [
    "Jsi pomocnik pro ostravsky katalog mist. Tvuj ukol je vyplnit strukturovane udaje o ostravskem podniku.",
    "DULEZITA pravidla:",
    "- Pokud si nejsi JIST konkretni informaci, vrat pro to pole null (nebo prazdne pole pro tagy). NIKDY si nevymyslej.",
    "- Adresy MUSI byt realne ostravske adresy. Pokud misto neznas, vrat null pro adresu i ostatni pole.",
    "- Kontaktni udaje (telefon, e-mail, web, socialni site) doplnte jen pokud mate spolehlivou znalost.",
    "- Kratky popis piste prirozenou cestinou bez marketingovych klise (nejlepsi, uzasny, famozni...).",
    "- Stitky volte kratke (1-2 slova), zamerene na atmosferu, kuchyni a vlastnosti.",
    "- VSE ODPOVEDI A POPIS PISTE V CESTINE s diakritikou.",
  ].join("\n");

  try {
    const result = await generateText({
      model: "openai/gpt-5.4",
      system: systemPrompt,
      prompt: ctx,
      output: Output.object({ schema: EnrichSchema }),
    });

    const data = result.output;
    return {
      ok: true,
      error: null,
      data: {
        address: data.address,
        district: data.district,
        phone: data.phone,
        email: data.email,
        website: data.website,
        instagram: data.instagram,
        facebook: data.facebook,
        shortDesc: data.shortDesc,
        tags: data.tags ?? [],
      },
    };
  } catch (e) {
    console.error("[enrichPlaceFromWeb]", e);
    const msg = e instanceof Error ? e.message : "Nezname chyba.";
    return { ok: false, error: `AI volani selhalo: ${msg}` };
  }
}
