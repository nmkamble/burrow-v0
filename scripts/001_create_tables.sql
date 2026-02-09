-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  university text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text
);

-- Categories are read-only for all users
alter table public.categories enable row level security;
create policy "categories_select_all" on public.categories for select using (true);

-- Seed categories
insert into public.categories (name, slug, icon) values
  ('Calculators', 'calculators', 'calculator'),
  ('Party Decorations', 'party-decorations', 'party-popper'),
  ('Halloween Costumes', 'halloween-costumes', 'shirt'),
  ('Textbooks', 'textbooks', 'book-open'),
  ('Electronics', 'electronics', 'laptop'),
  ('Sports Equipment', 'sports-equipment', 'dumbbell'),
  ('Kitchen Appliances', 'kitchen-appliances', 'cooking-pot'),
  ('Furniture', 'furniture', 'armchair')
on conflict (slug) do nothing;

-- Create items table
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  description text,
  price_per_day numeric(10,2) not null check (price_per_day >= 0),
  location text not null,
  condition text not null check (condition in ('like-new', 'good', 'fair', 'worn')),
  image_url text,
  is_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.items enable row level security;

create policy "items_select_all" on public.items for select using (true);
create policy "items_insert_own" on public.items for insert with check (auth.uid() = owner_id);
create policy "items_update_own" on public.items for update using (auth.uid() = owner_id);
create policy "items_delete_own" on public.items for delete using (auth.uid() = owner_id);

-- Create rental_requests table
create table if not exists public.rental_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  borrower_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.rental_requests enable row level security;

-- Borrowers can see their own requests, owners can see requests for their items
create policy "rental_requests_select_own" on public.rental_requests for select using (auth.uid() = borrower_id or auth.uid() = owner_id);
create policy "rental_requests_insert_borrower" on public.rental_requests for insert with check (auth.uid() = borrower_id);
create policy "rental_requests_update_owner" on public.rental_requests for update using (auth.uid() = owner_id);
create policy "rental_requests_update_borrower_cancel" on public.rental_requests for update using (auth.uid() = borrower_id);

-- Create reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = reviewer_id);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = reviewer_id);
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = reviewer_id);
