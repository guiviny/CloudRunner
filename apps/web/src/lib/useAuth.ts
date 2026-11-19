import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { profileOf } from './account'
import { supabase } from './supabase'

export type AuthInfo = {
  enabled: boolean
  user: User | null
  isAnonymous: boolean
  displayName: string | null
  avatarUrl: string | null
}

export function useAuth(): AuthInfo {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    if (!supabase) return
    // também dispara em USER_UPDATED: o nome editado aparece na hora
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])
  const { name, avatarUrl } = profileOf(user)
  return {
    enabled: supabase !== null,
    user,
    isAnonymous: user?.is_anonymous ?? true,
    displayName: name,
    avatarUrl,
  }
}
