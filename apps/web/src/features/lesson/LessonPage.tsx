import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { getLesson, getQuestion } from '../../content'
import { useProgress } from '../../lib/progress'
import { ExplanationPanel } from '../explain/ExplanationPanel'
import { CheckIcon, CloseIcon, HeartIcon } from '../path/icons'
import { answer, lessonScore, lessonStars, next, progressRatio, startLesson, xpGain } from './lessonLogic'
import { QuestionView } from './QuestionView'

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const lesson = getLesson(lessonId)
  if (!lesson) return <Navigate to="/trilha" replace />
  return <LessonPlayer key={lesson.id} lessonId={lesson.id} questionIds={lesson.questionIds} />
}

function LessonPlayer({ lessonId, questionIds }: { lessonId: string; questionIds: string[] }) {
  const navigate = useNavigate()
  const completeLesson = useProgress((s) => s.completeLesson)
  const [state, setState] = useState(() => startLesson(questionIds))
  const [selected, setSelected] = useState<string[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const saved = useRef(false)
  // Recorde anterior lido na entrada: define quanto XP novo esta tentativa rende.
  const [previousBestXp] = useState(() => useProgress.getState().completed[lessonId]?.bestXp ?? 0)
  const explanationRef = useRef<HTMLElement>(null)

  const question = getQuestion(state.queue[state.index])
  const inFeedback = state.phase === 'feedback'

  // Ao abrir a explicação, rola até ela (a questão continua visível acima).
  useEffect(() => {
    if (showExplanation) explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [showExplanation])

  useEffect(() => {
    if (state.phase === 'finished' && !saved.current) {
      saved.current = true
      completeLesson(lessonId, lessonScore(state), lessonStars(state))
    }
  }, [state, lessonId, completeLesson])

  function check() {
    if (!question || selected.length === 0) return
    const nextState = answer(state, selected, question.correct)
    setState(nextState)
    setShowExplanation(nextState.lastCorrect === false)
  }

  function proceed() {
    setState(next(state))
    setSelected([])
    setShowExplanation(false)
    window.scrollTo({ top: 0 })
  }

  // Atalhos: 1–9 escolhe a opção, Enter verifica/continua.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        if (state.phase !== 'answering' && !inFeedback) return
        e.preventDefault() // evita que o Enter também "clique" no botão focado
        if (state.phase === 'answering') check()
        else if (inFeedback) proceed()
        return
      }
      const n = Number(e.key)
      if (state.phase === 'answering' && question && n >= 1 && n <= question.options.length) {
        const id = question.options[n - 1].id
        setSelected((s) =>
          question.kind === 'multi' ? (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]) : [id],
        )
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (state.phase === 'finished') {
    const stars = lessonStars(state)
    const score = lessonScore(state)
    const gain = xpGain(previousBestXp, score.xp)
    const body =
      previousBestXp > 0 && gain === 0
        ? `Seu recorde nesta lição é ${previousBestXp} XP. Acerte mais de primeira para ganhar XP de novo.`
        : previousBestXp > 0
          ? `Novo recorde: ${score.xp} XP! Você ganha a diferença sobre o recorde anterior.`
          : score.recovered === 0
            ? 'Perfeito, nenhum erro! Bônus de lição perfeita incluído.'
            : `Você revisou ${score.recovered} questão(ões) que errou.`
    return (
      <EndScreen
        title="Lição concluída!"
        emoji="🎉"
        body={body}
        stats={[
          { label: 'Acertos', value: `${score.firstTry}/${score.total}`, color: 'text-green bg-green/10' },
          { label: 'XP', value: `+${gain}`, color: 'text-gold bg-gold/10' },
          { label: 'Estrelas', value: '★'.repeat(stars) + '☆'.repeat(3 - stars), color: 'text-orange bg-orange/10' },
        ]}
        action={{ label: 'Continuar', onClick: () => navigate('/trilha') }}
      />
    )
  }

  if (state.phase === 'failed') {
    return (
      <EndScreen
        title="Seus corações acabaram"
        emoji="💔"
        body="Errar faz parte. Revise as explicações e tente de novo."
        stats={[]}
        action={{
          label: 'Tentar de novo',
          onClick: () => {
            saved.current = false
            setState(startLesson(questionIds))
            setSelected([])
          },
        }}
      />
    )
  }

  if (!question) return <Navigate to="/trilha" replace />

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <header className="flex items-center gap-4 px-4 pb-2 pt-5">
        <Link to="/trilha" aria-label="Sair da lição" className="text-muted hover:text-ink">
          <CloseIcon className="h-6 w-6" />
        </Link>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={Math.round(progressRatio(state, questionIds.length) * 100)}
        >
          <div
            className="h-full rounded-full bg-green shadow-[0_0_12px_rgb(57_255_136/0.6)] transition-[width] duration-500"
            style={{ width: `${Math.max(progressRatio(state, questionIds.length) * 100, 4)}%` }}
          />
        </div>
        <span className="flex items-center gap-1 font-extrabold text-red" aria-label={`${state.hearts} corações`}>
          <HeartIcon className="h-6 w-6" /> {state.hearts}
        </span>
      </header>

      <main className="flex-1 px-4 py-6">
        {state.queue.length > questionIds.length && state.index >= questionIds.length && (
          <p className="mb-3 text-sm font-extrabold uppercase text-orange">↻ Erro anterior</p>
        )}
        <QuestionView
          key={state.index}
          question={question}
          selected={selected}
          onChange={setSelected}
          revealed={inFeedback}
        />
        {inFeedback && showExplanation && (
          <section
            ref={explanationRef}
            className="mt-8 scroll-mt-4 border-t-2 border-line pt-6"
            aria-label="Explicação"
          >
            <ExplanationPanel question={question} selected={selected} />
          </section>
        )}
      </main>

      <footer
        className={`sticky bottom-0 border-t-2 ${
          !inFeedback
            ? 'border-line bg-surface/90 backdrop-blur'
            : state.lastCorrect
              ? 'border-green/30 bg-green-light'
              : 'border-red/30 bg-red-light'
        }`}
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          {inFeedback && (
            <div className="flex items-center gap-3">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface ${state.lastCorrect ? 'text-green' : 'text-red'}`}
              >
                {state.lastCorrect ? <CheckIcon className="h-6 w-6" /> : <CloseIcon className="h-6 w-6" />}
              </span>
              <div>
                <p className={`text-xl font-extrabold leading-tight ${state.lastCorrect ? 'text-green' : 'text-red'}`}>
                  {state.lastCorrect ? 'Muito bem!' : 'Resposta incorreta'}
                </p>
                <button
                  onClick={() => setShowExplanation((v) => !v)}
                  className={`text-sm font-extrabold underline-offset-4 hover:underline ${state.lastCorrect ? 'text-green' : 'text-red'}`}
                >
                  {showExplanation ? 'Ocultar explicação' : 'Ver explicação'}
                </button>
              </div>
            </div>
          )}
          {!inFeedback ? (
            <button
              onClick={check}
              disabled={selected.length === 0}
              className={`btn-3d w-full py-3.5 sm:ml-auto sm:w-48 ${selected.length ? 'border-green-dark bg-green text-on-neon' : 'border-locked-dark bg-locked text-muted'}`}
            >
              Verificar
            </button>
          ) : (
            <button
              onClick={proceed}
              autoFocus
              className={`btn-3d w-full py-3.5 text-on-neon sm:w-48 ${state.lastCorrect ? 'border-green-dark bg-green' : 'border-red-dark bg-red'}`}
            >
              Continuar
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

type EndProps = {
  title: string
  emoji: string
  body: string
  stats: { label: string; value: string; color: string }[]
  action: { label: string; onClick: () => void }
}

function EndScreen({ title, emoji, body, stats, action }: EndProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-7xl">{emoji}</div>
      <h1 className="text-3xl font-black text-magenta [text-shadow:0_0_24px_rgb(255_43_214/0.5)]">{title}</h1>
      <p className="font-bold text-muted">{body}</p>
      {stats.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`min-w-28 clip-corner px-4 py-3 ${s.color}`}>
              <div className="text-xs font-extrabold uppercase tracking-widest">{s.label}</div>
              <div className="font-display text-2xl font-extrabold">{s.value}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex w-full flex-col gap-3">
        <button
          onClick={action.onClick}
          autoFocus
          className="btn-3d w-full border-green-dark bg-green py-3.5 text-on-neon"
        >
          {action.label}
        </button>
        <Link to="/trilha" className="font-extrabold uppercase text-blue">
          Voltar à trilha
        </Link>
      </div>
    </div>
  )
}
