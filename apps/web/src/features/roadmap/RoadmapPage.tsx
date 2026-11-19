import { useCallback, useState } from 'react'
import { allTopics, getTopic, roadmap } from '../../content/roadmap'
import type { RoadmapGroup } from '../../content/roadmapSchema'
import { useProgress } from '../../lib/progress'
import { TopBar } from '../path/TopBar'
import { TopicDrawer } from './TopicDrawer'
import { TopicNode } from './TopicNode'

export function RoadmapPage() {
  const [openId, setOpenId] = useState<string | null>(null)
  const close = useCallback(() => setOpenId(null), [])
  const studied = useProgress((s) => s.studiedTopics)
  const done = allTopics.filter((t) => studied.includes(t.id)).length
  const openTopic = openId ? getTopic(openId) : undefined

  return (
    <div className="min-h-screen pb-24">
      <TopBar />
      <div className="mx-auto max-w-3xl px-4">
        <header className="pt-8 pb-10 text-center">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-magenta">
            AWS re/Start // CLF-C02
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">Roadmap de estudos</h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-muted">
            Materiais gratuitos e oficiais para cada tema da prova. Estude o tópico e depois pratique na trilha.
          </p>
          <div className="mx-auto mt-5 max-w-sm">
            <div className="mb-1.5 flex justify-between text-xs font-extrabold uppercase text-muted">
              <span>Progresso</span>
              <span className="text-gold">
                {done} de {allTopics.length} tópicos
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-locked">
              <div
                className="h-full rounded-full bg-gold shadow-[0_0_12px_rgb(255_214_10/0.5)] transition-[width] duration-500"
                style={{ width: `${(done / allTopics.length) * 100}%` }}
              />
            </div>
          </div>
          <p className="mt-4 text-xs font-bold text-muted">
            <kbd className="rounded border border-line px-1">Clique</kbd> para ver os materiais ·{' '}
            <kbd className="rounded border border-line px-1">Clique direito</kbd> para concluir · 🎯 tem prática na
            trilha
          </p>
        </header>

        <div className="relative">
          {/* espinha central (à esquerda no celular) */}
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-3 w-0.5 bg-blue/30 sm:left-1/2 sm:-translate-x-1/2"
          />
          {roadmap.groups.map((g, i) => (
            <GroupBlock key={g.id} group={g} number={i + 1} onOpen={setOpenId} />
          ))}
        </div>
      </div>

      {openTopic && <TopicDrawer key={openTopic.id} topic={openTopic} onClose={close} />}
    </div>
  )
}

function GroupBlock({ group, number, onOpen }: { group: RoadmapGroup; number: number; onOpen: (id: string) => void }) {
  const studied = useProgress((s) => s.studiedTopics)
  const groupDone = group.topics.every((t) => studied.includes(t.id))

  return (
    <section className="relative pb-12">
      <div className="relative mb-6 flex items-center pl-10 sm:justify-center sm:pl-0">
        <span
          aria-hidden
          className={`absolute left-3 h-4 w-4 -translate-x-1/2 rotate-45 sm:left-1/2 ${groupDone ? 'bg-gold' : 'bg-green'}`}
        />
        <div
          className={`relative clip-corner px-5 py-3 text-on-neon sm:text-center ${groupDone ? 'bg-gold' : 'bg-green'}`}
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-widest opacity-75">Etapa {number}</p>
          <h2 className="text-lg font-extrabold leading-tight">{group.title}</h2>
        </div>
      </div>
      <ul className="grid gap-3 pl-10 sm:grid-cols-2 sm:gap-x-16 sm:pl-0">
        {group.topics.map((t, i) => (
          <li key={t.id}>
            <TopicNode topic={t} side={i % 2 === 0 ? 'left' : 'right'} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </section>
  )
}
