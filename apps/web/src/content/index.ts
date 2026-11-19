import { Section, type Question, type Lesson, type Unit } from './schema'
import secao1 from './data/secao-1.json'
import secao2 from './data/secao-2.json'

export function parseSection(raw: unknown) {
  const section = Section.parse(raw)
  const ids = new Set(section.questions.map((q) => q.id))
  for (const unit of section.units) {
    for (const lesson of unit.lessons) {
      for (const qid of lesson.questionIds) {
        if (!ids.has(qid)) throw new Error(`${section.id}/${lesson.id}: questão "${qid}" não existe`)
      }
    }
  }
  return section
}

export const sections = [parseSection(secao1), parseSection(secao2)]

const questionIndex = new Map<string, Question>()
const lessonIndex = new Map<string, Lesson>()
for (const s of sections) {
  for (const q of s.questions) questionIndex.set(q.id, q)
  for (const u of s.units) for (const l of u.lessons) lessonIndex.set(l.id, l)
}

export const getQuestion = (id: string) => questionIndex.get(id)
export const getLesson = (id: string) => lessonIndex.get(id)

// O aluno pode começar por qualquer unidade: a primeira lição de cada unidade é sempre liberada,
// e dentro da unidade as lições seguem em sequência.
export function isLessonUnlocked(unit: Unit, lessonId: string, completed: Record<string, unknown>) {
  const i = unit.lessons.findIndex((l) => l.id === lessonId)
  return i === 0 || (i > 0 && Boolean(completed[unit.lessons[i - 1].id]))
}
