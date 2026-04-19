import Link from "next/link";
import type { CategoryMeta } from "@/lib/places";

export function Footer({ categories }: { categories: CategoryMeta[] }) {
  return (
    <footer className="mt-20 border-t border-line bg-surface py-16">
      <div className="container-page">
        <div className="mb-10 grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="text-gradient text-2xl font-extrabold tracking-tight">
              Ostravuj
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              Kurátorský průvodce po nejlepších místech v Ostravě. Osobně
              vybíráme jen ta místa, která za to stojí.
            </p>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink">
              Objevuj
            </h5>
            <ul className="space-y-1">
              {categories.map((cat) => (
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
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/o-ostravuj"
                  className="block py-1 text-ink-muted transition-colors hover:text-ink"
                >
                  O Ostravuj
                </Link>
              </li>
              <li>
                <Link
                  href="/navrh-misto"
                  className="block py-1 text-ink-muted transition-colors hover:text-ink"
                >
                  Navrhni místo
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="block py-1 text-ink-muted transition-colors hover:text-ink"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink">
              Právní
            </h5>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/ochrana-osobnich-udaju"
                  className="block py-1 text-ink-muted transition-colors hover:text-ink"
                >
                  Ochrana osobních údajů
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="block py-1 text-ink-muted transition-colors hover:text-ink"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-2 border-t border-line pt-6 text-center text-xs text-ink-light">
          <p>
            Vyrobeno s láskou v Ostravě od{" "}
            <a
              href="http://ctyrimedia.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-muted transition-colors hover:text-ink"
            >
              čtyři.media
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
