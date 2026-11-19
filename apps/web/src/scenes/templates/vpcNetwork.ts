import { bool, palette, str, type SceneNode, type SceneTemplate } from '../types'

// Params: showNat, publicSubnetLabel, privateSubnetLabel, webLabel, dbLabel
export const vpcNetwork: SceneTemplate = (p) => {
  const nodes: SceneNode[] = [
    {
      id: 'internet',
      label: 'Internet',
      position: [-6.2, 0.7, 0],
      size: [1.4, 1.4, 1.4],
      color: palette.neutral,
      shape: 'cloud',
    },
    {
      id: 'igw',
      label: 'Internet Gateway',
      position: [-3.6, 0.7, 0],
      size: [0.5, 1.4, 1.8],
      color: palette.network,
      shape: 'box',
    },
    {
      id: 'vpc',
      label: 'VPC 10.0.0.0/16',
      position: [1.3, 0.02, 0],
      size: [9.2, 0.04, 6.6],
      color: palette.network,
      shape: 'container',
      labelAnchor: 'back-right',
    },
    {
      id: 'public-subnet',
      label: str(p.publicSubnetLabel, 'Sub-rede pública 10.0.1.0/24'),
      position: [1.3, 0.08, -1.6],
      size: [8.4, 0.04, 2.6],
      color: palette.public,
      shape: 'container',
    },
    {
      id: 'private-subnet',
      label: str(p.privateSubnetLabel, 'Sub-rede privada 10.0.2.0/24'),
      position: [1.3, 0.08, 1.6],
      size: [8.4, 0.04, 2.6],
      color: palette.private,
      shape: 'container',
    },
    {
      id: 'web',
      label: str(p.webLabel, 'EC2 · servidor web'),
      position: [-0.6, 0.5, -1.6],
      size: [1, 0.8, 1],
      color: palette.aws,
      shape: 'box',
    },
    {
      id: 'db',
      label: str(p.dbLabel, 'Banco de dados'),
      position: [3.4, 0.5, 1.6],
      size: [0.9, 0.9, 0.9],
      color: palette.aws,
      shape: 'cylinder',
    },
  ]
  if (bool(p.showNat, true)) {
    nodes.push({
      id: 'nat',
      label: 'NAT Gateway',
      position: [3.4, 0.5, -1.6],
      size: [0.9, 0.7, 0.9],
      color: palette.network,
      shape: 'box',
    })
  }
  return { nodes, camera: [-1, 8.5, 9], target: [0, 0, 0.3], rotateOnPortrait: true }
}
