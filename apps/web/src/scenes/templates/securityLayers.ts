import { palette, str, type SceneTemplate } from '../types'

// Params: naclRule, sgRule
export const securityLayers: SceneTemplate = (p) => ({
  nodes: [
    {
      id: 'internet',
      label: 'Internet',
      position: [-5.5, 0.8, 0],
      size: [1.4, 1.4, 1.4],
      color: palette.neutral,
      shape: 'cloud',
    },
    {
      id: 'subnet',
      label: 'Sub-rede',
      position: [1.3, 0.02, 0],
      size: [7.4, 0.04, 4.4],
      color: palette.public,
      shape: 'container',
    },
    {
      id: 'nacl',
      label: 'Network ACL · stateless',
      sublabel: str(p.naclRule, 'ALLOW 0.0.0.0/0'),
      position: [-2.4, 1, 0],
      size: [0.15, 2, 4.4],
      color: palette.network,
      shape: 'wall',
    },
    {
      id: 'sg',
      label: 'Security Group · stateful',
      sublabel: str(p.sgRule, 'ALLOW TCP 443'),
      position: [1.6, 0.8, 0],
      size: [0.12, 1.6, 2.2],
      color: palette.aws,
      shape: 'wall',
    },
    { id: 'ec2', label: 'EC2', position: [3.4, 0.5, 0], size: [1, 0.8, 1], color: palette.aws, shape: 'box' },
  ],
  camera: [-1.5, 5, 9],
  target: [0, 0.6, 0],
  rotateOnPortrait: true,
})
