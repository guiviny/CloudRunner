import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Logo } from '../../components/Logo'
import { useProgress } from '../../lib/progress'
import { toDay, visibleStreak } from '../../lib/streak'
import { linkGoogle, signOut } from '../../lib/sync'
import { useAuth } from '../../lib/useAuth'

export function TopBar() {
  const { xp, gems, streak, lastActiveDay } = useProgress()
  // Data lida uma vez na montagem: o render fica puro e a barra remonta a cada troca de página.
  const [today] = useState(() => toDay(new Date()))
  const shownStreak = visibleStreak(streak, lastActiveDay, today)
  const onHome = useLocation().pathname === '/'
  const auth = useAuth()
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-line bg-bg/80 px-4 py-3 font-display font-extrabold backdrop-blur">
      <span className="flex items-center gap-2 text-ink">
        {!onHome && (
          <Link to="/" className="hidden sm:inline-block">
            <Logo size="sm" />
          </Link>
        )}
        <span title="Seção AWS" className="rounded-md bg-[#232F3E] px-1.5 text-xs text-[#FF9900]">
          aws
        </span>
      </span>
      {!onHome && (
        <Link
          to="/"
          className="rounded-lg border-2 border-line px-2 py-0.5 text-xs uppercase tracking-wider text-blue transition-colors hover:border-blue"
        >
          ☰ Menu
        </Link>
      )}
      <span title="Ofensiva" className={`flex items-center gap-1 ${shownStreak ? 'text-orange' : 'text-muted'}`}>
        🔥 {shownStreak}
      </span>
      <span title="Gemas" className="flex items-center gap-1 text-blue">
        💎 {gems}
      </span>
      <span title="XP" className="flex items-center gap-1 text-gold">
        ⚡ {xp} XP
      </span>
      {auth.enabled && auth.user && <AccountButton isAnonymous={auth.isAnonymous} name={auth.displayName} />}
    </header>
  )
}

function AccountButton({ isAnonymous, name }: { isAnonymous: boolean; name: string | null }) {
  const cls =
    'rounded-lg border-2 border-line px-2 py-0.5 text-xs uppercase tracking-wider transition-colors hover:border-blue'
  if (isAnonymous)
    return (
      <button
        type="button"
        title="Salvar o progresso na sua conta Google"
        onClick={() => void linkGoogle()}
        className={`${cls} text-blue`}
      >
        Salvar
      </button>
    )
  return (
    <button
      type="button"
      title={`Conectado como ${name ?? 'aluno'}. Clique para sair.`}
      onClick={() => void signOut()}
      className={`${cls} text-muted`}
    >
      Sair
    </button>
  )
}
