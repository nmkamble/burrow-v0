-- Clean schema setup: creates all tables, RLS policies, triggers, and categories
-- Does NOT include any placeholder/seed data

-- 1. Profiles table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  full_name text,
  bio text,
  phone_number text,
  avatar_url text,
  location text,
  university text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 2. Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text
);

alter table public.categories enable row level security;
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories for select using (true);

-- Seed default categories
insert into public.categories (name, slug, icon) values
  ('Calculators', 'calculators', 'Calculator'),
  ('Party Decorations', 'party-decorations', 'PartyPopper'),
  ('Halloween Costumes', 'halloween-costumes', 'Shirt'),
  ('Textbooks', 'textbooks', 'BookOpen'),
  ('Electronics', 'electronics', 'Laptop'),
  ('Sports Equipment', 'sports-equipment', 'Dumbbell'),
  ('Kitchen Appliances', 'kitchen-appliances', 'ChefHat'),
  ('Furniture', 'furniture', 'Armchair'),
  ('Tools', 'tools', 'Wrench'),
  ('Outdoor', 'outdoor', 'TreePine'),
  ('Other', 'other', 'Package')
on conflict (slug) do nothing;

-- 3. Items table
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id),
  title text not null,
  description text,
  price_per_day numeric(10,2) not null default 0,
  location text not null,
  condition text not null default 'good',
  image_url text,
  is_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.items enable row level security;

drop policy if exists "items_select_all" on public.items;
create policy "items_select_all" on public.items for select using (true);
drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own" on public.items for insert with check (auth.uid() = owner_id);
drop policy if exists "items_update_own" on public.items;
create policy "items_update_own" on public.items for update using (auth.uid() = owner_id);
drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own" on public.items for delete using (auth.uid() = owner_id);

-- 4. Rental requests table
create table if not exists public.rental_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  borrower_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  message text,
  owner_response text,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.rental_requests enable row level security;

drop policy if exists "rental_requests_select_own" on public.rental_requests;
create policy "rental_requests_select_own" on public.rental_requests
  for select using (auth.uid() = borrower_id or auth.uid() = owner_id);
drop policy if exists "rental_requests_insert_own" on public.rental_requests;
create policy "rental_requests_insert_own" on public.rental_requests
  for insert with check (auth.uid() = borrower_id);
drop policy if exists "rental_requests_update_owner" on public.rental_requests;
create policy "rental_requests_update_owner" on public.rental_requests
  for update using (auth.uid() = owner_id);
drop policy if exists "rental_requests_update_borrower" on public.rental_requests;
create policy "rental_requests_update_borrower" on public.rental_requests
  for update using (auth.uid() = borrower_id);

-- 5. Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews for select using (true);
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = reviewer_id);
drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = reviewer_id);
drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = reviewer_id);
