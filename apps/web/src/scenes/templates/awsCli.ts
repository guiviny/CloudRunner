import { palette, str, type SceneTemplate } from '../types'

// Params: command, dbStatus
export const awsCli: SceneTemplate = (p) => ({
  nodes: [
    {
      id: 'terminal',
      label: str(p.command, 'aws rds …'),
      sublabel: 'Terminal · AWS CLI',
      position: [-5.4, 0.55, 0.2],
      size: [1.6, 1, 1.2],
      color: palette.neutral,
      shape: 'box',
    },
    {
      id: 'rds-api',
      label: 'API do Amazon RDS',
      sublabel: 'aws rds …',
      position: [-1.6, 0.5, -1.4],
      size: [1.2, 0.8, 1.1],
      color: palette.network,
      shape: 'box',
    },
    {
      id: 'ec2-api',
      label: 'API do Amazon EC2',
      sublabel: 'aws ec2 …',
      position: [-1.6, 0.5, 1.8],
      size: [1.2, 0.8, 1.1],
      color: palette.network,
      shape: 'box',
    },
    {
      id: 'db',
      label: 'Instância RDS',
      sublabel: str(p.dbStatus, 'status: available'),
      position: [2.1, 0.55, -1.4],
      size: [1.1, 1, 1.1],
      color: palette.aws,
      shape: 'cylinder',
    },
    {
      id: 'snapshot',
      label: 'Snapshot manual',
      position: [5.2, 0.45, -1.4],
      size: [1, 0.8, 1],
      color: palette.customer,
      shape: 'box',
    },
    {
      id: 'ec2',
      label: 'EC2 · volume EBS',
      position: [2.1, 0.5, 1.8],
      size: [1, 0.8, 1],
      color: palette.aws,
      shape: 'box',
    },
  ],
  camera: [-0.5, 7, 9],
  target: [0, 0, 0.2],
  rotateOnPortrait: true,
})
