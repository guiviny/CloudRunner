import { CHEST_GEMS, type ProgressData } from './progress'

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])]

// Junta o progresso local com o do servidor sem perder nada de nenhum lado.
// Comutativa e idempotente: a ordem dos aparelhos e repetir o sync não mudam o resultado.
export function mergeProgress(a: ProgressData, b: ProgressData): ProgressData {
  const completed: ProgressData['completed'] = { ...a.completed }
  for (const [id, r] of Object.entries(b.completed)) {
    const p = completed[id]
    completed[id] = p
      ? {
          stars: Math.max(p.stars, r.stars),
          bestXp: Math.max(p.bestXp, r.bestXp),
          bestFirstTry: Math.max(p.bestFirstTry ?? 0, r.bestFirstTry ?? 0),
          completedAt: p.completedAt > r.completedAt ? p.completedAt : r.completedAt,
        }
      : r
  }
  const openedChests = union(a.openedChests, b.openedChests).sort()
  // a ofensiva vem do lado que esteve ativo por último; no mesmo dia, a maior
  const recent =
    (a.lastActiveDay ?? '') > (b.lastActiveDay ?? '') ? a : (b.lastActiveDay ?? '') > (a.lastActiveDay ?? '') ? b : null
  return {
    // o XP total é a soma dos melhores resultados (ver xpGain)
    xp: Object.values(completed).reduce((sum, r) => sum + r.bestXp, 0),
    gems: openedChests.length * CHEST_GEMS,
    streak: recent ? recent.streak : Math.max(a.streak, b.streak),
    lastActiveDay: recent ? recent.lastActiveDay : a.lastActiveDay,
    completed,
    openedChests,
    studiedTopics: union(a.studiedTopics, b.studiedTopics).sort(),
  }
}
