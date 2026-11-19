-- Progresso dos alunos e ranking. Aplicar no SQL Editor do Supabase ou com `supabase db push`.
-- A chave publicável vai no bundle do navegador: toda a segurança está nas policies abaixo.

create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- estado do store do app (completed, openedChests, studiedTopics, streak, lastActiveDay)
  data jsonb not null,
  -- desnormalizados para o ranking. O XP é calculado no cliente: os limites só barram valores absurdos.
  xp integer not null check (xp between 0 and 100000),
  correct integer not null check (correct between 0 and 10000),
  updated_at timestamptz not null default now(),
  constraint progress_data_size check (pg_column_size(data) < 200000)
);

alter table public.progress enable row level security;

create policy "ler o próprio progresso" on public.progress
  for select to authenticated using (user_id = (select auth.uid()));
create policy "criar o próprio progresso" on public.progress
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "atualizar o próprio progresso" on public.progress
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();

-- Ranking público: só quem vinculou uma conta (anônimos ficam de fora) e só nome, avatar e pontuação.
-- security definer porque lê auth.users, que o cliente não acessa; nunca retorna id nem e-mail.
create function public.leaderboard(lim integer default 50)
returns table (rank bigint, display_name text, avatar_url text, xp integer, correct integer, is_me boolean)
language sql stable security definer set search_path = '' as $$
  select
    row_number() over (order by p.xp desc, p.correct desc, p.updated_at),
    coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', 'Aluno'),
    u.raw_user_meta_data ->> 'avatar_url',
    p.xp,
    p.correct,
    p.user_id = (select auth.uid())
  from public.progress p
  join auth.users u on u.id = p.user_id
  where not u.is_anonymous and p.xp > 0
  order by p.xp desc, p.correct desc, p.updated_at
  limit least(greatest(lim, 1), 100);
$$;

revoke execute on function public.leaderboard(integer) from public;
grant execute on function public.leaderboard(integer) to anon, authenticated;
