import { useEffect, useRef } from 'react'

const NAME = 'CloudRunner'
// Intervalo entre quadros do glitch (ms): passos secos, não uma animação suave
const FRAME_MS = 60
// Ao montar, um glitch curto para a logo "ligar"
const BOOT_MS = 450

// Cada camada é uma cópia do nome, recortada numa faixa e deslocada na horizontal
const LAYERS = [
  { color: 'var(--color-magenta)', maxShift: 0.09 },
  { color: 'var(--color-ink)', maxShift: 0.06 },
  { color: 'var(--color-green)', maxShift: 0.12 },
]

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Logo CloudRunner em neon, com glitch gerado em código ao passar o cursor. */
export function Logo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const baseRef = useRef<HTMLSpanElement>(null)
  const layerRefs = useRef<(HTMLSpanElement | null)[]>([])
  const timer = useRef<number | undefined>(undefined)

  const frame = () => {
    layerRefs.current.forEach((el, i) => {
      if (!el) return
      // Às vezes a camada some num quadro, o que deixa o efeito irregular
      if (Math.random() < 0.25) {
        el.removeAttribute('data-on')
        return
      }
      const top = rand(0, 85)
      const height = rand(4, 22)
      const shift = rand(-1, 1) * LAYERS[i].maxShift
      el.setAttribute('data-on', '')
      el.style.clipPath = `inset(${top}% 0 ${Math.max(0, 100 - top - height)}% 0)`
      el.style.transform = `translateX(${shift}em)`
    })
    const base = baseRef.current
    if (base) {
      const jitter = Math.random() < 0.3 ? rand(-0.02, 0.02) : 0
      base.style.transform = `translateX(${jitter}em) skewX(${jitter * 120}deg)`
    }
  }

  const stop = () => {
    window.clearInterval(timer.current)
    timer.current = undefined
    layerRefs.current.forEach((el) => el?.removeAttribute('data-on'))
    if (baseRef.current) baseRef.current.style.transform = ''
  }

  const start = () => {
    if (timer.current !== undefined) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    frame()
    timer.current = window.setInterval(frame, FRAME_MS)
  }

  useEffect(() => {
    start()
    const boot = window.setTimeout(stop, BOOT_MS)
    return () => {
      window.clearTimeout(boot)
      stop()
    }
    // start/stop só mexem em refs, então rodar uma vez ao montar basta
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const text = size === 'lg' ? 'text-[clamp(2.25rem,11vw,6.5rem)]' : 'text-[1.6rem]'
  return (
    <span role="img" aria-label={NAME} className={`cr-logo ${text}`} onPointerEnter={start} onPointerLeave={stop}>
      <span ref={baseRef} aria-hidden="true" className="cr-logo-base">
        {NAME}
      </span>
      {LAYERS.map((layer, i) => (
        <span
          key={layer.color}
          ref={(el) => {
            layerRefs.current[i] = el
          }}
          aria-hidden="true"
          className="cr-logo-gl"
          style={{ color: layer.color }}
        >
          {NAME}
        </span>
      ))}
    </span>
  )
}
