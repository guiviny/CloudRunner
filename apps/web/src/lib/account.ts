import type { User } from '@supabase/supabase-js'

export const NAME_MIN = 2
export const NAME_MAX = 30

type Profile = { name: string | null; avatarUrl: string | null }

const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

// Ao vincular o Google a um anônimo (linkIdentity) o Supabase não copia nome e foto para o
// user_metadata: eles ficam só na identidade. O metadata tem prioridade porque é onde o aluno edita.
export function profileOf(user: User | null): Profile {
  if (!user) return { name: null, avatarUrl: null }
  const meta = user.user_metadata ?? {}
  const google = user.identities?.find((i) => i.provider === 'google')?.identity_data ?? {}
  return {
    name: text(meta.full_name) ?? text(meta.name) ?? text(google.full_name) ?? text(google.name),
    avatarUrl: text(meta.avatar_url) ?? text(google.avatar_url) ?? text(google.picture),
  }
}

// Devolve a mensagem de erro, ou null se o nome serve.
export function nameError(name: string): string | null {
  const n = name.trim()
  if (n.length < NAME_MIN) return `Use pelo menos ${NAME_MIN} letras.`
  if (n.length > NAME_MAX) return `Use no máximo ${NAME_MAX} caracteres.`
  return null
}

// Nomes do Google podem passar do limite: corta na última palavra inteira que cabe.
export function fitName(name: string): string {
  const n = name.trim().replace(/\s+/g, ' ')
  if (n.length <= NAME_MAX) return n
  const cut = n.slice(0, NAME_MAX + 1)
  const space = cut.lastIndexOf(' ')
  return space >= NAME_MIN ? cut.slice(0, space) : n.slice(0, NAME_MAX)
}
