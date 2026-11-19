import type { Topic } from '../../content/roadmapSchema'
import { useProgress } from '../../lib/progress'
import { CheckIcon } from '../path/icons'

type Props = { topic: Topic; side: 'left' | 'right'; onOpen: (id: string) => void }

// Clique: abre os materiais. Clique direito: marca/desmarca como concluído (igual ao roadmap.sh).
export function TopicNode({ topic, side, onOpen }: Props) {
  const done = useProgress((s) => s.studiedTopics.includes(topic.id))
  const toggleTopic = useProgress((s) => s.toggleTopic)

  const style = done
    ? 'border-gold bg-gold/10 text-muted shadow-[0_4px_0_var(--color-gold-dark)]'
    : `${topic.optional ? 'border-dashed' : ''} border-line bg-surface text-ink shadow-[0_4px_0_var(--color-locked-dark)] hover:border-blue hover:shadow-[0_4px_0_var(--color-blue-dark),0_0_18px_rgb(0_229_255/0.25)]`

  return (
    <div className="relative">
      {/* conector até a espinha central */}
      <span
        aria-hidden
        className={`absolute top-1/2 h-0.5 w-7 -translate-y-1/2 -left-7 ${side === 'left' ? 'sm:left-auto sm:-right-8 sm:w-8' : 'sm:-left-8 sm:w-8'} ${done ? 'bg-gold' : 'bg-blue/40'}`}
      />
      <button
        onClick={() => onOpen(topic.id)}
        onContextMenu={(e) => {
          e.preventDefault()
          toggleTopic(topic.id)
        }}
        aria-pressed={done}
        title={
          done
            ? 'Concluído · clique direito para desmarcar'
            : 'Clique para ver os materiais · clique direito para concluir'
        }
        className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-[border,box-shadow,transform] active:translate-y-0.5 active:shadow-none ${style}`}
      >
        <span
          className={`flex-1 text-[15px] font-bold leading-snug ${done ? 'line-through decoration-2 decoration-gold' : ''}`}
        >
          {topic.title}
          {topic.optional && (
            <span className="ml-1.5 inline-block text-xs font-extrabold uppercase text-muted">· opcional</span>
          )}
        </span>
        {topic.unitId && !done && (
          <span title="Tem prática na trilha" className="text-sm">
            🎯
          </span>
        )}
        {done && (
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold text-on-neon">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </button>
    </div>
  )
}
