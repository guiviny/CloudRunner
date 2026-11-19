import { describe, expect, it } from 'vitest'
import { answer, isCorrect, lessonScore, lessonStars, next, progressRatio, startLesson, xpGain } from './lessonLogic'

describe('isCorrect', () => {
  it('compara conjuntos, ignorando a ordem', () => {
    expect(isCorrect(['b', 'a'], ['a', 'b'])).toBe(true)
    expect(isCorrect(['a'], ['a', 'b'])).toBe(false)
    expect(isCorrect(['a', 'c'], ['a', 'b'])).toBe(false)
  })
})

describe('fluxo da lição', () => {
  it('termina com bônus de perfeição quando tudo está certo', () => {
    let s = startLesson(['q1', 'q2'])
    s = next(answer(s, ['a'], ['a']))
    s = next(answer(s, ['a'], ['a']))
    expect(s.phase).toBe('finished')
    expect(lessonScore(s)).toEqual({ total: 2, firstTry: 2, recovered: 0, xp: 30 }) // 2×10 + bônus 10
    expect(lessonStars(s)).toBe(3)
  })

  it('reenfileira a questão errada e tira um coração', () => {
    let s = startLesson(['q1', 'q2'])
    s = answer(s, ['b'], ['a'])
    expect(s.hearts).toBe(4)
    expect(s.queue).toEqual(['q1', 'q2', 'q1'])
    s = next(s)
    s = next(answer(s, ['a'], ['a']))
    expect(s.phase).toBe('answering')
    expect(s.queue[s.index]).toBe('q1')
    expect(progressRatio(s, 2)).toBe(0.5)
    s = next(answer(s, ['a'], ['a']))
    expect(s.phase).toBe('finished')
    expect(lessonScore(s)).toEqual({ total: 2, firstTry: 1, recovered: 1, xp: 13 }) // 10 + 3, sem bônus
    expect(lessonStars(s)).toBe(2)
  })

  it('falha quando os corações acabam', () => {
    let s = startLesson(['q1'], 1)
    s = next(answer(s, ['b'], ['a']))
    expect(s.phase).toBe('failed')
    expect(lessonScore(s).xp).toBe(0)
  })

  it('ignora respostas fora da fase de resposta', () => {
    const s = answer(startLesson(['q1']), ['a'], ['a'])
    expect(answer(s, ['b'], ['a'])).toBe(s)
  })
})

describe('XP para o ranking', () => {
  it('a primeira conclusão rende todo o XP', () => expect(xpGain(0, 30)).toBe(30))
  it('refazer sem melhorar não rende XP', () => {
    expect(xpGain(30, 30)).toBe(0)
    expect(xpGain(30, 13)).toBe(0)
  })
  it('superar o recorde rende só a diferença', () => expect(xpGain(13, 30)).toBe(17))
  it('mais acertos de primeira sempre valem mais XP', () => {
    const finish = (wrong: number) => {
      let s = startLesson(['a', 'b', 'c'])
      for (let i = 0; i < 3; i++) s = next(answer(s, i < wrong ? ['x'] : ['ok'], ['ok']))
      while (s.phase === 'answering') s = next(answer(s, ['ok'], ['ok']))
      return lessonScore(s).xp
    }
    expect(finish(0)).toBeGreaterThan(finish(1))
    expect(finish(1)).toBeGreaterThan(finish(2))
    expect(finish(2)).toBeGreaterThan(finish(3))
  })
})
