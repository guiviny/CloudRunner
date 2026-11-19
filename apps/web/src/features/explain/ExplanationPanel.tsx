import { lazy, Suspense, useState, type ReactNode } from 'react'
import type { Question } from '../../content/schema'
import { CheckIcon, CloseIcon } from '../path/icons'

const SceneView = lazy(() => import('../../scenes/SceneView'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

type Props = { question: Question; selected: string[] }

export function ExplanationPanel({ question, selected }: Props) {
  const { explanation } = question
  const scene = explanation.scene
  const [step, setStep] = useState(0)
  const [webgl] = useState(hasWebGL)

  const correctOptions = question.options.filter((o) => question.correct.includes(o.id))
  const wrongPicks = question.options.filter((o) => selected.includes(o.id) && !question.correct.includes(o.id))
  const otherWrong = question.options.filter((o) => !selected.includes(o.id) && !question.correct.includes(o.id))

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border-2 border-blue/40 bg-blue-light p-4">
        <SectionTitle className="text-blue">💡 Ideia-chave</SectionTitle>
        <p className="text-lg font-extrabold leading-snug text-ink">{explanation.summary}</p>
      </div>

      {scene && (
        <div>
          <SectionTitle>Veja na prática</SectionTitle>
          <figure className="overflow-hidden rounded-2xl border-2 border-line bg-bg">
            {webgl ? (
              <div className="h-[26rem] sm:h-80" aria-label="Animação 3D da explicação">
                <Suspense
                  fallback={
                    <div className="grid h-full place-items-center font-bold text-muted">Carregando cena 3D…</div>
                  }
                >
                  <SceneView scene={scene} stepIndex={step} />
                </Suspense>
              </div>
            ) : (
              <ol className="list-decimal space-y-1 p-4 pl-8 text-sm font-semibold">
                {scene.steps.map((s, i) => (
                  <li key={i}>{s.caption}</li>
                ))}
              </ol>
            )}
            {webgl && (
              <figcaption className="flex items-center gap-3 border-t-2 border-line bg-surface p-3">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  aria-label="Passo anterior"
                  className="btn-3d border-2 border-b-4 border-line bg-surface-2 px-3.5 py-1.5 text-lg text-muted disabled:opacity-40"
                >
                  ‹
                </button>
                <div className="flex-1 text-center">
                  <p className="text-xs font-extrabold uppercase text-muted">
                    Passo {step + 1} de {scene.steps.length}
                  </p>
                  <p className="mt-0.5 text-[15px] font-bold leading-snug">{scene.steps[step].caption}</p>
                  <div className="mt-2 flex justify-center gap-1.5">
                    {scene.steps.map((_, i) => (
                      <button
                        key={i}
                        aria-label={`Passo ${i + 1}`}
                        onClick={() => setStep(i)}
                        className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-blue' : 'w-2 bg-line'}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setStep((s) => Math.min(scene.steps.length - 1, s + 1))}
                  disabled={step === scene.steps.length - 1}
                  aria-label="Próximo passo"
                  className="btn-3d border-blue-dark bg-blue px-3.5 py-1.5 text-lg text-on-neon disabled:opacity-40"
                >
                  ›
                </button>
              </figcaption>
            )}
          </figure>
        </div>
      )}

      <div>
        <SectionTitle className="text-green">
          {correctOptions.length > 1 ? 'Alternativas corretas' : 'Alternativa correta'}
        </SectionTitle>
        <div className="flex flex-col gap-2">
          {correctOptions.map((o) => (
            <OptionCard
              key={o.id}
              tone="correct"
              text={o.text}
              badge={selected.includes(o.id) ? 'Você marcou' : 'Faltou marcar'}
              badgeMissed={!selected.includes(o.id)}
            />
          ))}
        </div>
        <p className="mt-3 text-[15px] font-semibold leading-relaxed">{explanation.whyCorrect}</p>
      </div>

      {wrongPicks.length > 0 && (
        <div>
          <SectionTitle className="text-red">
            {wrongPicks.length > 1 ? 'Suas escolhas incorretas' : 'Sua escolha'}
          </SectionTitle>
          <div className="flex flex-col gap-2">
            {wrongPicks.map((o) => (
              <OptionCard key={o.id} tone="wrong" text={o.text}>
                {explanation.whyOthersWrong[o.id]}
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {otherWrong.length > 0 && (
        <details className="group rounded-2xl border-2 border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-extrabold uppercase text-muted">
            Por que as outras também estão erradas
            <span className="transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="flex flex-col gap-2 px-3 pb-3">
            {otherWrong.map((o) => (
              <OptionCard key={o.id} tone="neutral" text={o.text}>
                {explanation.whyOthersWrong[o.id]}
              </OptionCard>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function SectionTitle({ children, className = 'text-muted' }: { children: ReactNode; className?: string }) {
  return <h3 className={`mb-2 text-xs font-extrabold uppercase tracking-wider ${className}`}>{children}</h3>
}

const toneStyles = {
  correct: { card: 'border-green bg-green-light/50', icon: 'bg-green text-on-neon', Icon: CheckIcon },
  wrong: { card: 'border-red bg-red-light/50', icon: 'bg-red text-on-neon', Icon: CloseIcon },
  neutral: { card: 'border-line bg-surface', icon: 'bg-line text-muted', Icon: CloseIcon },
}

type OptionCardProps = {
  tone: keyof typeof toneStyles
  text: string
  badge?: string
  badgeMissed?: boolean
  children?: ReactNode
}

function OptionCard({ tone, text, badge, badgeMissed, children }: OptionCardProps) {
  const { card, icon, Icon } = toneStyles[tone]
  return (
    <div className={`flex gap-3 rounded-2xl border-2 p-3 ${card}`}>
      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${icon}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <p className="text-[15px] font-extrabold leading-snug">{text}</p>
          {badge && (
            <span className={`text-xs font-extrabold uppercase ${badgeMissed ? 'text-orange' : 'text-green'}`}>
              {badge}
            </span>
          )}
        </div>
        {children && <p className="mt-1 text-sm font-semibold leading-relaxed text-muted">{children}</p>}
      </div>
    </div>
  )
}
