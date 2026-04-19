import { NextResponse, type NextRequest } from "next/server";

/**
 * Receives uncaught browser errors from a small script in the root layout
 * and dumps them to the Vercel runtime log so we can debug
 * client-only crashes that don't reach the React error boundary.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.error("[client-error]", JSON.stringify(body));
  } catch (e) {
    console.error("[client-error] failed to parse body", e);
  }
  return NextResponse.json({ ok: true });
}
