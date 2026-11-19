// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderRoute } from '../../test/render'
import type { RankingRow } from './RankingPage'

const rows: RankingRow[] = [
  { rank: 1, display_name: 'Ana', avatar_url: null, xp: 120, correct: 10, is_me: false },
  { rank: 2, display_name: 'Bruno', avatar_url: null, xp: 80, correct: 7, is_me: true },
]

// Client falso: sessão anônima e o ranking acima.
vi.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: async () => ({ data: rows, error: null }),
    auth: {
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        cb('INITIAL_SESSION', { user: { id: 'u1', is_anonymous: true, user_metadata: {} } })
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
  },
}))

describe('RankingPage', () => {
  it('lista os alunos, destaca o próprio e convida o anônimo a entrar com Google', async () => {
    renderRoute('/ranking')

    const items = await screen.findAllByRole('listitem')
    expect(items.map((i) => i.textContent)).toEqual([expect.stringContaining('Ana'), expect.stringContaining('Bruno')])
    expect(items[1]).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Entrar com Google' })).toBeInTheDocument()
  })
})
