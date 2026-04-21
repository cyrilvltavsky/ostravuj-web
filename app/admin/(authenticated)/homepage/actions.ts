"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function setFeatured(
  placeId: string,
  featured: boolean,
): Promise<{ ok: boolean; error: string | null }> {
  try {
    await requireEditor();
  } catch {
    return { ok: false, error: "Pouze pro prihlasene editory." };
  }
  try {
    await prisma.place.update({
      where: { id: placeId },
      data: { featured },
    });
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    return { ok: true, error: null };
  } catch (e) {
    console.error("[setFeatured]", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Neznama chyba.",
    };
  }
}
