import type { Question } from '../../content/schema'

type Props = {
  question: Question
  selected: string[]
  onChange: (selected: string[]) => void
  revealed: boolean
}

const kindLabel: Record<Question['kind'], string> = {
  single: 'Escolha a resposta correta',
  multi: 'Escolha todas as corretas',
  scenario: 'Cenário',
  truefalse: 'Verdadeiro ou falso',
}

export function QuestionView({ question, selected, onChange, revealed }: Props) {
  const multi = question.kind === 'multi'

  function toggle(id: string) {
    if (revealed) return
    if (!multi) return onChange([id])
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-extrabold uppercase tracking-wide text-blue">
        {kindLabel[question.kind]}
        {multi && ` · ${question.correct.length}`}
      </p>
      {question.context && (
        <div className="rounded-2xl border-2 border-line bg-surface p-4 text-[15px] font-semibold leading-relaxed text-muted">
          {question.context}
        </div>
      )}
      <h1 className="font-sans text-xl font-bold leading-snug sm:text-2xl">{question.stem}</h1>
      <div
        className={question.kind === 'truefalse' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}
        role={multi ? 'group' : 'radiogroup'}
      >
        {question.options.map((o, i) => {
          const isSelected = selected.includes(o.id)
          const isCorrect = question.correct.includes(o.id)
          const style = revealed
            ? isCorrect
              ? 'border-green bg-green-light text-green'
              : isSelected
                ? 'border-red bg-red-light text-red'
                : 'border-line opacity-60'
            : isSelected
              ? 'border-blue bg-blue-light text-blue shadow-[0_0_0_1px_rgb(0_229_255/0.35),0_0_18px_rgb(0_229_255/0.25)]'
              : 'border-line hover:bg-surface-2'
          return (
            <button
              key={o.id}
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={isSelected}
              onClick={() => toggle(o.id)}
              className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-[15px] font-bold transition-colors ${style}`}
            >
              <kbd className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-current/30 text-xs font-extrabold">
                {i + 1}
              </kbd>
              <span>{o.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
