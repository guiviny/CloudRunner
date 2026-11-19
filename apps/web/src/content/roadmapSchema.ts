import { z } from 'zod'

// Roadmap de estudo: grupos → tópicos → materiais externos (docs, artigos, cursos e vídeos gratuitos).

export const Resource = z.object({
  type: z.enum(['docs', 'article', 'course', 'video']),
  title: z.string(),
  url: z.url({ protocol: /^https$/ }),
  // quem publica o material (AWS, freeCodeCamp…), mostrado como selo
  source: z.string(),
  lang: z.enum(['pt', 'en']),
})

export const Topic = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  resources: z.array(Resource).min(1),
  // unidade da trilha que pratica este tópico
  unitId: z.string().optional(),
  optional: z.boolean().default(false),
})

export const RoadmapGroup = z.object({
  id: z.string(),
  title: z.string(),
  topics: z.array(Topic).min(1),
})

export const Roadmap = z.object({ groups: z.array(RoadmapGroup).min(1) })

export type Resource = z.infer<typeof Resource>
export type Topic = z.infer<typeof Topic>
export type RoadmapGroup = z.infer<typeof RoadmapGroup>
export type Roadmap = z.infer<typeof Roadmap>
