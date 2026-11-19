import { z } from 'zod'

// Schema único: usado pelo app e pelo pipeline de geração de conteúdo.

export const examDomains = ['cloud-concepts', 'security', 'technology', 'billing', 'fundamentals'] as const
export const ExamDomain = z.enum(examDomains)

export const sceneTemplates = [
  'vpc-network',
  'security-layers',
  'shared-responsibility',
  'managed-db',
  'catalog',
  'rds-instance',
  'rds-backup',
  'rds-multi-az',
  'aws-cli',
] as const
export const SceneTemplateId = z.enum(sceneTemplates)

export const SceneStep = z.object({
  caption: z.string(),
  // ids dos nós em destaque; os demais ficam esmaecidos
  focus: z.array(z.string()).default([]),
  // nós em vermelho neste passo (falha, expiração, erro); também ficam em destaque
  alert: z.array(z.string()).default([]),
  // troca o rótulo de um nó só neste passo (ex.: standby → "Nova primária")
  labels: z.record(z.string(), z.string()).default({}),
  // pacote animado percorrendo os nós em ordem
  packet: z
    .object({
      path: z.array(z.string()).min(2),
      blocked: z.boolean().default(false),
    })
    .optional(),
})

export const Scene = z.object({
  template: SceneTemplateId,
  params: z.record(z.string(), z.unknown()).default({}),
  steps: z.array(SceneStep).min(1),
})

export const Option = z.object({ id: z.string(), text: z.string() })

export const Question = z
  .object({
    id: z.string(),
    examDomain: ExamDomain,
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    kind: z.enum(['single', 'multi', 'scenario', 'truefalse']),
    context: z.string().optional(),
    stem: z.string(),
    options: z.array(Option).min(2),
    correct: z.array(z.string()).min(1),
    explanation: z.object({
      summary: z.string(),
      whyCorrect: z.string(),
      whyOthersWrong: z.record(z.string(), z.string()).default({}),
      scene: Scene.optional(),
    }),
    sourceRef: z.object({ file: z.string(), page: z.number().optional() }).optional(),
  })
  .superRefine((q, ctx) => {
    const ids = new Set(q.options.map((o) => o.id))
    if (ids.size !== q.options.length) ctx.addIssue({ code: 'custom', message: `${q.id}: ids de opção duplicados` })
    for (const c of q.correct) {
      if (!ids.has(c)) ctx.addIssue({ code: 'custom', message: `${q.id}: resposta "${c}" não existe nas opções` })
    }
    if (q.kind !== 'multi' && q.correct.length !== 1) {
      ctx.addIssue({ code: 'custom', message: `${q.id}: tipo "${q.kind}" exige exatamente 1 resposta` })
    }
  })

export const Lesson = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['learn', 'practice', 'review']),
  questionIds: z.array(z.string()).min(1),
})

export const Unit = z.object({
  id: z.string(),
  title: z.string(),
  lessons: z.array(Lesson).min(1),
  // baú aparece depois da lição com este índice
  chestAfter: z.number().int().optional(),
})

export const Section = z.object({
  id: z.string(),
  number: z.number().int(),
  title: z.string(),
  units: z.array(Unit).min(1),
  questions: z.array(Question).min(1),
})

export type ExamDomain = z.infer<typeof ExamDomain>
export type SceneTemplateId = z.infer<typeof SceneTemplateId>
export type SceneStep = z.infer<typeof SceneStep>
export type Scene = z.infer<typeof Scene>
export type Question = z.infer<typeof Question>
export type Lesson = z.infer<typeof Lesson>
export type Unit = z.infer<typeof Unit>
export type Section = z.infer<typeof Section>
