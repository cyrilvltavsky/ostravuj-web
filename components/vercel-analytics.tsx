"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Vercel Web Analytics + Speed Insights, scoped to public traffic only.
 * Admin pageviews and per-page performance samples are dropped before
 * leaving the browser so they don't pollute the report.
 */
export function VercelAnalytics() {
  return (
    <>
      <Analytics
        beforeSend={(event) => {
          // event.url is an absolute URL like https://www.ostravuj.cz/admin/...
          try {
            const u = new URL(event.url);
            if (u.pathname.startsWith("/admin")) return null;
            if (u.pathname.startsWith("/api/")) return null;
            if (u.pathname.startsWith("/auth/")) return null;
          } catch {
            /* leave event alone if URL parsing fails */
          }
          return event;
        }}
      />
      <SpeedInsights
        beforeSend={(event) => {
          try {
            const u = new URL(event.url);
            if (u.pathname.startsWith("/admin")) return null;
          } catch {
            /* keep */
          }
          return event;
        }}
      />
    </>
  );
}
