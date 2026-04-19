import type { Metadata } from "next";
import Link from "next/link";
import { SuggestForm } from "./suggest-form";

export const metadata: Metadata = {
  title: "Navrhni místo — Ostravuj",
  description:
    "Znáte skvělé místo v Ostravě? Pošlete nám ho a my ho přidáme do průvodce.",
};

export default function SuggestPage() {
  return (
    <section className="pb-20 pt-16">
      <div className="container-page max-w-[720px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
        >
          ← Zpět na hlavní stranu
        </Link>

        <h1 className="mb-4 text-[clamp(32px,5vw,48px)] font-extrabold leading-tight tracking-tight text-ink">
          Navrhni místo
        </h1>

        <p className="mb-10 max-w-[600px] text-[17px] leading-relaxed text-ink-muted">
          Víš o&nbsp;místě, které by tady určitě mělo být? Nebo takové místo
          vlastníš? Vyplň krátký formulář, případně nám napiš rovnou na{" "}
          <a
            href="mailto:info@ostravuj.cz"
            className="font-medium text-ink underline underline-offset-4 transition-colors hover:text-peach-strong"
          >
            info@ostravuj.cz
          </a>
          . My místo prověříme a&nbsp;pokud bude sedět, rádi ho přidáme.
        </p>

        <div className="rounded-card-lg border border-line bg-white p-8 md:p-10">
          <SuggestForm />
        </div>
      </div>
    </section>
  );
}
