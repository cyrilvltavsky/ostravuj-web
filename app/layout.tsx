import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ostravuj — Objevuj nejlepší místa v Ostravě",
  description:
    "Kurátorský průvodce nejlepšími místy v Ostravě. Gastro, aktivity, rande, místa zdarma.",
  metadataBase: new URL("https://ostravuj.cz"),
  openGraph: {
    title: "Ostravuj",
    description: "Objevuj nejlepší místa v Ostravě.",
    url: "https://ostravuj.cz",
    siteName: "Ostravuj",
    locale: "cs_CZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className={inter.variable}>
      <head>
        {/* Tiny client-side error reporter — pipes uncaught browser errors
            to /api/client-error so we can see them in Vercel logs. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                function send(payload){
                  try {
                    fetch('/api/client-error', {
                      method:'POST',
                      headers:{'content-type':'application/json'},
                      body: JSON.stringify(payload),
                      keepalive: true,
                    });
                  } catch(_){}
                }
                window.addEventListener('error', function(e){
                  send({
                    kind:'error',
                    message: e.message,
                    filename: e.filename,
                    lineno: e.lineno,
                    colno: e.colno,
                    stack: e.error && e.error.stack,
                    url: location.href,
                    ua: navigator.userAgent,
                  });
                });
                window.addEventListener('unhandledrejection', function(e){
                  var r = e.reason || {};
                  send({
                    kind:'unhandledrejection',
                    message: r.message || String(r),
                    stack: r.stack,
                    name: r.name,
                    url: location.href,
                    ua: navigator.userAgent,
                  });
                });
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
