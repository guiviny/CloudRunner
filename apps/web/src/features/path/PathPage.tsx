import { Link } from 'react-router'
import { isLessonUnlocked, sections } from '../../content'
import type { Lesson, Section, Unit } from '../../content/schema'
import { useProgress } from '../../lib/progress'
import { ChestIcon, CheckIcon, DumbbellIcon, StarIcon, TrophyIcon } from './icons'
import { TopBar } from './TopBar'

// Deslocamento horizontal (px) que forma o caminho em zigue-zague.
const ZIGZAG = [0, 44, 70, 44, 0, -44, -70, -44]

export function PathPage() {
  return (
    <div className="min-h-screen pb-24">
      <TopBar />
      <main className="mx-auto max-w-lg">
        {sections.map((s) => (
          <SectionPath key={s.id} section={s} />
        ))}
      </main>
    </div>
  )
}

function SectionPath({ section }: { section: Section }) {
  return (
    <>
      {section.units.map((unit, i) => (
        <UnitPath key={unit.id} section={section} unit={unit} unitNumber={i + 1} />
      ))}
    </>
  )
}

type PathItem =
  { kind: 'lesson'; lesson: Lesson } | { kind: 'chest'; id: string; afterLessonId: string } | { kind: 'trophy' }

function UnitPath({ section, unit, unitNumber }: { section: Section; unit: Unit; unitNumber: number }) {
  const completed = useProgress((s) => s.completed)
  const openedChests = useProgress((s) => s.openedChests)
  const openChest = useProgress((s) => s.openChest)

  const items: PathItem[] = []
  unit.lessons.forEach((lesson, i) => {
    items.push({ kind: 'lesson', lesson })
    if (unit.chestAfter === i) items.push({ kind: 'chest', id: `${unit.id}-chest`, afterLessonId: lesson.id })
  })
  items.push({ kind: 'trophy' })

  const unitDone = unit.lessons.every((l) => completed[l.id])

  return (
    <section className="px-4 pt-6">
      <div className="mb-14 clip-corner bg-green px-5 py-4 text-on-neon">
        <p className="font-display text-xs font-bold uppercase tracking-widest opacity-75">
          Seção {section.number} {'//'} unidade {unitNumber}
        </p>
        <h2 className="text-xl font-extrabold leading-tight">{unit.title}</h2>
      </div>
      <ol className="flex flex-col items-center gap-10">
        {items.map((item, i) => (
          <li key={i} style={{ transform: `translateX(${ZIGZAG[i % ZIGZAG.length]}px)` }}>
            {item.kind === 'lesson' && <LessonNode unit={unit} lesson={item.lesson} />}
            {item.kind === 'chest' && (
              <button
                aria-label="Baú de recompensa"
                disabled={!completed[item.afterLessonId] || openedChests.includes(item.id)}
                onClick={() => openChest(item.id)}
                className={`block transition-transform ${completed[item.afterLessonId] && !openedChests.includes(item.id) ? 'animate-bounce hover:scale-110' : ''}`}
              >
                <ChestIcon className="h-16 w-16" open={openedChests.includes(item.id)} />
              </button>
            )}
            {item.kind === 'trophy' && (
              <div
                title={unitDone ? 'Unidade concluída' : 'Conclua a unidade'}
                className={`grid h-16 w-16 place-items-center rounded-full ${unitDone ? 'bg-gold text-on-neon shadow-[0_6px_0_var(--color-gold-dark),0_0_20px_rgb(255_214_10/0.3)]' : 'bg-locked text-muted shadow-[0_6px_0_var(--color-locked-dark)]'}`}
              >
                <TrophyIcon className="h-8 w-8" />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function LessonNode({ unit, lesson }: { unit: Unit; lesson: Lesson }) {
  const completed = useProgress((s) => s.completed)
  const done = Boolean(completed[lesson.id])
  const unlocked = isLessonUnlocked(unit, lesson.id, completed)
  const current = unlocked && !done

  const Icon = done ? CheckIcon : lesson.type === 'practice' ? DumbbellIcon : StarIcon
  const color = done
    ? 'bg-gold text-on-neon shadow-[0_8px_0_var(--color-gold-dark),0_0_20px_rgb(255_214_10/0.3)]'
    : current
      ? 'bg-green text-on-neon shadow-[0_8px_0_var(--color-green-dark),0_0_28px_rgb(57_255_136/0.45)]'
      : 'bg-locked text-muted shadow-[0_8px_0_var(--color-locked-dark)]'

  const node = (
    <span
      className={`grid h-[66px] w-[72px] place-items-center rounded-[50%] transition-transform active:translate-y-1.5 active:shadow-none ${color}`}
    >
      <Icon className="h-8 w-8" />
    </span>
  )

  return (
    <div className="relative flex flex-col items-center">
      {current && (
        <span className="absolute -top-11 z-10 animate-bounce whitespace-nowrap rounded-xl border-2 border-green/60 bg-surface px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-widest text-green shadow-[0_0_14px_rgb(57_255_136/0.3)]">
          Começar
        </span>
      )}
      {unlocked ? (
        <Link to={`/licao/${lesson.id}`} aria-label={lesson.title} title={lesson.title}>
          {node}
        </Link>
      ) : (
        <span aria-label={`${lesson.title} (bloqueada)`} title="Conclua a lição anterior desta unidade">
          {node}
        </span>
      )}
    </div>
  )
}
