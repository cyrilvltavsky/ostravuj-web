import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookies — Ostravuj",
  description: "Informace o používání cookies na webu Ostravuj.",
};

export default function CookiesPage() {
  return (
    <section className="pb-20 pt-16">
      <div className="container-page max-w-[720px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-all hover:gap-3 hover:text-ink"
        >
          ← Zpět na hlavní stranu
        </Link>

        <h1 className="mb-8 text-[clamp(32px,5vw,48px)] font-extrabold leading-tight tracking-tight text-ink">
          Cookies
        </h1>

        <div className="space-y-6 text-[17px] leading-relaxed text-ink-muted">
          <p>
            Tento web používá cookies, aby správně fungoval
            a abychom mohli analyzovat jeho návštěvnost.
          </p>

          <h2 className="text-xl font-bold text-ink">Co jsou cookies?</h2>
          <p>
            Cookies jsou malé textové soubory, které se ukládají ve vašem
            prohlížeči při návštěvě webových stránek. Umožňují webu
            zapamatovat si vaše nastavení a rozpoznat vás při další návštěvě.
          </p>

          <h2 className="text-xl font-bold text-ink">
            Jaké cookies používáme?
          </h2>

          <h3 className="text-lg font-semibold text-ink">
            Nezbytné cookies
          </h3>
          <p>
            Tyto cookies jsou nutné pro základní fungování webu. Nelze je
            vypnout. Zahrnují například zapamatování vašeho souhlasu
            s cookies.
          </p>

          <h3 className="text-lg font-semibold text-ink">
            Analytické cookies (Google Analytics)
          </h3>
          <p>
            Používáme Google Analytics ke sledování návštěvnosti webu. Tyto
            cookies nám pomáhají pochopit, jak návštěvníci web používají,
            odkud přicházejí a které stránky jsou nejnavštěvovanější. Data
            jsou anonymizovaná a slouží výhradně ke zlepšení webu.
          </p>
          <p>
            Google Analytics ukládá cookies jako <code className="rounded bg-surface px-1.5 py-0.5 text-sm font-medium text-ink">_ga</code>,{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-sm font-medium text-ink">_ga_*</code>{" "}
            s dobou platnosti až 2 roky.
          </p>

          <h2 className="text-xl font-bold text-ink">
            Jak cookies spravovat?
          </h2>
          <p>
            Cookies můžete kdykoli smazat nebo zablokovat v nastavení svého
            prohlížeče. Upozorňujeme, že zablokování některých cookies může
            ovlivnit fungování webu.
          </p>

          <h2 className="text-xl font-bold text-ink">Právní základ</h2>
          <p>
            Nezbytné cookies zpracováváme na základě oprávněného zájmu
            (čl. 6 odst. 1 písm. f GDPR). Analytické cookies zpracováváme
            pouze na základě vašeho souhlasu (čl. 6 odst. 1 písm. a GDPR),
            který můžete kdykoli odvolat.
          </p>

          <h2 className="text-xl font-bold text-ink">Kontakt</h2>
          <p>
            Máte-li dotazy ohledně cookies, kontaktujte nás na{" "}
            <a
              href="mailto:info@ostravuj.cz"
              className="font-medium text-ink underline underline-offset-4 transition-colors hover:text-peach-strong"
            >
              info@ostravuj.cz
            </a>
            .
          </p>

          <p className="text-sm text-ink-light">
            Poslední aktualizace: 16. dubna 2026
          </p>
        </div>
      </div>
    </section>
  );
}
