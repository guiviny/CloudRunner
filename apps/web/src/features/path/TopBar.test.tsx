// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../../test/render'

const auth = vi.hoisted(() => ({
  user: null as unknown,
  updateUser: vi.fn<(attrs: unknown) => Promise<unknown>>(),
  signOut: vi.fn<() => Promise<unknown>>(),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        cb('INITIAL_SESSION', { user: auth.user })
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      updateUser: auth.updateUser,
      signOut: auth.signOut,
      signInAnonymously: async () => ({}),
      linkIdentity: async () => ({}),
    },
  },
}))

const google = {
  id: 'u1',
  is_anonymous: false,
  user_metadata: {},
  identities: [{ provider: 'google', identity_data: { full_name: 'Ana Souza' } }],
}

describe('menu da conta', () => {
  beforeEach(() => {
    auth.updateUser.mockReset().mockResolvedValue({ error: null })
    auth.signOut.mockReset().mockResolvedValue({})
  })

  it('anônimo vê o botão Entrar', () => {
    auth.user = { id: 'u0', is_anonymous: true, user_metadata: {} }
    renderRoute('/')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('mostra o nome do Google e permite editá-lo', async () => {
    auth.user = google
    const { user } = renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Conta de Ana Souza' }))
    await user.click(screen.getByRole('menuitem', { name: /Editar nome/ }))
    const input = screen.getByLabelText('Seu nome no app')
    await user.clear(input)
    await user.type(input, 'A')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('pelo menos 2')
    expect(auth.updateUser).not.toHaveBeenCalled()

    await user.type(input, 'ninha')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(auth.updateUser).toHaveBeenCalledWith({ data: { full_name: 'Aninha' } })
  })

  it('sair pede confirmação', async () => {
    auth.user = google
    const { user } = renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Conta de Ana Souza' }))
    await user.click(screen.getByRole('menuitem', { name: /Sair/ }))
    expect(auth.signOut).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(auth.signOut).toHaveBeenCalled()
  })
})
