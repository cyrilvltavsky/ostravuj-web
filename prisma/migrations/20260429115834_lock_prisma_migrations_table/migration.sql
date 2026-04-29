-- ============================================================
-- LOCK DOWN _prisma_migrations TABLE
-- ============================================================
-- Supabase advisor flagged ERROR rls_disabled_in_public on
-- public._prisma_migrations: anon REST endpoint could read the
-- migration history (names + checksums + logs) — schema leak.
--
-- Prisma creates this table automatically and the previous bulk
-- security migration (20260423071615_enable_rls_security) didn't
-- include it. Same posture as every other table in the project:
-- RLS enabled with zero policies → denies all to anon /
-- authenticated. Prisma's pooled `postgres` user keeps working
-- (BYPASSRLS attribute).
--
-- Idempotent: re-running ALTER TABLE ENABLE ROW LEVEL SECURITY
-- on an already-enabled table is a no-op. REVOKE on already-
-- revoked grants is also a no-op.
-- ============================================================

ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public._prisma_migrations FROM anon, authenticated;
