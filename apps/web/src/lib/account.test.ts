import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { fitName, nameError, profileOf } from './account'

const user = (meta: object, google?: object) =>
  ({
    user_metadata: meta,
    identities: google ? [{ provider: 'google', identity_data: google }] : [],
  }) as unknown as User

describe('profileOf', () => {
  it('usa nome e foto da identidade Google quando o metadata está vazio (linkIdentity)', () => {
    expect(profileOf(user({}, { full_name: 'Ana Souza', avatar_url: 'https://a/b.png' }))).toEqual({
      name: 'Ana Souza',
      avatarUrl: 'https://a/b.png',
    })
  })

  it('prefere o nome editado no metadata', () => {
    expect(profileOf(user({ full_name: 'Aninha' }, { full_name: 'Ana Souza' })).name).toBe('Aninha')
  })

  it('sem usuário ou sem dados volta null', () => {
    expect(profileOf(null)).toEqual({ name: null, avatarUrl: null })
    expect(profileOf(user({ full_name: '  ' }))).toEqual({ name: null, avatarUrl: null })
  })
})

describe('nameError', () => {
  it('aceita nomes entre 2 e 30 caracteres, ignorando espaços nas pontas', () => {
    expect(nameError('  Al  ')).toBeNull()
    expect(nameError(' A ')).not.toBeNull()
    expect(nameError('x'.repeat(31))).not.toBeNull()
  })
})

describe('fitName', () => {
  it('corta nomes longos na última palavra inteira', () => {
    expect(fitName('Maria Eduarda Fernandes de Albuquerque')).toBe('Maria Eduarda Fernandes de')
    expect(fitName('  Ana   Souza ')).toBe('Ana Souza')
    expect(fitName('x'.repeat(40))).toHaveLength(30)
  })
})
