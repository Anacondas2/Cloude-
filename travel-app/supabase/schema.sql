-- ════════════════════════════════════════════
--  Trewel — Supabase schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════

create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 80),
  countries  jsonb not null,
  public     boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);

-- ── Row Level Security ──
alter table public.submissions enable row level security;

-- Everyone can READ public submissions
drop policy if exists "public read" on public.submissions;
create policy "public read"
  on public.submissions for select
  using (public = true);

-- Anyone (anon) can INSERT a public submission
drop policy if exists "anon insert" on public.submissions;
create policy "anon insert"
  on public.submissions for insert
  with check (public = true);

-- No UPDATE / DELETE policies → frontend cannot edit or delete. ✅
