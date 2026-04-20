"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ostravuj-theme";

type Theme = "light" | "dark";

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let initial: Theme = "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "dark" || stored === "light") initial = stored;
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
        initial = "dark";
    } catch {
      /* ignore */
    }
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  // Render a stable wrapper on SSR to avoid hydration mismatch; inner icon
  // only swaps once mounted.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"
      }
      title={theme === "dark" ? "Světlý režim" : "Tmavý režim"}
      className={
        "flex h-10 w-10 items-center justify-center rounded-card-sm bg-surface text-ink-muted transition hover:text-ink " +
        className
      }
    >
      {mounted && theme === "dark" ? (
        // Sun
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        // Moon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
