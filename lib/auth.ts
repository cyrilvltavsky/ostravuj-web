import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Profile } from "@prisma/client";

/**
 * Returns the authenticated Supabase user (or null).
 * Use inside Server Components and Server Actions.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Loads the Profile row for the current user, syncing it on first login.
 * If the e-mail matches SUPER_ADMIN_EMAIL, ensures role = SUPERADMIN.
 * Returns null if not logged in.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getAuthUser();
  if (!user || !user.email) return null;

  const isSuperAdmin =
    process.env.SUPER_ADMIN_EMAIL &&
    user.email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase();

  // Upsert ensures a Profile exists on first login
  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
      name: (user.user_metadata?.name as string | undefined) ?? null,
      role: isSuperAdmin ? "SUPERADMIN" : "EDITOR",
    },
    update: {
      // Keep e-mail in sync; promote to SUPERADMIN if env match
      email: user.email,
      ...(isSuperAdmin ? { role: "SUPERADMIN" as const } : {}),
    },
  });

  return profile;
}

/**
 * Server-side guard. Redirects to /admin/login if not signed in.
 * Returns the Profile.
 */
export async function requireEditor(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  return profile;
}

/**
 * Server-side guard. Redirects to /admin if not super-admin.
 */
export async function requireSuperAdmin(): Promise<Profile> {
  const profile = await requireEditor();
  if (profile.role !== "SUPERADMIN") redirect("/admin");
  return profile;
}
