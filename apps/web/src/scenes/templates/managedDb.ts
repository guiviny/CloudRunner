import { palette, str, type SceneNode, type SceneTemplate } from '../types'

const layers = [
  ['hw', 'Hardware e data center'],
  ['os', 'Sistema operacional'],
  ['patch', 'Instalação e patches do banco'],
  ['backup', 'Backups'],
  ['ha', 'Alta disponibilidade e escala'],
  ['data', 'Dados, esquema e consultas'],
] as const

// Quem cuida de cada camada: no EC2 só o hardware é da AWS; no RDS, só os dados ficam com você.
const stack = (prefix: 'ec2' | 'rds', x: number, title: string): SceneNode[] => [
  {
    id: `${prefix}-stack`,
    label: title,
    position: [x, 0.02, 0],
    size: [5, 0.04, 3.4],
    color: palette.neutral,
    shape: 'container',
  },
  ...layers.map(([id, label], level): SceneNode => {
    const aws = id === 'hw' || (prefix === 'rds' && id !== 'data')
    return {
      id: `${prefix}-${id}`,
      label,
      sublabel: aws ? 'AWS' : 'Você',
      position: [x, 0.35 + level * 0.8, 0],
      size: [4.4, 0.55, 2.6],
      color: aws ? palette.aws : palette.customer,
      shape: 'slab',
    }
  }),
]

// Params: leftLabel, rightLabel
export const managedDb: SceneTemplate = (p) => ({
  nodes: [
    ...stack('ec2', -3, str(p.leftLabel, 'Banco instalado no EC2 · não gerenciado')),
    ...stack('rds', 3, str(p.rightLabel, 'Amazon RDS · gerenciado')),
  ],
  camera: [0, 4.5, 11],
  target: [0, 2.2, 0],
})
