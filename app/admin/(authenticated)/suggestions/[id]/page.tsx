import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  approveSuggestion,
  rejectSuggestion,
  reopenSuggestion,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function SuggestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditor();
  const { id } = await params;

  const s = await prisma.suggestion.findUnique({
    where: { id },
    include: { reviewedBy: true, resultPlace: true },
  });
  if (!s) notFound();

  const approve = approveSuggestion.bind(null, id);
  const reject = rejectSuggestion.bind(null, id);
  const reopen = reopenSuggestion.bind(null, id);

  return (
    <>
      <Link
        href="/admin/suggestions"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
      >
        ← Zpět na seznam
      </Link>

      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">
        {s.placeName}
      </h1>
      <p className="mb-8 text-sm text-ink-muted">
        Návrh od <strong>{s.contactName}</strong> ·{" "}
        {s.createdAt.toLocaleString("cs-CZ")}
      </p>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <Card title="Kategorie">
            <p className="text-ink">{s.category}</p>
          </Card>

          <Card title="Popis">
            <p className="whitespace-pre-line text-ink">{s.description}</p>
          </Card>

          {s.photoUrl ? (
            <Card title="Fotografie">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface">
                <Image
                  src={s.photoUrl}
                  alt={s.placeName}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Card>
          ) : null}

          <Card title="Kontakt">
            <p className="text-ink">{s.contactName}</p>
            <a
              href={`mailto:${s.contactEmail}`}
              className="text-sm text-peach-strong hover:underline"
            >
              {s.contactEmail}
            </a>
          </Card>

          {s.reviewNote ? (
            <Card title="Poznámka při zamítnutí">
              <p className="text-ink-muted">{s.reviewNote}</p>
            </Card>
          ) : null}

          {s.resultPlace ? (
            <Card title="Vytvořené místo">
              <Link
                href={`/admin/places/${s.resultPlace.id}/edit`}
                className="text-peach-strong hover:underline"
              >
                {s.resultPlace.name}
              </Link>
            </Card>
          ) : null}
        </section>

        <aside className="space-y-4 md:sticky md:top-6 md:self-start">
          <div className="rounded-card-lg border border-line bg-card p-5 shadow-soft">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-light">
              Status
            </p>
            <p className="mb-4 text-lg font-extrabold text-ink">
              {s.status === "NEW" && "Nový"}
              {s.status === "APPROVED" && "Schválený"}
              {s.status === "REJECTED" && "Zamítnutý"}
            </p>
            {s.reviewedBy ? (
              <p className="mb-4 text-xs text-ink-light">
                Zpracoval: {s.reviewedBy.email}
                <br />
                {s.reviewedAt?.toLocaleString("cs-CZ")}
              </p>
            ) : null}

            {s.status === "NEW" ? (
              <div className="space-y-2.5">
                <form action={approve}>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-peach-strong to-rose-strong px-4 py-2.5 text-sm font-semibold text-white shadow-soft-md transition hover:-translate-y-0.5"
                  >
                    Schválit a vytvořit místo
                  </button>
                </form>
                <form action={reject} className="space-y-2">
                  <textarea
                    name="note"
                    rows={2}
                    placeholder="Důvod zamítnutí (volitelné)"
                    className="w-full rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink shadow-soft outline-none focus:border-rose-strong focus:ring-1 focus:ring-rose-strong/30"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-line-hover bg-card px-4 py-2 text-sm font-medium text-rose-strong transition hover:bg-rose/30"
                  >
                    Zamítnout
                  </button>
                </form>
              </div>
            ) : (
              <form action={reopen}>
                <button
                  type="submit"
                  className="w-full rounded-xl border border-line-hover bg-card px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink"
                >
                  Vrátit jako nový
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card-lg border border-line bg-card p-5 shadow-soft">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-light">
        {title}
      </p>
      {children}
    </div>
  );
}
