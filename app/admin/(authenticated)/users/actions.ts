"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@prisma/client";

export type InviteState = { error: string | null; success?: string | null };

export async function inviteUser(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const me = await requireSuperAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || null;
  const role = (formData.get("role") === "SUPERADMIN"
    ? "SUPERADMIN"
    : "EDITOR") as Role;

  if (!email || !/.+@.+\..+/.test(email)) {
    return { error: "Zadejte platný e-mail." };
  }

  // Skip if user already exists in our profiles
  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    return { error: "Uživatel s tímto e-mailem už existuje." };
  }

  const supabase = createAdminClient();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ostravuj.cz";

  // Use the Admin API to invite the user. This sends an e-mail with a
  // magic link that lands on /auth/callback?code=... (PKCE flow).
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/admin`,
    data: { name },
  });

  if (error) {
    return { error: `Pozvánka selhala: ${error.message}` };
  }
  if (!data.user) {
    return { error: "Supabase nevrátil uživatele." };
  }

  // Pre-create the Profile so the role is set immediately on first login
  await prisma.profile.create({
    data: {
      id: data.user.id,
      email,
      name,
      role,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: me.id,
      action: "INVITE",
      entityType: "Profile",
      entityId: data.user.id,
      metadata: { email, role },
    },
  });

  revalidatePath("/admin/users");
  return {
    error: null,
    success: `Pozvánka odeslána na ${email}.`,
  };
}

export async function changeRole(
  userId: string,
  role: Role,
): Promise<{ error: string | null }> {
  const me = await requireSuperAdmin();
  if (userId === me.id) {
    return { error: "Nemůžete změnit svou vlastní roli." };
  }

  await prisma.profile.update({
    where: { id: userId },
    data: { role },
  });
  await prisma.auditLog.create({
    data: {
      actorId: me.id,
      action: "ROLE_CHANGE",
      entityType: "Profile",
      entityId: userId,
      metadata: { role },
    },
  });
  revalidatePath("/admin/users");
  return { error: null };
}

export async function removeUser(
  userId: string,
): Promise<{ error: string | null }> {
  const me = await requireSuperAdmin();
  if (userId === me.id) {
    return { error: "Nemůžete smazat sám sebe." };
  }

  const supabase = createAdminClient();

  // Delete from Supabase Auth first
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error && !error.message.toLowerCase().includes("not found")) {
    return { error: `Smazání auth uživatele selhalo: ${error.message}` };
  }

  // Then delete profile (cascades audit logs etc.)
  await prisma.profile.delete({ where: { id: userId } }).catch(() => undefined);

  await prisma.auditLog.create({
    data: {
      actorId: me.id,
      action: "REMOVE",
      entityType: "Profile",
      entityId: userId,
    },
  });

  revalidatePath("/admin/users");
  return { error: null };
}
