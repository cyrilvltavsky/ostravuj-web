import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Přihlášení — Ostravuj Admin",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; sent?: string; error?: string }>;
}) {
  const { from, sent, error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-[420px]">
        <Link
          href="/"
          className="mb-8 inline-block text-gradient text-2xl font-extrabold tracking-tight"
        >
          Ostravuj
        </Link>

        <div className="rounded-card-xl border border-line bg-card p-8 shadow-soft-md">
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-ink">
            Přihlášení do administrace
          </h1>
          <p className="mb-6 text-sm text-ink-muted">
            Zadejte svůj e-mail a my vám pošleme přihlašovací odkaz.
          </p>

          {sent ? (
            <div className="rounded-xl border border-mint-deep/20 bg-mint/30 px-4 py-3 text-sm font-medium text-mint-deep">
              Odkaz odeslán! Zkontrolujte si e-mailovou schránku.
            </div>
          ) : (
            <LoginForm from={from} initialError={error} />
          )}
        </div>
      </div>
    </main>
  );
}
