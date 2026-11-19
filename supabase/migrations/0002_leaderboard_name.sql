-- Ao vincular o Google a um anônimo (linkIdentity) o nome e a foto ficam só em auth.identities.
-- O ranking passa a usar a identidade como reserva, e corta o nome: o user_metadata é editável pelo aluno.
create or replace function public.leaderboard(lim integer default 50)
returns table (rank bigint, display_name text, avatar_url text, xp integer, correct integer, is_me boolean)
language sql stable security definer set search_path = '' as $$
  select
    row_number() over (order by p.xp desc, p.correct desc, p.updated_at),
    coalesce(
      left(nullif(btrim(coalesce(
        u.raw_user_meta_data ->> 'full_name',
        u.raw_user_meta_data ->> 'name',
        g.identity_data ->> 'full_name',
        g.identity_data ->> 'name'
      )), ''), 30),
      'Aluno'
    ),
    coalesce(u.raw_user_meta_data ->> 'avatar_url', g.identity_data ->> 'avatar_url', g.identity_data ->> 'picture'),
    p.xp,
    p.correct,
    p.user_id = (select auth.uid())
  from public.progress p
  join auth.users u on u.id = p.user_id
  left join lateral (
    select i.identity_data from auth.identities i
    where i.user_id = u.id and i.provider = 'google'
    limit 1
  ) g on true
  where not u.is_anonymous and p.xp > 0
  order by p.xp desc, p.correct desc, p.updated_at
  limit least(greatest(lim, 1), 100);
$$;

-- O app sempre tem sessão (anônima ou Google), então só o papel authenticated precisa chamar.
revoke execute on function public.leaderboard(integer) from public, anon;
grant execute on function public.leaderboard(integer) to authenticated;
