import Link from "next/link";
import { CATEGORIES } from "@/lib/places";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface py-16">
      <div className="container-page">
        <div className="mb-10 grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="text-gradient text-2xl font-extrabold tracking-tight">
              Ostravuj
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              Kurátorský průvodce po nejlepších místech v Ostravě. Ručně
              vybíráme jen to, co stojí za to.
            </p>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink">
              Objevuj
            </h5>
            <ul className="space-y-1">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={{ pathname: `/${cat.slug}` }}
                    className="block py-1 text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {cat.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink">
              Projekt
            </h5>
            <ul className="space-y-1 text-sm text-ink-muted">
              <li className="py-1">O Ostravuj</li>
              <li className="py-1">Navrhni místo</li>
              <li className="py-1">Kontakt</li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink">
              Právní
            </h5>
            <ul className="space-y-1 text-sm text-ink-muted">
              <li className="py-1">Zásady ochrany</li>
              <li className="py-1">Cookies</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line pt-6 text-center text-xs text-ink-light">
          © 2026 Ostravuj · Vyrobeno s láskou k Ostravě
        </div>
      </div>
    </footer>
  );
}
