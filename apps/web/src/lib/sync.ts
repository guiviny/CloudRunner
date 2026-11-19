import type { User } from '@supabase/supabase-js'
import { fitName, nameError, profileOf } from './account'
import { mergeProgress } from './mergeProgress'
import { progressData, selectCorrectAnswers, useProgress, type ProgressData } from './progress'
import { supabase } from './supabase'

const PUSH_DELAY_MS = 1500

// Mantém o store local e a linha do aluno em `progress` iguais.
// O localStorage continua sendo a fonte: sem rede, o app segue funcionando e envia depois.
export function startSync() {
  const client = supabase
  if (!client) return
  let userId: string | null = null
  // só envia depois de mesclar com o servidor, senão o upsert apagaria o progresso de outro aparelho
  let pulled = false
  let timer: ReturnType<typeof setTimeout> | undefined

  const push = async () => {
    if (!userId || !pulled || !navigator.onLine) return
    const data = progressData(useProgress.getState())
    await client.from('progress').upsert({ user_id: userId, data, xp: data.xp, correct: selectCorrectAnswers(data) })
  }

  const pull = async (id: string) => {
    const { data, error } = await client.from('progress').select('data').eq('user_id', id).maybeSingle()
    if (error || id !== userId) return
    if (data)
      useProgress.getState().hydrate(mergeProgress(progressData(useProgress.getState()), data.data as ProgressData))
    pulled = true
    await push()
  }

  // Copia nome e foto do Google para o user_metadata, que é o que o ranking lê e o aluno edita.
  const fillProfile = async (user: User) => {
    if (user.is_anonymous || user.user_metadata?.full_name) return
    const { name, avatarUrl } = profileOf(user)
    if (name) await client.auth.updateUser({ data: { full_name: fitName(name), avatar_url: avatarUrl } })
  }

  client.auth.onAuthStateChange((_event, session) => {
    const user = session?.user
    if (user) setTimeout(() => void fillProfile(user))
    const id = user?.id ?? null
    if (id === userId) return
    userId = id
    pulled = false
    // o callback não pode esperar outras chamadas do client (trava o lock da sessão)
    if (id) setTimeout(() => void pull(id))
  })

  useProgress.subscribe(() => {
    clearTimeout(timer)
    timer = setTimeout(() => void push(), PUSH_DELAY_MS)
  })
  window.addEventListener('online', () => void (userId && !pulled ? pull(userId) : push()))

  void (async () => {
    // A conta Google já pertence a outro usuário: entra nela, e o progresso local é mesclado no pull.
    if (location.href.includes('identity_already_exists')) {
      history.replaceState(null, '', location.pathname)
      await signInWithGoogle()
      return
    }
    const { data } = await client.auth.getSession()
    if (!data.session) await client.auth.signInAnonymously()
  })()
}

const redirectTo = () => location.origin + location.pathname

// Anônimo vincula o Google à conta atual (mantém o mesmo usuário e o progresso).
export async function linkGoogle() {
  await supabase?.auth.linkIdentity({ provider: 'google', options: { redirectTo: redirectTo() } })
}

export async function signInWithGoogle() {
  await supabase?.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } })
}

// Sair limpa o progresso deste aparelho (ele está salvo na conta) e volta a uma sessão anônima.
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
  useProgress.getState().reset()
  await supabase.auth.signInAnonymously()
}

// Devolve a mensagem de erro para a tela, ou null se salvou.
export async function updateDisplayName(name: string): Promise<string | null> {
  const invalid = nameError(name)
  if (invalid) return invalid
  if (!supabase) return 'Sem conexão com o servidor.'
  const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
  return error ? 'Não foi possível salvar agora. Tente de novo.' : null
}
