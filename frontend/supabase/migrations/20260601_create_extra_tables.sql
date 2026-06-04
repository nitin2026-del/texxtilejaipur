-- Migration: create extra tables for luxury fashion site
-- Wishlist (optional server‑side)
create table if not exists public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid not null,
  created_at timestamp with time zone default now()
);

-- Orders
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending',
  total numeric not null,
  items jsonb not null,
  created_at timestamp with time zone default now()
);

-- Contact requests
create table if not exists public.contact_requests (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Wholesale inquiries
create table if not exists public.wholesale_inquiries (
  id uuid default uuid_generate_v4() primary key,
  company text not null,
  email text not null,
  phone text,
  details text not null,
  created_at timestamp with time zone default now()
);

-- Blog posts (optional)
create table if not exists public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  content_md text not null,
  published_at timestamp with time zone default now()
);
