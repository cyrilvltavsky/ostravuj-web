"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Marks the suggestion as APPROVED and routes the editor to the
 * "new place" form pre-filled from the suggestion payload.
 */
export async function approveSuggestion(id: string): Promise<void> {
  const me = await requireEditor();
  await prisma.suggestion.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedById: me.id,
      reviewedAt: new Date(),
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: me.id,
      action: "APPROVE",
      entityType: "Suggestion",
      entityId: id,
    },
  });
  revalidatePath("/admin/suggestions");
  revalidatePath(`/admin/suggestions/${id}`);
  redirect(`/admin/places/new?fromSuggestion=${id}`);
}

export async function rejectSuggestion(
  id: string,
  formData: FormData,
): Promise<void> {
  const me = await requireEditor();
  const note = String(formData.get("note") ?? "").trim() || null;
  await prisma.suggestion.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewNote: note,
      reviewedById: me.id,
      reviewedAt: new Date(),
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: me.id,
      action: "REJECT",
      entityType: "Suggestion",
      entityId: id,
      metadata: note ? { note } : undefined,
    },
  });
  revalidatePath("/admin/suggestions");
  revalidatePath(`/admin/suggestions/${id}`);
}

export async function deleteSuggestion(
  id: string,
): Promise<{ error: string | null }> {
  const me = await requireEditor();
  await prisma.suggestion.delete({ where: { id } }).catch(() => undefined);
  await prisma.auditLog.create({
    data: {
      actorId: me.id,
      action: "DELETE",
      entityType: "Suggestion",
      entityId: id,
    },
  });
  revalidatePath("/admin/suggestions");
  return { error: null };
}

export async function bulkSuggestionAction(
  ids: string[],
  op: "REJECT" | "DELETE",
): Promise<{ ok: number; error: string | null }> {
  const me = await requireEditor();
  if (!Array.isArray(ids) || ids.length === 0)
    return { ok: 0, error: "Žádné návrhy nevybrány." };

  let ok = 0;
  for (const id of ids) {
    try {
      if (op === "DELETE") {
        await prisma.suggestion.delete({ where: { id } });
      } else {
        await prisma.suggestion.update({
          where: { id },
          data: {
            status: "REJECTED",
            reviewedById: me.id,
            reviewedAt: new Date(),
          },
        });
      }
      await prisma.auditLog.create({
        data: {
          actorId: me.id,
          action: op,
          entityType: "Suggestion",
          entityId: id,
          metadata: { bulk: true },
        },
      });
      ok++;
    } catch (e) {
      console.error("[bulkSuggestionAction]", op, id, e);
    }
  }

  revalidatePath("/admin/suggestions");
  return { ok, error: null };
}

export async function reopenSuggestion(id: string): Promise<void> {
  const me = await requireEditor();
  await prisma.suggestion.update({
    where: { id },
    data: {
      status: "NEW",
      reviewedById: null,
      reviewedAt: null,
      reviewNote: null,
    },
  });
  revalidatePath("/admin/suggestions");
  revalidatePath(`/admin/suggestions/${id}`);
}
