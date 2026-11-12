-- Poscura review layer table (already applied to Supabase project "poscura").
create table if not exists public.poscura_review_comments (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.poscura_review_comments enable row level security;
create policy "review read"   on public.poscura_review_comments for select to anon using (true);
create policy "review insert" on public.poscura_review_comments for insert to anon with check (true);
create policy "review update" on public.poscura_review_comments for update to anon using (true) with check (true);
create policy "review delete" on public.poscura_review_comments for delete to anon using (true);
