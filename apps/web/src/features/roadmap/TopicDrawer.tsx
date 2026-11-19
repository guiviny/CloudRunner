import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { firstLessonOfUnit } from '../../content/roadmap'
import type { Resource, Topic } from '../../content/roadmapSchema'
import { useProgress } from '../../lib/progress'
import { BookIcon, CheckIcon, CloseIcon, ExternalIcon, PlayIcon } from '../path/icons'

const typeInfo: Record<Resource['type'], { label: string; badge: string }> = {
  course: { label: 'Curso', badge: 'bg-magenta/15 text-magenta' },
  video: { label: 'Vídeo', badge: 'bg-red/15 text-red' },
  docs: { label: 'Docs', badge: 'bg-blue/15 text-blue' },
  article: { label: 'Artigo', badge: 'bg-green/15 text-green' },
}
const typeOrder: Resource['type'][] = ['course', 'video', 'docs', 'article']

export function TopicDrawer({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const done = useProgress((s) => s.studiedTopics.includes(topic.id))
  const toggleTopic = useProgress((s) => s.toggleTopic)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lesson = topic.unitId ? firstLessonOfUnit(topic.unitId) : undefined
  const resources = [...topic.resources].sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type))

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="topic-title">
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative flex h-full w-full flex-col overflow-y-auto border-l-2 border-line bg-surface sm:w-[30rem]">
        <div className="flex items-start gap-3 border-b-2 border-line p-5">
          <h2
            id="topic-title"
            className={`flex-1 text-lg font-extrabold leading-snug ${done ? 'text-muted line-through decoration-gold' : ''}`}
          >
            {topic.title}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1 text-muted hover:text-ink"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-5">
          <p className="text-[15px] font-semibold leading-relaxed">{topic.description}</p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => toggleTopic(topic.id)}
              aria-pressed={done}
              className={`btn-3d flex flex-1 items-center justify-center gap-2 py-3 text-sm text-on-neon ${done ? 'border-gold-dark bg-gold' : 'border-green-dark bg-green'}`}
            >
              {done ? (
                <>
                  <CheckIcon className="h-4 w-4" /> Concluído
                </>
              ) : (
                'Marcar como concluído'
              )}
            </button>
            {lesson && (
              <Link
                to={`/licao/${lesson.id}`}
                className="btn-3d flex flex-1 items-center justify-center gap-2 border-blue-dark bg-blue py-3 text-sm text-on-neon"
              >
                🎯 Praticar na trilha
              </Link>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Materiais gratuitos</h3>
            <ul className="flex flex-col gap-2">
              {resources.map((r) => (
                <li key={r.url}>
                  <ResourceLink resource={r} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  )
}

function ResourceLink({ resource: r }: { resource: Resource }) {
  const info = typeInfo[r.type]
  const Icon = r.type === 'video' || r.type === 'course' ? PlayIcon : BookIcon
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border-2 border-line bg-bg p-3 transition-colors hover:border-blue"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${info.badge}`}>
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-bold leading-snug group-hover:text-blue">{r.title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs font-extrabold uppercase text-muted">
          <span className={`rounded px-1.5 py-0.5 ${info.badge}`}>{info.label}</span>
          {r.source}
          <span>· {r.lang === 'pt' ? 'Português' : 'Inglês'}</span>
        </span>
      </span>
      <ExternalIcon className="h-4 w-4 shrink-0 text-muted group-hover:text-blue" />
    </a>
  )
}
