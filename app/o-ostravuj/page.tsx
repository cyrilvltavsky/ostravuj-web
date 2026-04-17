import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O Ostravuj — Objevuj nejlepší místa v Ostravě",
  description:
    "Kdo stojí za Ostravuj a proč tento projekt vznikl.",
};

export default function AboutPage() {
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
          O projektu <span className="text-gradient">Ostravuj</span>
        </h1>

        <div className="space-y-6 text-[17px] leading-relaxed text-ink-muted">
          <p>
            Ostravuj vznikl z&nbsp;jednoduché frustrace: přijdete do Ostravy,
            otevřete Google Maps a&nbsp;dostanete stovky výsledků s&nbsp;průměrným
            hodnocením 4,2. Které místo ale stojí za to doopravdy?
          </p>

          <p>
            Tohle je náš pokus o&nbsp;odpověď. <strong className="text-ink">Ostravuj je
            kurátorský, velmi subjektivní výběr míst, která v&nbsp;Ostravě
            milujeme.</strong> Žádný algoritmus, žádné placené zápisy &mdash;
            jen osobní zkušenost a&nbsp;chuť sdílet to nejlepší z&nbsp;města,
            které si víc pozornosti zaslouží.
          </p>

          <p>
            Najdete tu restaurace, kde se opravdu dobře jí. Kavárny, kam se
            chodíme vracet. Památky, galerie a&nbsp;místa, která vás překvapí.
            Tipy na rande i&nbsp;výlety, které nic nestojí. Každé místo jsme
            navštívili, vyzkoušeli a&nbsp;pak se rozhodli, jestli si zaslouží být
            na seznamu.
          </p>

          <p>
            Netvrdíme, že máme pravdu. Tvrdíme, že za každým tipem stojí
            skutečný zážitek &mdash; a&nbsp;že je lepší mít pár ověřených
            doporučení než nekonečný seznam průměrných míst.
          </p>

          <p>
            Máte tip na místo, které by tu určitě mělo být?{" "}
            <Link
              href="/navrh-misto"
              className="font-medium text-ink underline underline-offset-4 transition-colors hover:text-peach-strong"
            >
              Navrhněte ho
            </Link>
            . Rádi se na něj podíváme.
          </p>
        </div>
      </div>
    </section>
  );
}
