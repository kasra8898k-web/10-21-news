-- =====================================================
-- 10.21 News - Supabase Database Setup
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  username text unique not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  banned boolean default false,
  can_comment boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- 2. NEWS TABLE
create table public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  excerpt text default '',
  category text not null default 'عمومی',
  image text default '',
  is_important boolean default false,
  is_breaking boolean default false,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.news enable row level security;

-- 3. TASKS TABLE
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  excerpt text default '',
  category text not null default 'عمومی',
  image text default '',
  is_important boolean default false,
  is_breaking boolean default false,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;

-- 4. COMMENTS TABLE
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null check (entity_type in ('news', 'tasks')),
  entity_id uuid not null,
  user_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  approved boolean default false,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- PROFILES: anyone authenticated can read; only owner or admin can update
create policy "Profiles: readable by authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Profiles: insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Profiles: update own or admin" on public.profiles
  for update using (auth.uid() = id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- NEWS: readable by all authenticated; insert/update/delete by admin only
create policy "News: readable by authenticated" on public.news
  for select using (auth.role() = 'authenticated');

create policy "News: admin can insert" on public.news
  for insert with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "News: admin can update" on public.news
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "News: admin can delete" on public.news
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- TASKS: readable by all authenticated; insert/update/delete by admin only
create policy "Tasks: readable by authenticated" on public.tasks
  for select using (auth.role() = 'authenticated');

create policy "Tasks: admin can insert" on public.tasks
  for insert with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Tasks: admin can update" on public.tasks
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Tasks: admin can delete" on public.tasks
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- COMMENTS: readable by authenticated; owner can insert; admin can manage
create policy "Comments: readable by authenticated" on public.comments
  for select using (auth.role() = 'authenticated');

create policy "Comments: authenticated can insert" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Comments: admin can update" on public.comments
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Comments: admin can delete" on public.comments
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'username'),
    coalesce(new.raw_user_meta_data->>'username', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- INDEXES for performance
-- =====================================================
create index idx_news_created at (created_at desc);
create index idx_news_category on (category);
create index idx_tasks_created at (created_at desc);
create index idx_tasks_category on (category);
create index idx_comments_entity on (entity_type, entity_id);
create index idx_comments_approved on (approved);
create index idx_profiles_username on (username);

-- =====================================================
-- SETUP COMPLETE
-- After running this, create your admin user:
-- 1. Register a new account via the website
-- 2. Run: UPDATE public.profiles SET role = 'admin' WHERE username = 'your_username';
-- =====================================================
