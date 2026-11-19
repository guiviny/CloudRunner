import { palette, str, type SceneTemplate } from '../types'

// Params: primaryLabel, standbyLabel. Mesmo desenho do slide: duas AZs na mesma VPC.
export const rdsMultiAz: SceneTemplate = (p) => ({
  nodes: [
    {
      id: 'vpc',
      label: 'VPC · uma região',
      position: [0, 0.02, -0.2],
      size: [11.6, 0.04, 8.4],
      color: palette.network,
      shape: 'container',
    },
    {
      id: 'az-1',
      label: 'Zona de disponibilidade 1',
      position: [-2.9, 0.06, 0],
      size: [5.2, 0.04, 6.2],
      color: palette.public,
      shape: 'container',
    },
    {
      id: 'az-2',
      label: 'Zona de disponibilidade 2',
      position: [2.9, 0.06, 0],
      size: [5.2, 0.04, 6.2],
      color: palette.public,
      shape: 'container',
    },
    {
      id: 'app-1',
      label: 'EC2 · aplicativo',
      position: [-2.9, 0.5, -1.4],
      size: [1, 0.8, 1],
      color: palette.aws,
      shape: 'box',
    },
    {
      id: 'app-2',
      label: 'EC2 · aplicativo',
      position: [2.9, 0.5, -1.4],
      size: [1, 0.8, 1],
      color: palette.aws,
      shape: 'box',
    },
    {
      id: 'primary',
      label: str(p.primaryLabel, 'RDS · primária'),
      position: [-2.9, 0.55, 1.6],
      size: [1.1, 1, 1.1],
      color: palette.aws,
      shape: 'cylinder',
    },
    {
      id: 'standby',
      label: str(p.standbyLabel, 'RDS · em espera'),
      position: [2.9, 0.55, 1.6],
      size: [1.1, 1, 1.1],
      color: palette.customer,
      shape: 'cylinder',
    },
  ],
  camera: [0, 8, 9],
  target: [0, 0, 0.3],
  rotateOnPortrait: true,
})
