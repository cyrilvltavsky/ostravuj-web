"use client";

/**
 * Last-resort error boundary used by Next.js when the root layout itself
 * crashes. Replaces the generic "Application error" overlay with a panel
 * that shows the actual error name + message + stack so we can debug
 * production hydration issues.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Surface to console so it shows up in Vercel logs / browser DevTools
  if (typeof console !== "undefined") {
    console.error("[global-error]", error);
  }

  return (
    <html lang="cs">
      <body
        style={{
          margin: 0,
          padding: "48px 24px",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#fafafa",
          color: "#111827",
          minHeight: "100vh",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 12,
            }}
          >
            Něco se pokazilo
          </h1>
          <p style={{ marginBottom: 24, color: "#6b7280" }}>
            Stránku se nepodařilo načíst. Zkus prosím obnovit (Cmd/Ctrl +
            Shift + R) nebo zavřít všechna rozšíření prohlížeče. Detail
            chyby je níže — pošli mi ho prosím.
          </p>

          <div
            style={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "white",
              padding: 20,
              marginBottom: 16,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "#9ca3af",
                marginTop: 0,
                marginBottom: 8,
              }}
            >
              {error.name || "Error"}
            </p>
            <p
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 14,
                color: "#dc2626",
                margin: 0,
                wordBreak: "break-word",
              }}
            >
              {error.message || "Neznámá chyba bez popisu."}
            </p>
            {error.digest ? (
              <p
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "#9ca3af",
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                digest: {error.digest}
              </p>
            ) : null}
            {error.stack ? (
              <pre
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "#f3f4f6",
                  borderRadius: 8,
                  fontSize: 11,
                  overflow: "auto",
                  maxHeight: 240,
                  whiteSpace: "pre-wrap",
                  color: "#374151",
                }}
              >
                {error.stack}
              </pre>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                background: "linear-gradient(90deg, #f97316, #f43f5e)",
                color: "white",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Zkusit znovu
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
                color: "#111827",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Domovská stránka
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
