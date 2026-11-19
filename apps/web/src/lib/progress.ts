import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { xpGain } from '../features/lesson/lessonLogic'
import { toDay, updateStreak } from './streak'

// Progresso local (localStorage). Com o Supabase configurado, sync.ts o mantém sincronizado com o backend.
export const CHEST_GEMS = 20

// Melhor resultado de cada lição. O XP total é a soma dos bestXp, e o ranking usa esse total.
type LessonResult = { stars: number; bestXp: number; bestFirstTry: number; completedAt: string }

// Parte salva (localStorage e Supabase); o resto do store são as ações.
export type ProgressData = {
  xp: number
  gems: number
  streak: number
  lastActiveDay: string | null
  completed: Record<string, LessonResult>
  openedChests: string[]
  // tópicos do roadmap marcados como estudados (não dão XP)
  studiedTopics: string[]
}

type ProgressState = ProgressData & {
  completeLesson: (lessonId: string, score: { xp: number; firstTry: number }, stars: number) => void
  openChest: (chestId: string) => void
  toggleTopic: (topicId: string) => void
  // substitui o progresso pelo resultado do merge com o servidor
  hydrate: (data: ProgressData) => void
  reset: () => void
}

const initial: ProgressData = {
  xp: 0,
  gems: 0,
  streak: 0,
  lastActiveDay: null,
  completed: {},
  openedChests: [],
  studiedTopics: [],
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...initial,
      completeLesson: (lessonId, score, stars) =>
        set((s) => {
          const today = toDay(new Date())
          const prev = s.completed[lessonId]
          const prevBest = prev?.bestXp ?? 0
          return {
            xp: s.xp + xpGain(prevBest, score.xp),
            streak: updateStreak(s.streak, s.lastActiveDay, today),
            lastActiveDay: today,
            completed: {
              ...s.completed,
              [lessonId]: {
                stars: Math.max(stars, prev?.stars ?? 0),
                bestXp: Math.max(score.xp, prevBest),
                bestFirstTry: Math.max(score.firstTry, prev?.bestFirstTry ?? 0),
                completedAt: new Date().toISOString(),
              },
            },
          }
        }),
      openChest: (chestId) =>
        set((s) =>
          s.openedChests.includes(chestId)
            ? s
            : { gems: s.gems + CHEST_GEMS, openedChests: [...s.openedChests, chestId] },
        ),
      toggleTopic: (topicId) =>
        set((s) => ({
          studiedTopics: s.studiedTopics.includes(topicId)
            ? s.studiedTopics.filter((id) => id !== topicId)
            : [...s.studiedTopics, topicId],
        })),
      hydrate: (data) => set(data),
      reset: () => set(initial),
    }),
    {
      // A chave mantém o nome antigo para não perder o progresso de quem já usa o app.
      name: 'nuvem-trilha-progress',
      // Ao mudar o formato salvo, suba a versão e trate a conversão em migrate.
      version: 1,
      migrate: (persisted) => ({ ...initial, ...(persisted as Partial<ProgressState>) }),
    },
  ),
)

// Total de questões dominadas (melhor nº de acertos de primeira por lição): critério de desempate do ranking.
export const selectCorrectAnswers = (s: ProgressData) =>
  Object.values(s.completed).reduce((sum, r) => sum + (r.bestFirstTry ?? 0), 0)

export function progressData(s: ProgressData): ProgressData {
  const { xp, gems, streak, lastActiveDay, completed, openedChests, studiedTopics } = s
  return { xp, gems, streak, lastActiveDay, completed, openedChests, studiedTopics }
}
