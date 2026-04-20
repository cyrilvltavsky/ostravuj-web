import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Theme-aware via CSS variables (see globals.css). The fallback
        // hex matches the original light palette so prerendered HTML
        // looks the same when CSS hasn't loaded yet.
        // NOTE: We do NOT override `white` — `text-white` / `bg-white`
        // must stay actual white (used on gradient buttons + overlays).
        // Use `bg-card` for surfaces that should flip in dark mode.
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
          light: "rgb(var(--color-ink-light) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--color-line) / <alpha-value>)",
          hover: "rgb(var(--color-line-hover) / <alpha-value>)",
        },
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        peach: {
          DEFAULT: "#ffe4d6",
          strong: "#f97316",
          deep: "#ea580c",
        },
        mint: {
          DEFAULT: "#d1fae5",
          strong: "#10b981",
          deep: "#065f46",
        },
        lavender: {
          DEFAULT: "#ede9fe",
          strong: "#8b5cf6",
        },
        sky: {
          DEFAULT: "#dbeafe",
          strong: "#3b82f6",
        },
        rose: {
          DEFAULT: "#ffe4e6",
          strong: "#f43f5e",
        },
      },
      borderRadius: {
        "card-sm": "10px",
        card: "16px",
        "card-lg": "24px",
        "card-xl": "32px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17, 24, 39, 0.04)",
        "soft-md": "0 4px 16px rgba(17, 24, 39, 0.06)",
        "soft-lg": "0 12px 40px rgba(17, 24, 39, 0.08)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease",
        "slide-up": "slide-up 300ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
