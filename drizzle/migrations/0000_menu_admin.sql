create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.assign_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.assign_first_admin();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  description text,
  image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index categories_name_unique on public.categories (lower(trim(name)));
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read categories" on public.categories for select to anon, authenticated using (true);
create policy "admin insert categories" on public.categories for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update categories" on public.categories for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete categories" on public.categories for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();

create table public.menu_articles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  description text,
  price numeric(10,3) not null check (price >= 0),
  image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menu_articles_category_idx on public.menu_articles (category_id, display_order);
grant select on public.menu_articles to anon, authenticated;
grant insert, update, delete on public.menu_articles to authenticated;
grant all on public.menu_articles to service_role;
alter table public.menu_articles enable row level security;
create policy "public read articles" on public.menu_articles for select to anon, authenticated using (true);
create policy "admin insert articles" on public.menu_articles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update articles" on public.menu_articles for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete articles" on public.menu_articles for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger articles_touch before update on public.menu_articles for each row execute function public.touch_updated_at();

create policy "public read menu images" on storage.objects for select using (bucket_id = 'menu-images');
create policy "admin upload menu images" on storage.objects for insert to authenticated with check (bucket_id = 'menu-images' and public.has_role(auth.uid(),'admin'));
create policy "admin update menu images" on storage.objects for update to authenticated using (bucket_id = 'menu-images' and public.has_role(auth.uid(),'admin'));
create policy "admin delete menu images" on storage.objects for delete to authenticated using (bucket_id = 'menu-images' and public.has_role(auth.uid(),'admin'));