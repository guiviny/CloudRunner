import { palette, str, type SceneNode, type SceneTemplate } from '../types'

const layer = (id: string, label: string, level: number, owner: 'aws' | 'customer', sublabel?: string): SceneNode => ({
  id,
  label,
  sublabel,
  position: [0, 0.3 + level * 0.8, 0],
  size: [5, 0.55, 3],
  color: owner === 'aws' ? palette.aws : palette.customer,
  shape: 'slab',
})

// Params: managedService (ex.: "RDS") passa a camada do SO para a AWS
export const sharedResponsibility: SceneTemplate = (p) => {
  const managed = typeof p.managedService === 'string' ? p.managedService : null
  return {
    nodes: [
      layer('aws-infra', 'Hardware e infraestrutura global', 0, 'aws', 'AWS · Regiões, AZs, edge locations'),
      layer('aws-services', 'Computação, armazenamento, banco, rede', 1, 'aws', 'AWS · software dos serviços'),
      layer('cust-network', 'Criptografia e proteção do tráfego', 2, 'customer', 'Cliente'),
      managed
        ? layer('cust-os', `SO e patches do banco`, 3, 'aws', `AWS · gerenciado no ${str(managed, '')}`)
        : layer('cust-os', 'Sistema operacional, rede e firewall', 3, 'customer', 'Cliente · patches, security groups'),
      layer('cust-iam', 'Plataforma, aplicações e IAM', 4, 'customer', 'Cliente'),
      layer('cust-data', 'Dados do cliente', 5, 'customer', 'Cliente'),
    ],
    camera: [6, 4.5, 8],
    target: [0, 2.2, 0],
  }
}
