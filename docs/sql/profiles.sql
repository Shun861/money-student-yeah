-- Supabase: public.profiles schema, RLS and trigger
-- Run in Supabase SQL editor (adjust schema/owner as needed)

-- 1) Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Minimal profile fields for onboarding baseline
  display_name text,
  grade text,
  is_parent_dependent boolean,
  employer_size text check (employer_size in ('small','medium','large','unknown')),
  default_hourly_wage integer,
  bracket integer check (bracket in (103,130,150))
);

-- 2) Timestamp update trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- 3) RLS
alter table public.profiles enable row level security;

-- Policy: users can select their own row
create policy "Profiles are selectable by owner"
  on public.profiles for select
  using ( auth.uid() = id );

-- Policy: users can insert their own row
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Policy: users can update their own row
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- 4) Trigger to auto-create profile after signup
-- Uses auth.users; create a function that inserts a row into profiles on new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- If not exists, bind to auth.users table
-- Note: On Supabase, this trigger is commonly created in the auth schema via SQL editor
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
