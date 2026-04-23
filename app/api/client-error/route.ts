import { NextResponse, type NextRequest } from "next/server";

/**
 * Receives uncaught browser errors from a small script in the root layout
 * and dumps them to the Vercel runtime log so we can debug client-only
 * crashes that don't reach the React error boundary.
 *
 * Hardening:
 * - Same-origin only (Origin / Referer must match the request host) so
 *   the endpoint can't be abused as a public log-spam target by other
 *   sites with curl, etc.
 * - Body size cap (32 KB) so a long stack trace can't fill our logs.
 * - JSON parse failure returns 200 silently so the browser doesn't
 *   spam retries.
 */
export async function POST(req: NextRequest) {
  // Same-origin guard
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (host) {
    const ok =
      (origin && originHostMatches(origin, host)) ||
      (referer && originHostMatches(referer, host));
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  // Body size cap
  const lenHeader = req.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > 32 * 1024) {
    return NextResponse.json({ ok: false, reason: "too-large" }, { status: 413 });
  }

  try {
    const body = await req.json();
    // Trim long fields to avoid log pollution
    const safe = trimStrings(body, 4_000);
    console.error("[client-error]", JSON.stringify(safe));
  } catch (e) {
    console.error("[client-error] failed to parse body", e);
  }
  return NextResponse.json({ ok: true });
}

function originHostMatches(originOrUrl: string, host: string): boolean {
  try {
    const u = new URL(originOrUrl);
    return u.host === host;
  } catch {
    return false;
  }
}

function trimStrings(value: unknown, max: number): unknown {
  if (typeof value === "string")
    return value.length > max ? value.slice(0, max) + "…[trimmed]" : value;
  if (Array.isArray(value)) return value.map((v) => trimStrings(v, max));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = trimStrings(v, max);
    return out;
  }
  return value;
}
