export type Vec3 = [number, number, number]

export type NodeShape = 'box' | 'container' | 'cylinder' | 'cloud' | 'wall' | 'slab'

export type SceneNode = {
  id: string
  label: string
  sublabel?: string
  position: Vec3
  size: Vec3
  color: string
  shape: NodeShape
  // onde fica o rótulo de contêineres (padrão: canto frontal esquerdo)
  labelAnchor?: 'front-left' | 'back-left' | 'back-right'
}

export type SceneLayout = {
  nodes: SceneNode[]
  camera: Vec3
  target: Vec3
  // layouts largos giram 90° em telas em pé para usar a altura
  rotateOnPortrait?: boolean
}

export type SceneTemplate = (params: Record<string, unknown>) => SceneLayout

export const palette = {
  aws: '#FF9E1F',
  customer: '#00E5FF',
  network: '#B26BFF',
  public: '#39FF88',
  private: '#00E5FF',
  neutral: '#6B7299',
  danger: '#FF2E63',
}

export const str = (v: unknown, fallback: string) => (typeof v === 'string' && v.length > 0 ? v : fallback)
export const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)
