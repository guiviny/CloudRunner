import { describe, expect, it } from 'vitest'
import { updateStreak, visibleStreak } from './streak'

describe('ofensiva', () => {
  it('começa em 1', () => expect(updateStreak(0, null, '2026-11-18')).toBe(1))
  it('não muda no mesmo dia', () => expect(updateStreak(3, '2026-11-18', '2026-11-18')).toBe(3))
  it('soma no dia seguinte, inclusive na virada do mês', () => {
    expect(updateStreak(3, '2026-11-17', '2026-11-18')).toBe(4)
    expect(updateStreak(3, '2026-11-30', '2026-12-01')).toBe(4)
  })
  it('reinicia depois de pular um dia', () => expect(updateStreak(5, '2026-11-15', '2026-11-18')).toBe(1))
  it('a ofensiva visível zera depois de mais de um dia sem estudar', () => {
    expect(visibleStreak(5, '2026-11-17', '2026-11-18')).toBe(5)
    expect(visibleStreak(5, '2026-11-15', '2026-11-18')).toBe(0)
  })
})
