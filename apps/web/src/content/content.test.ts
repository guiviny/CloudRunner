import { describe, expect, it } from 'vitest'
import { templates } from '../scenes/templates'
import { isLessonUnlocked, sections } from '.'

// Garante que o conteúdo (escrito à mão ou gerado por IA) é coerente com as cenas.
describe('conteúdo', () => {
  const questions = sections.flatMap((s) => s.questions)

  it('ids de questão são únicos entre seções', () => {
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(questions.filter((q) => q.explanation.scene).map((q) => [q.id, q] as const))(
    '%s: a cena só referencia nós que existem no template',
    (_, q) => {
      const scene = q.explanation.scene!
      const nodeIds = new Set(templates[scene.template](scene.params).nodes.map((n) => n.id))
      for (const step of scene.steps) {
        for (const id of [...step.focus, ...step.alert, ...Object.keys(step.labels), ...(step.packet?.path ?? [])]) {
          expect(nodeIds, `nó "${id}"`).toContain(id)
        }
      }
    },
  )

  it('toda questão de Amazon RDS tem cena 3D', () => {
    const rds = sections.find((s) => s.id === 'secao-2')!
    for (const q of rds.questions) expect(q.explanation.scene, q.id).toBeTruthy()
  })

  it('toda alternativa errada tem explicação', () => {
    const missing = questions.flatMap((q) =>
      q.options
        .filter((o) => !q.correct.includes(o.id) && !q.explanation.whyOthersWrong[o.id])
        .map((o) => `${q.id}/${o.id}`),
    )
    expect(missing).toEqual([])
  })
})

describe('desbloqueio', () => {
  const unit = {
    id: 'u',
    title: 'U',
    lessons: [
      { id: 'a', title: 'A', type: 'learn' as const, questionIds: ['q'] },
      { id: 'b', title: 'B', type: 'learn' as const, questionIds: ['q'] },
    ],
  }

  it('a primeira lição de qualquer unidade é sempre liberada', () => {
    expect(isLessonUnlocked(unit, 'a', {})).toBe(true)
    for (const s of sections) for (const u of s.units) expect(isLessonUnlocked(u, u.lessons[0].id, {})).toBe(true)
  })

  it('dentro da unidade, a próxima lição depende da anterior', () => {
    expect(isLessonUnlocked(unit, 'b', {})).toBe(false)
    expect(isLessonUnlocked(unit, 'b', { a: { stars: 3 } })).toBe(true)
  })
})
