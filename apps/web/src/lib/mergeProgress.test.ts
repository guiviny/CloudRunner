import { describe, expect, it } from 'vitest'
import { mergeProgress } from './mergeProgress'
import { CHEST_GEMS, type ProgressData } from './progress'

const base: ProgressData = {
  xp: 0,
  gems: 0,
  streak: 0,
  lastActiveDay: null,
  completed: {},
  openedChests: [],
  studiedTopics: [],
}
const result = (stars: number, bestXp: number, bestFirstTry: number, completedAt = '2026-11-01T10:00:00.000Z') => ({
  stars,
  bestXp,
  bestFirstTry,
  completedAt,
})

const phone: ProgressData = {
  ...base,
  xp: 70,
  gems: CHEST_GEMS,
  streak: 3,
  lastActiveDay: '2026-11-18',
  completed: { a: result(3, 50, 4), b: result(1, 20, 1) },
  openedChests: ['c1'],
  studiedTopics: ['vpc'],
}
const laptop: ProgressData = {
  ...base,
  xp: 70,
  gems: CHEST_GEMS,
  streak: 1,
  lastActiveDay: '2026-11-10',
  completed: { b: result(2, 30, 2, '2026-11-02T10:00:00.000Z'), c: result(3, 40, 3) },
  openedChests: ['c2'],
  studiedTopics: ['vpc', 'iam'],
}

describe('mergeProgress', () => {
  it('une as lições com o melhor resultado de cada lado e recalcula o XP', () => {
    const m = mergeProgress(phone, laptop)
    expect(m.completed).toEqual({
      a: result(3, 50, 4),
      b: result(2, 30, 2, '2026-11-02T10:00:00.000Z'),
      c: result(3, 40, 3),
    })
    expect(m.xp).toBe(50 + 30 + 40)
  })

  it('une baús e tópicos, e as gemas vêm dos baús abertos', () => {
    const m = mergeProgress(phone, laptop)
    expect(m.openedChests).toEqual(['c1', 'c2'])
    expect(m.gems).toBe(2 * CHEST_GEMS)
    expect(m.studiedTopics).toEqual(['iam', 'vpc'])
  })

  it('a ofensiva vem do lado ativo por último', () => {
    expect(mergeProgress(laptop, phone)).toMatchObject({ streak: 3, lastActiveDay: '2026-11-18' })
    expect(mergeProgress(phone, base)).toMatchObject({ streak: 3, lastActiveDay: '2026-11-18' })
  })

  it('é comutativa e idempotente', () => {
    const m = mergeProgress(phone, laptop)
    expect(mergeProgress(laptop, phone)).toEqual(m)
    expect(mergeProgress(m, m)).toEqual(m)
    expect(mergeProgress(m, laptop)).toEqual(m)
  })
})
