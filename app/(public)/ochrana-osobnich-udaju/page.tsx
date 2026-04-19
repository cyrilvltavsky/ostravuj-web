import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů — Ostravuj",
  description:
    "Zásady ochrany osobních údajů na webu Ostravuj.",
};

export default function PrivacyPage() {
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
          Ochrana osobních údajů
        </h1>

        <div className="space-y-6 text-[17px] leading-relaxed text-ink-muted">
          <h2 className="text-xl font-bold text-ink">1. Správce údajů</h2>
          <p>
            Správcem osobních údajů je provozovatel webu Ostravuj dostupný
            na adrese{" "}
            <a
              href="mailto:info@ostravuj.cz"
              className="font-medium text-ink underline underline-offset-4 transition-colors hover:text-peach-strong"
            >
              info@ostravuj.cz
            </a>
            .
          </p>

          <h2 className="text-xl font-bold text-ink">
            2. Jaké údaje shromažďujeme
          </h2>
          <p>
            Shromažďujeme pouze údaje, které nám sami poskytnete
            prostřednictvím formuláře pro návrh místa:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Jméno</li>
            <li>E-mailová adresa</li>
            <li>Název a popis navrhovaného místa</li>
            <li>Fotografie místa (pokud ji nahrajete)</li>
          </ul>

          <h2 className="text-xl font-bold text-ink">
            3. Účel zpracování
          </h2>
          <p>
            Vaše osobní údaje zpracováváme výhradně za účelem:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Přijetí a vyhodnocení vašeho návrhu na nové místo
            </li>
            <li>
              Zpětného kontaktování vás v souvislosti s vaším návrhem
            </li>
          </ul>
          <p>
            <strong className="text-ink">
              Vaše údaje nikdy nepoužíváme pro marketingové účely.
            </strong>{" "}
            Necílíme na vás žádnou reklamu, nezasíláme newslettery ani
            nepředáváme vaše údaje třetím stranám za účelem marketingu.
          </p>

          <h2 className="text-xl font-bold text-ink">
            4. Uchovávání údajů
          </h2>
          <p>
            Údaje z formuláře uchováváme pouze po dobu nezbytnou
            k vyhodnocení vašeho návrhu. Databázi s kontaktními údaji
            uchováváme výhradně za účelem zpětné komunikace
            s navrhovateli. S daty nijak dále nepracujeme.
          </p>

          <h2 className="text-xl font-bold text-ink">
            5. Analytické nástroje
          </h2>
          <p>
            Na webu používáme Google Analytics pro sledování
            návštěvnosti. Pomocí těchto nástrojů sledujeme, jakým
            způsobem uživatelé procházejí web, odkud k nám přišli
            a které stránky navštěvují. Data z analytiky slouží výhradně
            ke zlepšení fungování webu a přizpůsobení marketingové
            strategie.
          </p>
          <p>
            Google Analytics zpracovává anonymizovaná data a používá
            cookies. Více informací najdete na naší stránce{" "}
            <Link
              href="/cookies"
              className="font-medium text-ink underline underline-offset-4 transition-colors hover:text-peach-strong"
            >
              Cookies
            </Link>
            .
          </p>

          <h2 className="text-xl font-bold text-ink">
            6. Právní základ zpracování
          </h2>
          <p>
            Osobní údaje z formuláře zpracováváme na základě vašeho
            souhlasu (čl. 6 odst. 1 písm. a Nařízení GDPR), který
            udělujete odesláním formuláře. Analytická data zpracováváme
            na základě souhlasu s cookies.
          </p>

          <h2 className="text-xl font-bold text-ink">7. Vaše práva</h2>
          <p>
            Podle Nařízení GDPR máte právo:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Na přístup ke svým osobním údajům</li>
            <li>Na opravu nepřesných údajů</li>
            <li>Na výmaz údajů (právo být zapomenut)</li>
            <li>Na omezení zpracování</li>
            <li>Na přenositelnost údajů</li>
            <li>Vznést námitku proti zpracování</li>
            <li>
              Podat stížnost u Úřadu pro ochranu osobních údajů
              (uoou.gov.cz)
            </li>
          </ul>

          <h2 className="text-xl font-bold text-ink">
            8. Zabezpečení údajů
          </h2>
          <p>
            Přijímáme přiměřená technická a organizační opatření
            k ochraně vašich osobních údajů před neoprávněným přístupem,
            ztrátou nebo zneužitím.
          </p>

          <h2 className="text-xl font-bold text-ink">9. Kontakt</h2>
          <p>
            S jakýmkoli dotazem ohledně ochrany osobních údajů se na nás
            můžete obrátit na{" "}
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
