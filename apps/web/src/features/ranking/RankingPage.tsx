import { useEffect, useState } from 'react'
import { selectCorrectAnswers, useProgress } from '../../lib/progress'
import { supabase } from '../../lib/supabase'
import { linkGoogle } from '../../lib/sync'
import { useAuth } from '../../lib/useAuth'
import { TopBar } from '../path/TopBar'

export type RankingRow = {
  rank: number
  display_name: string
  avatar_url: string | null
  xp: number
  correct: number
  is_me: boolean
}

type Status = { state: 'loading' } | { state: 'error' } | { state: 'ok'; rows: RankingRow[] }

export function RankingPage() {
  const { enabled, user, isAnonymous } = useAuth()
  const userId = user?.id
  const xp = useProgress((s) => s.xp)
  const correct = useProgress(selectCorrectAnswers)
  const [status, setStatus] = useState<Status>({ state: 'loading' })

  // recarrega quando a sessão muda: o is_me depende de quem está logado
  useEffect(() => {
    if (!supabase || !userId) return
    let active = true
    void supabase.rpc('leaderboard', { lim: 50 }).then(({ data, error }) => {
      if (active) setStatus(error ? { state: 'error' } : { state: 'ok', rows: (data ?? []) as RankingRow[] })
    })
    return () => {
      active = false
    }
  }, [userId])

  return (
    <div className="min-h-screen pb-16">
      <TopBar />
      <main className="mx-auto max-w-xl px-4">
        <header className="pt-10 pb-6 text-center">
          <span className="text-5xl">🏆</span>
          <h1 className="mt-2 text-2xl font-extrabold text-gold">Ranking</h1>
          <p className="mt-1 text-sm font-semibold text-muted">
            XP somado do melhor resultado de cada lição. Desempate: questões acertadas de primeira.
          </p>
        </header>

        {!enabled ? (
          <p className="text-center text-sm font-bold text-muted">O ranking fica disponível na versão publicada.</p>
        ) : (
          <>
            {isAnonymous && (
              <div className="mb-5 rounded-2xl border-2 border-line bg-surface p-4 text-center">
                <p className="text-sm font-bold text-ink">
                  Você tem {xp} XP e {correct} acertos de primeira. Entre com o Google para aparecer no ranking e não
                  perder o progresso.
                </p>
                <button
                  type="button"
                  onClick={() => void linkGoogle()}
                  className="btn-3d mt-3 border-blue-dark bg-blue px-5 py-2 text-sm text-on-neon"
                >
                  Entrar com Google
                </button>
              </div>
            )}
            {status.state === 'loading' && <p className="text-center text-sm font-bold text-muted">Carregando…</p>}
            {status.state === 'error' && (
              <p className="text-center text-sm font-bold text-muted">Não foi possível carregar o ranking agora.</p>
            )}
            {status.state === 'ok' &&
              (status.rows.length === 0 ? (
                <p className="text-center text-sm font-bold text-muted">Ninguém pontuou ainda. Seja o primeiro!</p>
              ) : (
                <ol className="flex flex-col gap-2">
                  {status.rows.map((r) => (
                    <li
                      key={r.rank}
                      aria-current={r.is_me || undefined}
                      className={`flex items-center gap-3 rounded-2xl border-2 bg-surface px-4 py-3 font-display font-extrabold ${r.is_me ? 'border-green' : 'border-line'}`}
                    >
                      <span className="w-8 text-center text-muted">{medal(r.rank)}</span>
                      {r.avatar_url ? (
                        <img src={r.avatar_url} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full" />
                      ) : (
                        <span className="size-8 rounded-full bg-locked" />
                      )}
                      <span className="flex-1 truncate text-ink">
                        {r.display_name}
                        {r.is_me && <span className="ml-2 text-xs text-green">você</span>}
                      </span>
                      <span className="text-gold">⚡ {r.xp}</span>
                    </li>
                  ))}
                </ol>
              ))}
          </>
        )}
      </main>
    </div>
  )
}

const medal = (rank: number) => ['🥇', '🥈', '🥉'][rank - 1] ?? `${rank}º`
