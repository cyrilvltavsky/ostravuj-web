"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { requireEditor } from "@/lib/auth";

/**
 * OpenAI provider routed through Vercel AI Gateway. We use the Responses
 * API (`openai.responses(...)`) because it supports the web_search_preview
 * tool — that's what lets the model fetch current info about Ostrava
 * places instead of relying solely on training data.
 */
const aiOpenAI = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1/openai",
});

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
    "Jsi expert na podniky a mista v OSTRAVE a OKOLI Ostravy (Moravskoslezsky kraj — Ostrava, Frydek-Mistek, Karvina, Havirov, Bohumin, Hlucin, Petrkovice, Vitkovice, Poruba, Slezska Ostrava, Moravska Ostrava, Marianske Hory atd.).",
    "",
    "GEOGRAFICKE OMEZENI — KRITICKE:",
    "- Tento katalog je VYHRADNE pro mista v Ostrave a jejim okoli (Moravskoslezsky kraj).",
    "- Pokud podnik existuje ve vice mestech (retezce, franchisy), zamer se VYHRADNE na ostravskou pobocku.",
    "- Pokud je podnik mimo Ostravu/Moravskoslezsky kraj (Praha, Brno, Olomouc...), VRAT NULL pro vsechna pole. Tento katalog ho nepokryva.",
    "- Pri pochybnostech, jestli existuje v Ostrave, vrat null spise nez si vymyslej.",
    "",
    "PRISTUP k jednotlivym polim:",
    "",
    "ADRESA, CTVRT — POUZE pokud mas spolehlivou znalost ostravske adresy (s PSC zacinajicim 70x, 71x, 72x, 73x, 74x). Jinak null.",
    "",
    "TELEFON, E-MAIL, WEB, INSTAGRAM, FACEBOOK — POUZE pokud si jist a jde o ostravskou pobocku. Jinak null.",
    "",
    "KRATKY POPIS (shortDesc) — VYPLNTE skoro vzdy pokud znate alespon kategorii a podnik je v Ostrave:",
    "- Znate podnik konkretne -> popiste atmosferu, specialitu, co tam najit.",
    "- Znate jen typ (napr. 'kavarna v Ostrave') -> napsete genericky popis pro tento typ ostravskeho podniku.",
    "- Popis 2-3 vety, prirozena cestina s diakritikou, BEZ klise (nejlepsi, uzasny, famozni).",
    "",
    "STITKY (tags) — vyplnte alespon 2-3 stitky podle typu podniku (restaurace -> 'restaurace', 'obed', 'vecere'; kavarna -> 'kavarna', 'kava', 'snidane'). Pokud znate atmosferu, pridejte ('zahradka', 'rodine', 'klidne', 'pet-friendly').",
    "",
    "PRAVIDLO: Nedavejte null pro VSECHNA pole jen proto, ze nezname jednu vec. Vyplnte co MUZETE (popis, stitky podle kategorie), zbytek nechte null.",
    "",
    "VSECHNY TEXTY V CESTINE s plnou diakritikou.",
  ].join("\n");

  try {
    const result = await generateText({
      model: aiOpenAI.responses("gpt-5"),
      system: systemPrompt,
      prompt,
      tools: {
        web_search_preview: aiOpenAI.tools.webSearchPreview({
          searchContextSize: "medium",
          userLocation: {
            type: "approximate",
            country: "CZ",
            region: "Moravskoslezsky kraj",
            city: "Ostrava",
          },
        }),
      },
      output: Output.object({ schema }),
    });

    const out = result.output as EnrichData;
    return { ok: true, error: null, data: out };
  } catch (e) {
    console.error("[enrichFields]", e);
    const msg = e instanceof Error ? e.message : "Neznama chyba.";
    // Fallback to plain gateway model without web search if Responses API
    // path fails (e.g. tool not enabled for this account)
    if (
      msg.includes("web_search") ||
      msg.includes("responses") ||
      msg.includes("not supported")
    ) {
      try {
        const fallback = await generateText({
          model: "openai/gpt-5.4",
          system: systemPrompt,
          prompt,
          output: Output.object({ schema }),
        });
        return { ok: true, error: null, data: fallback.output as EnrichData };
      } catch (e2) {
        const msg2 = e2 instanceof Error ? e2.message : "Neznama chyba.";
        return { ok: false, error: `AI volani selhalo: ${msg2}` };
      }
    }
    return { ok: false, error: `AI volani selhalo: ${msg}` };
  }
}
