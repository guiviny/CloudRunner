import { palette, str, type SceneNode, type SceneTemplate } from '../types'

type Tone = keyof typeof palette
type Item = { id: string; label: string; sublabel?: string; shape?: 'box' | 'cylinder' }
type Group = { id: string; label: string; tone?: Tone; items: Item[] }

const COLS = 2
const STEP_X = 3
const STEP_Z = 1.8

// Params: groups [{ id, label, tone, items: [{ id, label, sublabel?, shape? }] }], source?, sourceSublabel?
// Grupos lado a lado; o nó "source" (opcional) fica na frente, de onde saem os pacotes.
export const catalog: SceneTemplate = (p) => {
  const groups = (Array.isArray(p.groups) ? p.groups : []) as Group[]
  const nodes: SceneNode[] = []
  const sizes = groups.map((g) => {
    const cols = Math.min(COLS, Math.max(1, g.items.length))
    return { cols, w: cols * STEP_X + 0.4, d: Math.ceil(g.items.length / cols) * STEP_Z + 0.9 }
  })
  const totalW = sizes.reduce((s, g) => s + g.w, 0) + (groups.length - 1) * 0.8
  const hasSource = typeof p.source === 'string'
  let x = -totalW / 2

  groups.forEach((g, gi) => {
    const { cols, w, d } = sizes[gi]
    const color = palette[g.tone ?? 'aws'] ?? palette.aws
    nodes.push({
      id: g.id,
      label: g.label,
      position: [x + w / 2, 0.02, 0],
      size: [w, 0.04, d],
      color,
      shape: 'container',
    })
    g.items.forEach((it, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const cyl = (it.shape ?? 'cylinder') === 'cylinder'
      nodes.push({
        id: it.id,
        label: it.label,
        sublabel: it.sublabel,
        position: [x + 0.2 + STEP_X * (col + 0.5), 0.45, -d / 2 + 0.55 + STEP_Z * (row + 0.5)],
        size: cyl ? [0.8, 0.8, 0.8] : [0.9, 0.7, 0.9],
        color,
        shape: cyl ? 'cylinder' : 'box',
      })
    })
    x += w + 0.8
  })

  if (hasSource) {
    nodes.push({
      id: 'source',
      label: str(p.source, ''),
      sublabel: typeof p.sourceSublabel === 'string' ? p.sourceSublabel : undefined,
      position: [0, 0.5, Math.max(...sizes.map((g) => g.d)) / 2 + 2.4],
      size: [1.6, 0.9, 1.2],
      color: palette.neutral,
      shape: 'box',
    })
  }
  return { nodes, camera: [0, 8, 6.5], target: [0, 0, 0.6], rotateOnPortrait: true }
}
