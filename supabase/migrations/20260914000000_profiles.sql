-- One profile per auth user, linking them to their organization.
-- Rows are created service-side on signup (service-role bypasses RLS);
-- users can only read/update their own row.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index profiles_organization_id_idx on public.profiles (organization_id);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);
