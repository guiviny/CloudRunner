import { describe, expect, it } from 'vitest'
import { useProgress } from './progress'

describe('tópicos do roadmap', () => {
  it('marca e desmarca um tópico sem mexer no XP', () => {
    const { toggleTopic } = useProgress.getState()
    toggleTopic('vpc')
    expect(useProgress.getState().studiedTopics).toEqual(['vpc'])
    toggleTopic('vpc')
    expect(useProgress.getState().studiedTopics).toEqual([])
    expect(useProgress.getState().xp).toBe(0)
  })
})
