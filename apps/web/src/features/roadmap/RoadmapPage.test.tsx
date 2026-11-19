// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { roadmap } from '../../content/roadmap'
import { useProgress } from '../../lib/progress'
import { renderRoute } from '../../test/render'

const topic = roadmap.groups[0].topics[0]
const topicButton = () =>
  screen.getAllByRole('button').find((b) => b.textContent?.startsWith(topic.title) && b.hasAttribute('aria-pressed'))!

describe('RoadmapPage', () => {
  it('clique abre os materiais do tópico e Esc fecha', async () => {
    const { user } = renderRoute('/roadmap')

    await user.click(topicButton())
    const dialog = screen.getByRole('dialog', { name: topic.title })
    for (const r of topic.resources) expect(dialog).toHaveTextContent(r.title)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('clique direito marca e desmarca o tópico como estudado', () => {
    renderRoute('/roadmap')

    fireEvent.contextMenu(topicButton())
    expect(useProgress.getState().studiedTopics).toEqual([topic.id])
    expect(topicButton()).toHaveAttribute('aria-pressed', 'true')

    fireEvent.contextMenu(topicButton())
    expect(useProgress.getState().studiedTopics).toEqual([])
  })
})
