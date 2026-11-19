// Datas no formato YYYY-MM-DD no fuso local do usuário.
export function toDay(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysBetween(a: string, b: string) {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000)
}

export function updateStreak(streak: number, lastActive: string | null, today: string) {
  if (!lastActive) return 1
  const diff = daysBetween(lastActive, today)
  if (diff <= 0) return Math.max(streak, 1)
  if (diff === 1) return streak + 1
  return 1
}

// Ofensiva exibida: zera se o último dia ativo foi antes de ontem.
export function visibleStreak(streak: number, lastActive: string | null, today: string) {
  if (!lastActive) return 0
  return daysBetween(lastActive, today) <= 1 ? streak : 0
}
