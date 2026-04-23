-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================
-- Block all access from the anonymous and authenticated PostgREST
-- roles to our tables. The app uses Prisma exclusively via the
-- pooled `postgres` user, which has the BYPASSRLS attribute and is
-- unaffected by these policies.
--
-- Without these statements, anyone holding the public anon key
-- (NEXT_PUBLIC_SUPABASE_ANON_KEY, exposed in the browser bundle)
-- could read, modify or delete every row through Supabase's REST
-- endpoint at https://<project>.supabase.co/rest/v1/<table>.
--
-- Strategy: enable RLS on every table, do NOT add any policies.
-- An RLS-enabled table with zero policies denies all operations to
-- non-bypass roles.
-- ============================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs      ENABLE ROW LEVEL SECURITY;

-- Explicit revoke of any prior grants to anon/authenticated to make
-- sure no ambient permissions exist.
REVOKE ALL ON public.profiles        FROM anon, authenticated;
REVOKE ALL ON public.categories      FROM anon, authenticated;
REVOKE ALL ON public.subcategories   FROM anon, authenticated;
REVOKE ALL ON public.places          FROM anon, authenticated;
REVOKE ALL ON public.place_photos    FROM anon, authenticated;
REVOKE ALL ON public.discount_codes  FROM anon, authenticated;
REVOKE ALL ON public.drafts          FROM anon, authenticated;
REVOKE ALL ON public.suggestions     FROM anon, authenticated;
REVOKE ALL ON public.audit_logs      FROM anon, authenticated;
