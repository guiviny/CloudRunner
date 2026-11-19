import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { Logo } from '../../components/Logo'
import { useProgress } from '../../lib/progress'
import { toDay, visibleStreak } from '../../lib/streak'
import { NAME_MAX } from '../../lib/account'
import { linkGoogle, signOut, updateDisplayName } from '../../lib/sync'
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
      {auth.enabled && auth.user && (
        <AccountMenu isAnonymous={auth.isAnonymous} name={auth.displayName} avatarUrl={auth.avatarUrl} />
      )}
    </header>
  )
}

function AccountMenu({
  isAnonymous,
  name,
  avatarUrl,
}: {
  isAnonymous: boolean
  name: string | null
  avatarUrl: string | null
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const toggle = () => {
    setEditing(false)
    setConfirmExit(false)
    setError(null)
    setOpen(!open)
  }

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (isAnonymous)
    return (
      <button
        type="button"
        title="Entrar com Google e salvar seu progresso"
        onClick={() => void linkGoogle()}
        className="btn-3d border-blue-dark bg-blue px-3 py-1 text-xs uppercase tracking-wider text-on-neon"
      >
        Entrar
      </button>
    )

  const shown = name ?? 'Aluno'
  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const err = await updateDisplayName(draft)
    setSaving(false)
    setError(err)
    if (!err) setEditing(false)
  }
  const item = 'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Conta de ${shown}`}
        onClick={toggle}
        className="flex items-center gap-2 rounded-full border-2 border-line p-0.5 pr-0.5 transition-colors hover:border-blue sm:pr-3"
      >
        <Avatar url={avatarUrl} name={shown} />
        <span className="hidden max-w-32 truncate text-xs text-ink sm:inline">{shown}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl border-2 border-line bg-surface p-2 font-sans font-bold shadow-[0_6px_0_var(--color-locked-dark)]"
        >
          <div className="flex items-center gap-3 border-b-2 border-line px-3 pt-1 pb-3">
            <Avatar url={avatarUrl} name={shown} />
            <span className="truncate font-display text-sm font-extrabold text-ink">{shown}</span>
          </div>
          {editing ? (
            <form onSubmit={(e) => void save(e)} className="flex flex-col gap-2 p-2">
              <label className="text-xs uppercase tracking-wider text-muted" htmlFor="display-name">
                Seu nome no app
              </label>
              <input
                id="display-name"
                autoFocus
                value={draft}
                maxLength={NAME_MAX}
                onChange={(e) => setDraft(e.target.value)}
                className="rounded-lg border-2 border-line bg-bg px-2 py-1.5 text-sm text-ink outline-none focus:border-blue"
              />
              {error && (
                <p role="alert" className="text-xs text-red">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-3d flex-1 border-green-dark bg-green py-1.5 text-xs text-on-neon disabled:opacity-60"
                >
                  {saving ? 'Salvando…' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setError(null)
                  }}
                  className="flex-1 rounded-xl border-2 border-line py-1.5 text-xs text-muted hover:border-blue"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col pt-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDraft(name ?? '')
                  setConfirmExit(false)
                  setEditing(true)
                }}
                className={`${item} text-ink`}
              >
                ✏️ Editar nome
              </button>
              {confirmExit ? (
                <div className="flex flex-col gap-2 px-3 py-2">
                  <p className="text-xs text-muted">Sair desta conta? Seu progresso continua salvo nela.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        void signOut()
                      }}
                      className="btn-3d flex-1 border-red-dark bg-red py-1.5 text-xs text-on-neon"
                    >
                      Sair
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmExit(false)}
                      className="flex-1 rounded-xl border-2 border-line py-1.5 text-xs text-muted hover:border-blue"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setConfirmExit(true)}
                  className={`${item} text-red`}
                >
                  ↪ Sair
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) return <img src={url} alt="" referrerPolicy="no-referrer" className="size-7 rounded-full" />
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-locked text-xs text-blue">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
