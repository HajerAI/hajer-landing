-- Repair the five findings captured in Supabase Security Advisor on 2026-08-01.
-- Metadata only: this migration does not change view definitions or table rows.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

alter view public.waitlist_leads
  set (security_invoker = true);

alter view public.waitlist_by_domain
  set (security_invoker = true);

alter view public.waitlist_daily
  set (security_invoker = true);

-- This view exists in production but has never existed in this repository.
-- Repair its execution mode without guessing at, recreating, or dropping it.
alter view if exists public.waitlist_leads_enriched
  set (security_invoker = true);

alter function public.touch_updated_at()
  set search_path = pg_catalog;

commit;
