import { Edges, Html, OrbitControls, RoundedBox } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import type { Scene, SceneStep } from '../content/schema'
import { templates } from './templates'
import { palette, type SceneNode, type Vec3 } from './types'

type Props = { scene: Scene; stepIndex: number }

// Carregado sob demanda (React.lazy) apenas quando há explicação para mostrar.
export default function SceneView({ scene, stepIndex }: Props) {
  const layout = useMemo(() => templates[scene.template](scene.params), [scene])
  const step = scene.steps[Math.min(stepIndex, scene.steps.length - 1)]
  const focus = new Set([...step.focus, ...step.alert])
  const alert = new Set(step.alert)
  // Layouts largos em tela estreita: gira a cena 90° e olha mais de cima, para o eixo longo ocupar a altura.
  const rotated = usePortrait() && Boolean(layout.rotateOnPortrait)
  const camera: Vec3 = rotated ? [0, 12, 6] : layout.camera
  // Os rótulos <Html> vão para esta camada fixa. Sem ela, o drei usa o parentNode do canvas, que ainda é null
  // no primeiro render; a troca de alvo recria a raiz no mesmo elemento e o rótulo do primeiro nó some.
  const labels = useRef<HTMLDivElement>(null!)

  return (
    <div className="relative h-full w-full">
      <Canvas key={String(rotated)} camera={{ position: camera, fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={['#0A0B14']} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 10, 6]} intensity={1.1} />
        <gridHelper args={[40, 40, '#2A2F55', '#161936']} position={[0, -0.02, 0]} />
        <FitCamera nodes={layout.nodes} target={layout.target} rotated={rotated} />
        <group rotation={[0, rotated ? Math.PI / 2 : 0, 0]}>
          {layout.nodes.map((n) => (
            <NodeMesh
              key={n.id}
              node={{ ...n, label: step.labels[n.id] ?? n.label, color: alert.has(n.id) ? palette.danger : n.color }}
              state={focus.size === 0 ? 'normal' : focus.has(n.id) ? 'focus' : 'dim'}
              labels={labels}
            />
          ))}
          {step.packet && <Packet key={stepIndex} step={step} nodes={layout.nodes} labels={labels} />}
        </group>
        <OrbitControls
          makeDefault
          target={rotated ? [layout.target[2], layout.target[1], -layout.target[0]] : layout.target}
          enablePan={false}
          minDistance={3}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
      <div ref={labels} className="pointer-events-none absolute inset-0 overflow-hidden" />
    </div>
  )
}

// Mesmo breakpoint (sm) que deixa o canvas mais alto que largo no painel de explicação.
const PORTRAIT_QUERY = '(max-width: 639px)'

function usePortrait() {
  const [portrait, setPortrait] = useState(() => window.matchMedia(PORTRAIT_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(PORTRAIT_QUERY)
    const onChange = () => setPortrait(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return portrait
}

const FIT_MARGIN = 0.9 // fração da tela (NDC) que a cena pode ocupar

// Aproxima a câmera ao máximo mantendo todos os cantos da cena visíveis, para qualquer proporção de tela.
function FitCamera({ nodes, target, rotated }: { nodes: SceneNode[]; target: Vec3; rotated: boolean }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  useLayoutEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      // A câmera do R3F é um objeto Three.js mutável; ajustá-la aqui é o padrão da biblioteca.
      // oxlint-disable-next-line react/immutability
      camera.aspect = size.width / size.height
      camera.updateProjectionMatrix()
    }
    const rot = new THREE.Matrix4().makeRotationY(rotated ? Math.PI / 2 : 0)
    const corners: THREE.Vector3[] = []
    for (const n of nodes) {
      const [x, y, z] = n.position
      const [w, h, d] = n.size
      for (const sx of [-1, 1])
        for (const sy of [-1, 1])
          for (const sz of [-1, 1]) {
            corners.push(
              new THREE.Vector3(x + (sx * w) / 2, y + (sy * h) / 2 + (sy > 0 ? 0.5 : 0), z + (sz * d) / 2).applyMatrix4(
                rot,
              ),
            )
          }
    }
    const center = new THREE.Vector3(...target).applyMatrix4(rot)
    const dir = camera.position.clone().sub(center).normalize()
    const fits = (dist: number) => {
      camera.position.copy(center).addScaledVector(dir, dist)
      camera.lookAt(center)
      camera.updateMatrixWorld()
      return corners.every((c) => {
        const p = c.clone().project(camera)
        return Math.abs(p.x) <= FIT_MARGIN && Math.abs(p.y) <= FIT_MARGIN && p.z < 1
      })
    }
    let lo = 1
    let hi = 60
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (fits(mid)) hi = mid
      else lo = mid
    }
    fits(hi)
  }, [camera, size, nodes, target, rotated])

  return null
}

type NodeState = 'normal' | 'focus' | 'dim'

type Labels = RefObject<HTMLDivElement>

