import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type AuthInfo = { enabled: boolean; user: User | null; isAnonymous: boolean; displayName: string | null }

export function useAuth(): AuthInfo {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])
  const meta = user?.user_metadata ?? {}
  return {
    enabled: supabase !== null,
    user,
    isAnonymous: user?.is_anonymous ?? true,
    displayName: (meta.full_name ?? meta.name ?? null) as string | null,
  }
}
