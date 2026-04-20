"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SUGGESTION_PHOTOS_BUCKET,
  uploadPhoto,
} from "@/lib/supabase/storage";

// Resend is optional. The Suggestion is always persisted to DB; the e-mail
// notification is only sent when RESEND_API_KEY is configured.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export type SuggestState = {
  success: boolean;
  error: string | null;
};

async function ensureSuggestionBucket() {
  const supabase = createAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === SUGGESTION_PHOTOS_BUCKET);
  if (exists) return;
  await supabase.storage.createBucket(SUGGESTION_PHOTOS_BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
}

export async function submitSuggestion(
  _prev: SuggestState,
  formData: FormData,
): Promise<SuggestState> {
  const placeName = String(formData.get("placeName") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "")
    .trim()
    .toLowerCase();
  const photo = formData.get("photo");

  if (!placeName || !category || !description || !contactName || !contactEmail) {
    return { success: false, error: "Vyplňte prosím všechna povinná pole." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { success: false, error: "Zadejte platnou e-mailovou adresu." };
  }

  // Optional photo upload
  let photoUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    try {
      await ensureSuggestionBucket();
      photoUrl = await uploadPhoto(
        SUGGESTION_PHOTOS_BUCKET,
        photo,
        "submissions",
      );
    } catch (e) {
      // Photo failure shouldn't block the submission — log and continue
      console.error("Suggestion photo upload failed:", e);
    }
  }

  // Persist
  const suggestion = await prisma.suggestion.create({
    data: {
      placeName,
      category,
      description,
      contactName,
      contactEmail,
      photoUrl,
    },
  });

  // Brief notification e-mail to super-admin
  const adminEmail = process.env.SUPER_ADMIN_EMAIL ?? "info@ostravuj.cz";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ostravuj.cz";
  const detailUrl = `${appUrl}/admin/suggestions/${suggestion.id}`;

  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Ostravuj <noreply@ostravuj.cz>",
        to: adminEmail,
        replyTo: contactEmail,
        subject: `Nový návrh: ${placeName}`,
        text: [
          `Nový návrh místa od ${contactName}.`,
          ``,
          `Název: ${placeName}`,
          `Kategorie: ${category}`,
          ``,
          `Detail v administraci: ${detailUrl}`,
        ].join("\n"),
      });
    } catch (e) {
      // Notification failure shouldn't block — suggestion is in DB
      console.error("Suggestion notification e-mail failed:", e);
    }
  } else {
    console.warn(
      "[navrh-misto] RESEND_API_KEY not set — skipping notification e-mail.",
    );
  }

  return { success: true, error: null };
}
