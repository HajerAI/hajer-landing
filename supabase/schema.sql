-- ============================================================================
-- HAJER — waitlist schema
--
-- Run once against the project (SQL editor, or via the Supabase MCP server).
-- Idempotent: safe to re-run.
--
-- SECURITY MODEL
-- RLS is ON with NO policies. That is deliberate and is the whole design: with
-- RLS enabled and no policy granting access, the anon and authenticated keys
-- can do nothing at all with this table. Only `service_role` bypasses RLS, and
-- that key lives exclusively in the Vercel server environment — it is never
-- shipped to the browser. A leaked anon key therefore exposes zero signups.
-- ============================================================================

create extension if not exists "pgcrypto";

-- A previous prototype used `waitlist_leads` as the base table. The current
-- schema reserves that name for the triage view below. Preserve the prototype
-- table, including any rows it may contain, under a dated legacy name before
-- creating the canonical `waitlist` table. Re-running this schema is safe:
-- after the first migration `waitlist_leads` is a view, so this block is a
-- no-op.
do $$
declare
  existing_kind "char";
begin
  select c.relkind
    into existing_kind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'waitlist_leads';

  if existing_kind = 'r' then
    if to_regclass('public.waitlist_leads_legacy_20260727') is not null then
      raise exception
        'Cannot preserve public.waitlist_leads: legacy destination already exists';
    end if;

    alter table public.waitlist_leads
      rename to waitlist_leads_legacy_20260727;
  elsif existing_kind is not null and existing_kind <> 'v' then
    raise exception
      'Cannot replace public.waitlist_leads relation kind % with a view',
      existing_kind;
  end if;
end $$;

create table if not exists public.waitlist (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Normalised before insert (trimmed + lowercased) by lib/waitlist/schema.ts.
  -- UNIQUE so a repeat signup enriches the existing row instead of duplicating.
  email         text not null unique,

  -- Generated, not supplied. The single most useful segmentation axis we have:
  -- it answers "is this a company or a gmail" without storing anything extra.
  email_domain  text generated always as (lower(split_part(email, '@', 2))) stored,

  -- All optional. Collected AFTER the email is already safely captured, so a
  -- blank row is still a successful signup.
  company         text,
  role            text,
  trace_platform  text,
  current_model   text,
  candidate_model text,
  deadline        text,
  design_partner  boolean not null default false,

  -- Provenance. `source` distinguishes the hero inline capture from the full
  -- form, so we can see which one actually converts.
  source           text not null default 'site',
  idempotency_key  text,
  referer          text,
  -- Coarse only. We deliberately do NOT store IP or a full user-agent string.
  user_agent       text
);

comment on table  public.waitlist is 'Prelaunch waitlist signups. service_role only.';
comment on column public.waitlist.email_domain is 'Generated from email. Segmentation without extra collection.';
comment on column public.waitlist.design_partner is 'Opted in to design-partner contact.';

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);
create index if not exists waitlist_domain_idx     on public.waitlist (email_domain);
create index if not exists waitlist_partner_idx    on public.waitlist (design_partner) where design_partner;

-- Keep updated_at honest on enrichment.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists waitlist_touch_updated_at on public.waitlist;
create trigger waitlist_touch_updated_at
  before update on public.waitlist
  for each row execute function public.touch_updated_at();

-- RLS on, no policies: anon and authenticated get nothing. service_role bypasses.
alter table public.waitlist enable row level security;

-- ============================================================================
-- Triage views. These are what you actually open in the morning.
-- ============================================================================

-- Earlier prototypes used different view column names. PostgreSQL cannot
-- change a view's output columns with CREATE OR REPLACE, so remove only these
-- derived, row-less relations before rebuilding them from the canonical table.
drop view if exists public.waitlist_by_domain;
drop view if exists public.waitlist_daily;

-- Design partners with a real migration, most recent first. The queue.
create or replace view public.waitlist_leads
with (security_invoker = true) as
select
  created_at,
  email,
  email_domain,
  company,
  role,
  current_model,
  candidate_model,
  deadline,
  trace_platform
from public.waitlist
where design_partner
   or deadline is not null
   or candidate_model is not null
order by created_at desc;

-- Which companies are showing up, and how many from each. Free-mail domains
-- are grouped out so they do not drown the signal.
create or replace view public.waitlist_by_domain
with (security_invoker = true) as
select
  email_domain,
  count(*)                                  as signups,
  count(*) filter (where design_partner)    as design_partners,
  min(created_at)                           as first_seen,
  max(created_at)                           as last_seen
from public.waitlist
where email_domain not in (
  'gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com',
  'proton.me','protonmail.com','me.com','live.com','aol.com'
)
group by email_domain
order by signups desc, last_seen desc;

-- Daily signups, and how many arrived with migration detail attached.
create or replace view public.waitlist_daily
with (security_invoker = true) as
select
  date_trunc('day', created_at)::date        as day,
  count(*)                                   as signups,
  count(*) filter (where company is not null
                      or candidate_model is not null) as enriched,
  count(*) filter (where design_partner)     as design_partners
from public.waitlist
group by 1
order by 1 desc;
