-- ─────────────────────────────────────────────────────────────
--  Initial migration — secure by default
--  Golden rule: RLS enabled on ALL tables in the public schema.
--  With RLS on and no policies, access is denied by default.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (deny-by-default).
alter table public.profiles enable row level security;

-- Force RLS even for the table owner.
alter table public.profiles force row level security;

-- Each user can READ their own row.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Each user can UPDATE their own row.
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Note: we do NOT define an INSERT/DELETE policy for the authenticated role.
-- The row is created automatically via the trigger (below). Add extra policies
-- only when a concrete feature requires it.

-- ─────────────────────────────────────────────────────────────
--  Create the profile automatically when a user signs up.
--  SECURITY DEFINER + fixed search_path to prevent function hijacking.
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Postgres grants EXECUTE to PUBLIC by default on new functions, which makes
-- any SECURITY DEFINER function in an exposed schema a public endpoint.
-- This is a trigger function (not callable via the Data API), but we revoke
-- anyway as defense in depth.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
