create table if not exists runs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  spec jsonb,
  result jsonb
);
