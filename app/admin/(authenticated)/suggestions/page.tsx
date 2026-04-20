import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SuggestionsTable, type SuggestionRow } from "./suggestions-table";

export const dynamic = "force-dynamic";

export default async function AdminSuggestionsPage() {
  await requireEditor();

  const suggestions = await prisma.suggestion.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows: SuggestionRow[] = suggestions.map((s) => ({
    id: s.id,
    placeName: s.placeName,
    category: s.category,
    contactName: s.contactName,
    contactEmail: s.contactEmail,
    status: s.status,
    createdAtIso: s.createdAt.toISOString(),
  }));

  return (
    <>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Návrhy od uživatelů{" "}
        <span className="ml-2 text-base font-medium text-ink-light">
          ({suggestions.length})
        </span>
      </h1>
      <p className="mb-6 text-sm text-ink-muted">
        Schránka tipů na nová místa. Můžeš schvalovat, zamítat nebo mazat
        — i hromadně.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-card-lg border border-line bg-card p-10 text-center text-ink-muted shadow-soft">
          Zatím žádné návrhy.
        </div>
      ) : (
        <SuggestionsTable rows={rows} />
      )}
    </>
  );
}
