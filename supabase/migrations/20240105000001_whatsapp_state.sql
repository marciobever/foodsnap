-- Create table to store conversation state
create table if not exists public.whatsapp_conversations (
    phone_number text primary key,
    state text not null default 'IDLE', -- IDLE, COACH_FRONT, COACH_SIDE, COACH_BACK, COACH_GOAL
    temp_data jsonb default '{}'::jsonb,
    updated_at timestamp with time zone default now()
);

-- Turn on RLS
alter table public.whatsapp_conversations enable row level security;

-- Allow service role full access
create policy "Service role full access"
    on public.whatsapp_conversations
    for all
    to service_role
    using (true)
    with check (true);

-- Create a bucket for temporary coach uploads if it doesn't exist
insert into storage.buckets (id, name, public)
values ('coach-uploads', 'coach-uploads', true)
on conflict (id) do nothing;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'coach-uploads' );

create policy "Service Role Upload"
  on storage.objects for insert
  with check ( bucket_id = 'coach-uploads' );
