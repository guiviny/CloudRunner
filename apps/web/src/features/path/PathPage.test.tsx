// @vitest-environment jsdom
import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sections } from '../../content'
import { CHEST_GEMS, useProgress } from '../../lib/progress'
import { renderRoute } from '../../test/render'

const unit = sections[0].units[0]
const [first, second] = unit.lessons
const done = { stars: 3, bestXp: 30, bestFirstTry: 3, completedAt: '2026-01-01T00:00:00.000Z' }

describe('PathPage', () => {
  it('libera a primeira lição de cada unidade e bloqueia a seguinte', () => {
    renderRoute('/trilha')

    for (const s of sections)
      for (const u of s.units) expect(screen.getByRole('link', { name: u.lessons[0].title })).toBeInTheDocument()
    expect(screen.getByLabelText(`${second.title} (bloqueada)`)).toBeInTheDocument()
  })

  it('concluir uma lição libera a próxima da mesma unidade', () => {
    useProgress.setState({ completed: { [first.id]: done } })
    renderRoute('/trilha')

    expect(screen.getByRole('link', { name: second.title })).toHaveAttribute('href', `/licao/${second.id}`)
  })

  it('o baú só abre depois da lição anterior e dá gemas uma vez', async () => {
    const withChest = sections.flatMap((s) => s.units).find((u) => u.chestAfter !== undefined)!
    const before = withChest.lessons[withChest.chestAfter!]
    useProgress.setState({ completed: { [before.id]: done } })
    const { user } = renderRoute('/trilha')

    const section = screen.getByRole('heading', { name: withChest.title }).closest('section')!
    const chest = within(section).getByRole('button', { name: 'Baú de recompensa' })
    await user.click(chest)

    expect(useProgress.getState().gems).toBe(CHEST_GEMS)
    expect(chest).toBeDisabled()
  })
})
