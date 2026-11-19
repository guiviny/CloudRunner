import { describe, expect, it } from 'vitest'
import { sections } from '.'
import { allTopics, firstLessonOfUnit, parseRoadmap, roadmap } from './roadmap'

describe('roadmap', () => {
  it('ids de tópico são únicos', () => {
    const ids = allTopics.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todo tópico ligado à trilha aponta para uma unidade com lições', () => {
    for (const t of allTopics.filter((topic) => topic.unitId)) expect(firstLessonOfUnit(t.unitId!), t.id).toBeTruthy()
  })

  it('toda unidade da trilha tem um tópico de estudo no roadmap', () => {
    const linked = new Set(allTopics.map((t) => t.unitId))
    for (const u of sections.flatMap((s) => s.units)) expect(linked, u.id).toContain(u.id)
  })

  it('recusa unidade inexistente, tópico duplicado e link sem https', () => {
    const topic = {
      id: 'x',
      title: 'X',
      description: 'x',
      resources: [{ type: 'docs', title: 'd', url: 'https://aws.amazon.com/', source: 'AWS', lang: 'pt' }],
    }
    expect(() =>
      parseRoadmap({ groups: [{ id: 'g', title: 'G', topics: [{ ...topic, unitId: 'nao-existe' }] }] }),
    ).toThrow(/não existe/)
    expect(() => parseRoadmap({ groups: [{ id: 'g', title: 'G', topics: [topic, topic] }] })).toThrow(/duplicado/)
    const http = { ...topic, resources: [{ ...topic.resources[0], url: 'http://aws.amazon.com/' }] }
    expect(() => parseRoadmap({ groups: [{ id: 'g', title: 'G', topics: [http] }] })).toThrow(/Invalid URL/)
  })

  it('carrega todos os grupos do JSON', () => expect(roadmap.groups.length).toBeGreaterThan(5))
})
