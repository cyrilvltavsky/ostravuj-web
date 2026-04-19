"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type SuggestState = {
  success: boolean;
  error: string | null;
};

export async function submitSuggestion(
  _prev: SuggestState,
  formData: FormData,
): Promise<SuggestState> {
  const placeName = formData.get("placeName") as string | null;
  const category = formData.get("category") as string | null;
  const description = formData.get("description") as string | null;
  const contactName = formData.get("contactName") as string | null;
  const contactEmail = formData.get("contactEmail") as string | null;

  if (!placeName?.trim() || !category || !description?.trim() || !contactName?.trim() || !contactEmail?.trim()) {
    return { success: false, error: "Vyplňte prosím všechna povinná pole." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactEmail)) {
    return { success: false, error: "Zadejte platnou e-mailovou adresu." };
  }

  const body = [
    `**Název místa:** ${placeName.trim()}`,
    `**Kategorie:** ${category}`,
    `**Popis:** ${description.trim()}`,
    `**Kontakt:** ${contactName.trim()} (${contactEmail.trim()})`,
  ].join("\n\n");

  try {
    await resend.emails.send({
      from: "Ostravuj <noreply@ostravuj.cz>",
      to: "info@ostravuj.cz",
      replyTo: contactEmail.trim(),
      subject: `Návrh místa: ${placeName.trim()}`,
      text: body,
    });

    return { success: true, error: null };
  } catch {
    return {
      success: false,
      error: "Odeslání se nezdařilo. Zkuste to prosím znovu nebo nám napište přímo na info@ostravuj.cz.",
    };
  }
}
