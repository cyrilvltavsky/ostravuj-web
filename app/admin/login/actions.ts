"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const from = String(formData.get("from") ?? "/admin");

  if (!email || !/.+@.+\..+/.test(email)) {
    return { error: "Zadejte platný e-mail." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(from)}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
      // Don't auto-create accounts — only invited users may log in
      shouldCreateUser: false,
    },
  });

  if (error) {
    // Supabase returns "Signups not allowed for otp" when shouldCreateUser=false
    // and user doesn't exist. Surface a friendly message.
    if (
      error.message.toLowerCase().includes("signups not allowed") ||
      error.message.toLowerCase().includes("user not found")
    ) {
      return {
        error:
          "Tento e-mail nemá přístup do administrace. Kontaktujte správce.",
      };
    }
    return { error: error.message };
  }

  // Success — redirect to the same page with ?sent=1 so the form swaps to confirmation
  redirect("/admin/login?sent=1");
}
