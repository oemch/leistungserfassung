-- Tabelle für Zeiterfassungs-Einträge (Leistungserfassung)
-- In Supabase Dashboard: SQL Editor → New query → einfügen → Run

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time text not null,
  end_time text not null,
  label text not null,
  comment text default '',
  is_billable boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index für Abfragen nach Datum
create index if not exists time_entries_date_idx on public.time_entries (date);

-- Optional: RLS (Row Level Security) – für später, wenn pro User gefiltert wird
-- alter table public.time_entries enable row level security;
