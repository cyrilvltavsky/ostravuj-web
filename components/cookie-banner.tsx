"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "ostravuj-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "all");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "necessary");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-line bg-white/95 backdrop-blur-lg">
      <div className="container-page flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          Tento web používá cookies pro správné fungování a analýzu
          návštěvnosti.{" "}
          <Link
            href="/cookies"
            className="font-medium text-ink underline underline-offset-2 transition-colors hover:text-peach-strong"
          >
            Více informací
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-xl border border-line-hover px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            Pouze nezbytné
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-xl bg-gradient-to-r from-peach-strong to-rose-strong px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
          >
            Přijmout vše
          </button>
        </div>
      </div>
    </div>
  );
}
