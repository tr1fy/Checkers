-- ============================================================
-- Checkers Platform — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  city text,
  rating integer default 1000 not null,
  games_played integer default 0 not null,
  games_won integer default 0 not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Profiles visible to all"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Games history
create table public.games (
  id uuid default gen_random_uuid() primary key,
  player1_id uuid references public.profiles(id) on delete set null,
  player2_id uuid references public.profiles(id) on delete set null,
  winner_id uuid references public.profiles(id) on delete set null,
  moves jsonb default '[]'::jsonb,
  game_type text not null check (game_type in ('vs_ai', 'local', 'multiplayer')),
  ai_difficulty text check (ai_difficulty in ('easy', 'medium', 'hard')),
  duration_seconds integer,
  created_at timestamptz default now() not null,
  ended_at timestamptz
);

alter table public.games enable row level security;

create policy "Games viewable by participants"
  on public.games for select
  using (
    auth.uid() = player1_id or
    auth.uid() = player2_id or
    game_type != 'multiplayer'
  );

create policy "Players can insert games"
  on public.games for insert with check (auth.uid() = player1_id);

create policy "Players can update their games"
  on public.games for update
  using (auth.uid() = player1_id or auth.uid() = player2_id);

-- Multiplayer rooms
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  host_id uuid references public.profiles(id) on delete cascade,
  guest_id uuid references public.profiles(id) on delete set null,
  status text default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  game_state jsonb,
  host_player integer default 1 check (host_player in (1, 2)),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.rooms enable row level security;

create policy "Rooms viewable by everyone"
  on public.rooms for select using (true);

create policy "Anyone can create rooms"
  on public.rooms for insert with check (true);

create policy "Players can update rooms"
  on public.rooms for update
  using (true);

-- Enable Supabase Realtime for rooms
alter publication supabase_realtime add table public.rooms;

-- ============================================================
-- Indexes for performance
-- ============================================================
create index idx_profiles_rating on public.profiles(rating desc);
create index idx_profiles_city on public.profiles(city);
create index idx_rooms_code on public.rooms(code);
create index idx_rooms_status on public.rooms(status);
create index idx_games_player1 on public.games(player1_id);
create index idx_games_player2 on public.games(player2_id);