function NodeMesh({ node, state, labels }: { node: SceneNode; state: NodeState; labels: Labels }) {
  const ref = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!ref.current || !material.current) return
    const pulse = state === 'focus' && node.shape !== 'container' ? 1 + Math.sin(clock.elapsedTime * 4) * 0.04 : 1
    ref.current.scale.setScalar(pulse)
    const targetOpacity = state === 'dim' ? 0.18 : node.shape === 'container' ? 0.22 : node.shape === 'wall' ? 0.6 : 1
    material.current.opacity = THREE.MathUtils.lerp(material.current.opacity, targetOpacity, 0.15)
    // brilho neon: base fraca em tudo, foco pulsando forte
    material.current.emissiveIntensity =
      state === 'focus' ? 0.6 + Math.sin(clock.elapsedTime * 4) * 0.2 : state === 'dim' ? 0 : 0.12
  })

  const [w, h, d] = node.size
  const mat = (
    <meshStandardMaterial
      ref={material}
      color={node.color}
      emissive={node.color}
      transparent
      opacity={1}
      depthWrite={node.shape !== 'container' && node.shape !== 'wall'}
    />
  )

  const labelY = node.shape === 'container' ? 0.05 : h / 2 + 0.35
  const anchor = node.labelAnchor ?? 'front-left'
  const labelPos: Vec3 =
    node.shape === 'container'
      ? [
          anchor === 'back-right' ? w / 2 - 2.4 : -w / 2 + 0.2,
          labelY,
          anchor === 'front-left' ? d / 2 - 0.45 : -d / 2 + 0.25,
        ]
      : node.shape === 'slab'
        ? [0, 0, d / 2 + 0.05]
        : [0, labelY, 0]

  return (
    <group ref={ref} position={node.position}>
      {node.shape === 'cylinder' ? (
        <mesh>
          <cylinderGeometry args={[w / 2, w / 2, h, 32]} />
          {mat}
        </mesh>
      ) : node.shape === 'cloud' ? (
        <group>
          {[
            [0, 0, 0, 0.55],
            [-0.45, -0.15, 0.1, 0.4],
            [0.45, -0.15, -0.1, 0.42],
            [0.1, 0.3, 0.1, 0.4],
          ].map(([x, y, z, r], i) => (
            <mesh key={i} position={[x * w, y * w, z * w]}>
              <sphereGeometry args={[r * w, 24, 24]} />
              {i === 0 ? (
                mat
              ) : (
                <meshStandardMaterial
                  color={node.color}
                  emissive={node.color}
                  emissiveIntensity={state === 'focus' ? 0.6 : state === 'dim' ? 0 : 0.12}
                  transparent
                  opacity={state === 'dim' ? 0.18 : 1}
                />
              )}
            </mesh>
          ))}
        </group>
      ) : node.shape === 'container' || node.shape === 'wall' ? (
        <mesh>
          <boxGeometry args={[w, h, d]} />
          {mat}
          <Edges color={node.color} />
        </mesh>
      ) : (
        <RoundedBox args={[w, h, d]} radius={Math.min(w, h, d) * 0.15}>
          {mat}
        </RoundedBox>
      )}
      <Html portal={labels} position={labelPos} center={node.shape !== 'container'} zIndexRange={[10, 0]}>
        <div
          className={`pointer-events-none whitespace-nowrap rounded-lg px-2 py-0.5 text-[11px] font-extrabold leading-tight transition-opacity ${
            state === 'dim' ? 'opacity-30' : 'opacity-100'
          } ${state === 'focus' ? 'bg-surface-2' : 'bg-surface/85'} text-ink`}
          style={{
            borderLeft: `3px solid ${node.color}`,
            boxShadow: state === 'focus' ? `0 0 14px ${node.color}66` : undefined,
          }}
        >
          {node.label}
          {node.sublabel && <div className="font-bold text-[10px] text-muted">{node.sublabel}</div>}
        </div>
      </Html>
    </group>
  )
}

const SEGMENT_SECONDS = 0.9
const PAUSE_SECONDS = 1.2
const BLOCK_AT = 0.72 // fração do último trecho onde o pacote barrado para

function Packet({ step, nodes, labels }: { step: SceneStep; nodes: SceneNode[]; labels: Labels }) {
  const ref = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const blockedMark = useRef<THREE.Group>(null)
  const [stopped, setStopped] = useState(false)
  const packet = step.packet!

  const points = useMemo(
    () =>
      packet.path.map((id) => {
        const n = nodes.find((x) => x.id === id)!
        const top = n.shape === 'wall' ? n.position[1] : n.position[1] + n.size[1] / 2 + 0.35
        return new THREE.Vector3(n.position[0], top, n.position[2])
      }),
    [packet, nodes],
  )
  const segments = points.length - 1
  const travel = (segments - (packet.blocked ? 1 - BLOCK_AT : 0)) * SEGMENT_SECONDS
  const start = useRef<number | null>(null)

  useFrame(({ clock }) => {
    if (!ref.current || !material.current || !blockedMark.current) return
    if (start.current === null) start.current = clock.elapsedTime
    const t = (clock.elapsedTime - start.current) % (travel + PAUSE_SECONDS)
    const progress = Math.min(t / SEGMENT_SECONDS, travel / SEGMENT_SECONDS)
    const seg = Math.min(Math.floor(progress), segments - 1)
    const local = progress - seg
    ref.current.position.lerpVectors(points[seg], points[seg + 1], local)
    ref.current.position.y += Math.sin(local * Math.PI) * 0.4

    const isStopped = Boolean(packet.blocked) && t >= travel
    material.current.color.set(isStopped ? palette.danger : palette.public)
    material.current.emissive.set(isStopped ? palette.danger : palette.public)
    blockedMark.current.position.copy(ref.current.position)
    if (isStopped !== stopped) setStopped(isStopped)
  })

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial ref={material} emissiveIntensity={1} />
      </mesh>
      <group ref={blockedMark}>
        {/* Sempre montado: montar/desmontar <Html> a cada ciclo cria e destrói raízes React no meio do render */}
        <Html portal={labels} center position={[0, 0.55, 0]}>
          <div
            className={`pointer-events-none whitespace-nowrap rounded-full bg-red px-2 text-sm font-black text-on-neon shadow-[0_0_14px_rgb(255_46_99/0.6)] transition-opacity ${stopped ? 'opacity-100' : 'opacity-0'}`}
          >
            ✕ bloqueado
          </div>
        </Html>
      </group>
    </>
  )
}
