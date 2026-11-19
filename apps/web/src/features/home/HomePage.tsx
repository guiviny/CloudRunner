import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { sections } from '../../content'
import { allTopics } from '../../content/roadmap'
import { useProgress } from '../../lib/progress'
import { Logo } from '../../components/Logo'
import { TopBar } from '../path/TopBar'

const allLessons = sections.flatMap((s) => s.units.flatMap((u) => u.lessons))

export function HomePage() {
  const completed = useProgress((s) => s.completed)
  const studied = useProgress((s) => s.studiedTopics)
  const lessonsDone = allLessons.filter((l) => completed[l.id]).length
  const topicsDone = allTopics.filter((t) => studied.includes(t.id)).length

  return (
    <div className="min-h-screen pb-16">
      <TopBar />
      <main className="mx-auto max-w-3xl px-4">
        <header className="pt-10 pb-8 text-center">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-magenta">
            AWS re/Start // CLF-C02
          </p>
          <h1 className="mt-3">
            <Logo />
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-muted">O que você quer fazer agora?</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <MenuCard
            to="/roadmap"
            emoji="🗺️"
            title="Roadmap"
            description="Estude cada tema da prova com materiais gratuitos e oficiais: documentação, cursos e vídeo aulas."
            cta="Estudar"
            done={topicsDone}
            total={allTopics.length}
            unit="tópicos"
            tone="blue"
          />
          <MenuCard
            to="/trilha"
            emoji="🧭"
            title="Trilha de questões"
            description="Pratique com questões no estilo da prova, com explicação e cena 3D quando você erra."
            cta="Praticar"
            done={lessonsDone}
            total={allLessons.length}
            unit="lições"
            tone="green"
          />
        </div>

        <Link
          to="/ranking"
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-line bg-surface py-3 font-display text-sm font-extrabold text-gold transition-colors hover:border-gold"
        >
          🏆 Ver o ranking
        </Link>

        <p className="mt-8 text-center text-xs font-bold text-muted">
          Dica: leia o tópico no roadmap e depois pratique na trilha. Os tópicos com 🎯 levam direto às questões.
        </p>
      </main>
    </div>
  )
}

const tones = {
  green: {
    hover: 'hover:border-green hover:shadow-[0_6px_0_var(--color-green-dark),0_0_28px_rgb(57_255_136/0.3)]',
    bar: 'bg-green',
    btn: 'border-green-dark bg-green',
    text: 'text-green',
  },
  blue: {
    hover: 'hover:border-blue hover:shadow-[0_6px_0_var(--color-blue-dark),0_0_28px_rgb(0_229_255/0.3)]',
    bar: 'bg-blue',
    btn: 'border-blue-dark bg-blue',
    text: 'text-blue',
  },
}

type CardProps = {
  to: string
  emoji: ReactNode
  title: string
  description: string
  cta: string
  done: number
  total: number
  unit: string
  tone: keyof typeof tones
}

function MenuCard({ to, emoji, title, description, cta, done, total, unit, tone }: CardProps) {
  const t = tones[tone]
  return (
    <Link
      to={to}
      className={`group flex flex-col gap-4 rounded-3xl border-2 border-line bg-surface p-6 shadow-[0_6px_0_var(--color-locked-dark)] transition-[border,box-shadow,transform] active:translate-y-1 active:shadow-none ${t.hover}`}
    >
      <span className="text-5xl">{emoji}</span>
      <div className="flex-1">
        <h2 className={`text-xl font-extrabold ${t.text}`}>{title}</h2>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-muted">{description}</p>
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-xs font-extrabold uppercase text-muted">
          <span>Progresso</span>
          <span className={t.text}>
            {done} de {total} {unit}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-locked">
          <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>
      <span className={`btn-3d py-3 text-center text-sm text-on-neon ${t.btn}`}>{cta}</span>
    </Link>
  )
}
