import { sections } from '.'
import { Roadmap, type Topic } from './roadmapSchema'
import raw from './data/roadmap.json'

export function parseRoadmap(data: unknown) {
  const roadmap = Roadmap.parse(data)
  const unitIds = new Set(sections.flatMap((s) => s.units.map((u) => u.id)))
  const seen = new Set<string>()
  for (const group of roadmap.groups) {
    for (const topic of group.topics) {
      if (seen.has(topic.id)) throw new Error(`roadmap: tópico "${topic.id}" duplicado`)
      seen.add(topic.id)
      if (topic.unitId && !unitIds.has(topic.unitId))
        throw new Error(`roadmap/${topic.id}: unidade "${topic.unitId}" não existe`)
    }
  }
  return roadmap
}

export const roadmap = parseRoadmap(raw)

const topicIndex = new Map<string, Topic>(roadmap.groups.flatMap((g) => g.topics.map((t) => [t.id, t] as const)))
export const allTopics = [...topicIndex.values()]
export const getTopic = (id: string) => topicIndex.get(id)

export function firstLessonOfUnit(unitId: string) {
  for (const s of sections) {
    const unit = s.units.find((u) => u.id === unitId)
    if (unit) return unit.lessons[0]
  }
}
