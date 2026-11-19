import { createClient } from '@supabase/supabase-js'

// Sem as variáveis (testes, CI, dev sem backend) o app roda só com o progresso local.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && key ? createClient(url, key) : null
