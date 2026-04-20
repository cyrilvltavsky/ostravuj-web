"use client";

/**
 * Public-section error boundary. Catches errors inside the (public)
 * route segment without losing the marketing layout chrome.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (typeof console !== "undefined") {
    console.error("[public-error]", error);
  }

  return (
    <section className="container-page py-20">
      <div className="mx-auto max-w-[640px] rounded-card-lg border border-line bg-card p-8 shadow-soft">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-ink">
          Něco se pokazilo při načítání stránky
        </h1>
        <p className="mb-6 text-sm text-ink-muted">
          Zkus prosím tlačítko níže. Pokud chyba přetrvává, pošli detail níže.
        </p>

        <div className="mb-6 rounded-xl border border-line bg-surface p-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink-light">
            {error.name || "Error"}
          </p>
          <p className="break-words font-mono text-sm text-rose-strong">
            {error.message || "Neznámá chyba."}
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-ink-light">
              digest: {error.digest}
            </p>
          ) : null}
          {error.stack ? (
            <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-card p-3 text-[11px] text-ink-muted">
              {error.stack}
            </pre>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-gradient-to-r from-peach-strong to-rose-strong px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          Zkusit znovu
        </button>
      </div>
    </section>
  );
}
