// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { useProgress } from './progress'

describe('progresso salvo', () => {
  it('migra o formato sem versão (v0) mantendo os dados e preenchendo campos novos', async () => {
    localStorage.setItem('nuvem-trilha-progress', JSON.stringify({ state: { xp: 42, gems: 20 }, version: 0 }))

    await useProgress.persist.rehydrate()

    const s = useProgress.getState()
    expect(s.xp).toBe(42)
    expect(s.gems).toBe(20)
    expect(s.studiedTopics).toEqual([])
  })
})
