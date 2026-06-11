-- ─────────────────────────────────────────────────────────────
--  Migración inicial — seguridad por defecto
--  Regla de oro: RLS habilitado en TODAS las tablas del esquema public.
--  Con RLS activo y sin políticas, el acceso queda denegado por defecto.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- Habilitar Row Level Security (deny-by-default).
alter table public.profiles enable row level security;

-- Forzar RLS incluso para el owner de la tabla.
alter table public.profiles force row level security;

-- Cada usuario puede LEER su propia fila.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Cada usuario puede ACTUALIZAR su propia fila.
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Nota: NO definimos política de INSERT/DELETE para el rol authenticated.
-- La fila se crea automáticamente vía trigger (abajo). Definí políticas
-- adicionales sólo cuando una funcionalidad concreta lo requiera.

-- ─────────────────────────────────────────────────────────────
--  Crear el perfil automáticamente al registrarse un usuario.
--  SECURITY DEFINER + search_path fijo para evitar secuestro de funciones.
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
