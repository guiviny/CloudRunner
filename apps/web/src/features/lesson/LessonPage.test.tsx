// @vitest-environment jsdom
import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getLesson, getQuestion } from '../../content'
import type { Question } from '../../content/schema'
import { useProgress } from '../../lib/progress'
import { renderRoute } from '../../test/render'
import { MAX_HEARTS } from './lessonLogic'

const LESSON_ID = 'u1-l1'
const lesson = getLesson(LESSON_ID)!
const lessonQuestions = lesson.questionIds.map((id) => getQuestion(id)!)

// A lição reenfileira as erradas, então descobrimos a questão atual pelo enunciado na tela.
function currentQuestion(): Question {
  const stem = screen.getByRole('heading', { level: 1 }).textContent
  return lessonQuestions.find((q) => q.stem === stem)!
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const option = (q: Question, id: string) =>
  screen.getByRole(q.kind === 'multi' ? 'checkbox' : 'radio', {
    name: new RegExp(escapeRegex(q.options.find((o) => o.id === id)!.text)),
  })

async function answer(user: UserEvent, correct: boolean) {
  const q = currentQuestion()
  const ids = correct ? q.correct : [q.options.find((o) => !q.correct.includes(o.id))!.id]
  for (const id of ids) await user.click(option(q, id))
  await user.click(screen.getByRole('button', { name: 'Verificar' }))
  return q
}

describe('LessonPage', () => {
  it('acerto mostra feedback positivo sem abrir a explicação', async () => {
    const { user } = renderRoute(`/licao/${LESSON_ID}`)
    expect(screen.getByRole('button', { name: 'Verificar' })).toBeDisabled()

    await answer(user, true)

    expect(screen.getByText('Muito bem!')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Explicação' })).not.toBeInTheDocument()
    expect(screen.getByLabelText(`${MAX_HEARTS} corações`)).toBeInTheDocument()
  })

  it('erro tira um coração e abre a explicação com os passos da cena', async () => {
    const { user } = renderRoute(`/licao/${LESSON_ID}`)

    const q = await answer(user, false)

    expect(screen.getByText('Resposta incorreta')).toBeInTheDocument()
    expect(screen.getByLabelText(`${MAX_HEARTS - 1} corações`)).toBeInTheDocument()
    const explanation = screen.getByRole('region', { name: 'Explicação' })
    expect(explanation).toHaveTextContent(q.explanation.summary)
    for (const step of q.explanation.scene?.steps ?? []) expect(explanation).toHaveTextContent(step.caption)
  })

  it('concluir a lição sem erros grava 3 estrelas e XP', async () => {
    const { user } = renderRoute(`/licao/${LESSON_ID}`)

    for (let i = 0; i < lessonQuestions.length; i++) {
      await answer(user, true)
      await user.click(screen.getByRole('button', { name: 'Continuar' }))
    }

    expect(screen.getByText('Lição concluída!')).toBeInTheDocument()
    const result = useProgress.getState().completed[LESSON_ID]
    expect(result.stars).toBe(3)
    expect(result.bestFirstTry).toBe(lessonQuestions.length)
    expect(useProgress.getState().xp).toBe(result.bestXp)
  })

  it('sem corações, oferece tentar de novo', async () => {
    const { user } = renderRoute(`/licao/${LESSON_ID}`)

    for (let i = 0; i < MAX_HEARTS; i++) {
      await answer(user, false)
      await user.click(screen.getByRole('button', { name: 'Continuar' }))
    }

    expect(screen.getByText('Seus corações acabaram')).toBeInTheDocument()
    expect(useProgress.getState().completed[LESSON_ID]).toBeUndefined()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(screen.getByLabelText(`${MAX_HEARTS} corações`)).toBeInTheDocument()
  })

  it('atalhos: número escolhe a opção e Enter verifica e continua', async () => {
    const { user } = renderRoute(`/licao/${LESSON_ID}`)
    const q = currentQuestion()
    expect(q.kind).toBe('single')
    const correctIndex = q.options.findIndex((o) => o.id === q.correct[0])

    await user.keyboard(String(correctIndex + 1))
    expect(option(q, q.correct[0])).toHaveAttribute('aria-checked', 'true')
    await user.keyboard('{Enter}')
    expect(screen.getByText('Muito bem!')).toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(currentQuestion()).not.toBe(q)
  })

  it('lição inexistente volta para a trilha', () => {
    const { router } = renderRoute('/licao/nao-existe')
    expect(router.state.location.pathname).toBe('/trilha')
  })
})
