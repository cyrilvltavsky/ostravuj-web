import { requireEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSuggestionsPage() {
  await requireEditor();
  return (
    <>
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-ink">
        Návrhy od uživatelů
      </h1>
      <div className="rounded-card-lg border border-line bg-white p-8 text-center text-ink-muted shadow-soft">
        Zatím nic. Plná schránka přijde ve Fázi 6.
      </div>
    </>
  );
}
