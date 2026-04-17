import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontakt — Ostravuj",
  description: "Kontaktní údaje projektu Ostravuj.",
};

export default function ContactPage() {
  return (
    <section className="pb-20 pt-16">
      <div className="container-page max-w-[720px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
        >
          ← Zpět na hlavní stranu
        </Link>

        <h1 className="mb-10 text-[clamp(32px,5vw,48px)] font-extrabold leading-tight tracking-tight text-ink">
          Kontakt
        </h1>

        <div className="rounded-card-lg border border-line bg-white p-8 md:p-10">
          <dl className="space-y-6 text-[17px]">
            <div>
              <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-light">
                Jméno
              </dt>
              <dd className="font-medium text-ink">Cyril Vltavský</dd>
            </div>

            <div>
              <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-light">
                Telefon
              </dt>
              <dd>
                <a
                  href="tel:+420737370572"
                  className="font-medium text-ink transition-colors hover:text-peach-strong"
                >
                  +420 737 370 572
                </a>
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-ink-light">
                E-mail
              </dt>
              <dd>
                <a
                  href="mailto:info@ostravuj.cz"
                  className="font-medium text-ink transition-colors hover:text-peach-strong"
                >
                  info@ostravuj.cz
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-8 text-sm text-ink-muted">
          Máte tip na místo?{" "}
          <Link
            href="/navrh-misto"
            className="font-medium text-ink underline underline-offset-4 transition-colors hover:text-peach-strong"
          >
            Navrhněte ho přes formulář
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
