-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  country text,
  role text default 'buyer' check (role in ('buyer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  sku text unique not null,
  name_en text not null,
  description text,
  base_price_inr numeric not null,
  category text not null,
  stock_qty integer not null default 0,
  images text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id), -- Nullable for guest checkout (if we support it later)
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED')),
  total_inr numeric not null,
  display_currency text not null,
  total_display_currency numeric not null,
  gateway text check (gateway in ('stripe', 'paypal', 'razorpay')),
  payment_intent_id text,
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  price_inr numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  gateway text not null,
  amount numeric not null,
  currency text not null,
  status text not null,
  raw_response jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Shipments table
create table public.shipments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  courier text,
  tracking_number text,
  status text not null default 'PENDING',
  estimated_delivery date,
  events jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;

-- Policies for public.users
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- Policies for public.products
create policy "Anyone can view products" on public.products for select using (true);
create policy "Only admins can modify products" on public.products using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Policies for public.orders
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert their own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can view all orders" on public.orders for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can update orders" on public.orders for update using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Same logic for order_items, shipments, etc. (Simplified here for MVP)
create policy "Users view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users insert own order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Trigger to automatically create a public.user when auth.user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
