export const MAX_HEARTS = 5
// XP proporcional aos acertos: é a base do ranking entre alunos.
export const XP_FIRST_TRY = 10 // acertou de primeira
export const XP_RECOVERED = 3 // acertou só depois de errar
export const XP_PERFECT_BONUS = 10 // lição sem nenhum erro

export type LessonState = {
  queue: string[] // ids das questões; as erradas voltam para o fim
  index: number
  hearts: number
  mistakes: string[] // ids errados ao menos uma vez
  solved: number // acertos; cada questão original precisa ser acertada uma vez
  phase: 'answering' | 'feedback' | 'finished' | 'failed'
  lastCorrect: boolean | null
}

export function startLesson(questionIds: string[], hearts = MAX_HEARTS): LessonState {
  return { queue: [...questionIds], index: 0, hearts, mistakes: [], solved: 0, phase: 'answering', lastCorrect: null }
}

export function isCorrect(selected: string[], correct: string[]) {
  return selected.length === correct.length && correct.every((c) => selected.includes(c))
}

export function answer(state: LessonState, selected: string[], correct: string[]): LessonState {
  if (state.phase !== 'answering') return state
  const qid = state.queue[state.index]
  if (isCorrect(selected, correct)) return { ...state, phase: 'feedback', lastCorrect: true, solved: state.solved + 1 }
  return {
    ...state,
    phase: 'feedback',
    lastCorrect: false,
    hearts: state.hearts - 1,
    queue: [...state.queue, qid],
    mistakes: state.mistakes.includes(qid) ? state.mistakes : [...state.mistakes, qid],
  }
}

export function next(state: LessonState): LessonState {
  if (state.phase !== 'feedback') return state
  if (state.hearts <= 0) return { ...state, phase: 'failed' }
  const index = state.index + 1
  if (index >= state.queue.length) return { ...state, index, phase: 'finished' }
  return { ...state, index, phase: 'answering', lastCorrect: null }
}

export function progressRatio(state: LessonState, originalCount: number) {
  return Math.min(state.solved / originalCount, 1)
}

export type LessonScore = {
  total: number // questões da lição
  firstTry: number // acertos de primeira
  recovered: number // acertos depois de errar
  xp: number
}

// Só lições concluídas pontuam: sem isso, abandonar no meio viraria uma forma de "guardar" XP.
export function lessonScore(state: LessonState): LessonScore {
  const total = new Set(state.queue).size
  if (state.phase !== 'finished') return { total, firstTry: 0, recovered: 0, xp: 0 }
  const recovered = state.mistakes.length
  const firstTry = total - recovered
  const xp = firstTry * XP_FIRST_TRY + recovered * XP_RECOVERED + (recovered === 0 ? XP_PERFECT_BONUS : 0)
  return { total, firstTry, recovered, xp }
}

// Refazer uma lição só rende a diferença sobre o melhor resultado anterior,
// para o ranking medir domínio do conteúdo e não repetição.
export function xpGain(previousBestXp: number, xp: number) {
  return Math.max(0, xp - previousBestXp)
}

export function lessonStars(state: LessonState) {
  const m = state.mistakes.length
  return m === 0 ? 3 : m <= 1 ? 2 : 1
}
