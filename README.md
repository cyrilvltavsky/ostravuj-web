# Ostravuj

Kurátorský web o nejlepších místech v Ostravě.

**Produkce:** https://ostravuj.cz

## Tech stack

- **Next.js 15** — App Router, React 19, TypeScript
- **Tailwind CSS 3** — design system
- **Supabase** — Postgres 17, Auth (2FA), Storage, RLS
- **Prisma 6** — type-safe DB access
- **Resend + React Email** — transakční e-maily (pozvánky editorů)
- **Vercel** — hosting, auto-deploy z `main` branche

**Node:** 22.22.1 (viz `.nvmrc`) — `nvm use`
**Package manager:** pnpm 10+

## Lokální vývoj

```bash
nvm use                     # Node 22.22.1
pnpm install
cp .env.example .env.local  # vyplň klíče ze Supabase + Resendu
pnpm db:migrate             # aplikuj Prisma migrace
pnpm dev                    # http://localhost:3000
```

## Scripts

| Script | Popis |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | produkční build (`prisma generate` + `next build`) |
| `pnpm start` | spustí produkční build |
| `pnpm lint` | ESLint |
| `pnpm db:migrate` | vytvoř + aplikuj migraci (dev) |
| `pnpm db:deploy` | aplikuj migrace (produkce) |
| `pnpm db:studio` | Prisma Studio (GUI pro DB) |
| `pnpm db:push` | ad-hoc sync schematu (bez migrace, jen dev) |

## Struktura

```
app/              Next.js App Router (routes, layouts, Server Components)
lib/supabase/     Supabase klienti (browser + server)
lib/prisma.ts     Prisma singleton
prisma/           Databázové schéma a migrace
public/           Statické assety
```

## Deployment

Každý commit do `main` → automatický build na Vercelu → nasazení na https://ostravuj.cz.

Před prvním deployem nastav na Vercelu environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

## Ostravuj ekosystém

- **ostravuj-web** — tento repo (hlavní web + admin)
- **ostravuj-admin** — *plánováno* (separátní admin panel, zatím součást webu)
- **ostravuj-mobile** — *plánováno* (iOS / Android)

## Licence

All rights reserved © 2026 Cyril Vltavský.
