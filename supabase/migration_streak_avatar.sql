-- Add streak and last_win_date to profiles
alter table public.profiles
  add column if not exists current_streak integer default 0 not null,
  add column if not exists best_streak integer default 0 not null,
  add column if not exists last_win_date date;

-- Storage bucket for avatars (run this too)
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
