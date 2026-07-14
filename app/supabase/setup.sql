-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query → Run).
-- It creates the one table HomeQuest needs for cross-device sync.

create table if not exists households (
  code text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table households enable row level security;

-- There's no login in this app — the 6-character household code is the
-- only thing gating access to a household's data (like a shared link).
-- These policies let anyone holding the public "anon" API key read/write
-- any row; treat your household code the way you'd treat a shared link.
create policy if not exists "anon can read households"
  on households for select
  to anon
  using (true);

create policy if not exists "anon can create households"
  on households for insert
  to anon
  with check (true);

create policy if not exists "anon can update households"
  on households for update
  to anon
  using (true);

-- Enables realtime UPDATE notifications so both phones see changes live.
alter publication supabase_realtime add table households;
