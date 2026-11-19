# CloudRunner

[![CI](https://github.com/guiviny/CloudRunner/actions/workflows/ci.yml/badge.svg)](https://github.com/guiviny/CloudRunner/actions/workflows/ci.yml)

Trilha de estudos estilo Duolingo para a prova do **AWS re/Start** (AWS Certified Cloud Practitioner, CLF-C02). Quando o aluno erra uma questão, aparece uma explicação escrita e uma cena 3D animada (Three.js / React Three Fiber) mostrando por que a alternativa correta está certa.

## Rodando

Requer Node 24 (veja `.nvmrc`).

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # schema, lógica da lição, conteúdo ↔ cenas e testes de componente (jsdom)
npm run build
```

## Antes de abrir um PR

```bash
npm run check   # formato (Prettier), lint (oxlint), tipos, testes e build: o mesmo que o CI roda
```

O pre-commit formata e roda o lint só nos arquivos alterados. O CI (`.github/workflows/ci.yml`) também procura segredos com o gitleaks. O lint é o oxlint porque o projeto usa TypeScript 7, que o typescript-eslint ainda não suporta.

Testes de componente ficam ao lado da página (`*.test.tsx`), começam com `// @vitest-environment jsdom` e renderizam as rotas reais com `renderRoute` (`apps/web/src/test/render.tsx`).

## Estrutura

| Caminho                                  | O que é                                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `apps/web/src/content/schema.ts`         | Schema zod único (seções → unidades → lições → questões + roteiro da cena)                                  |
| `apps/web/src/content/data/*.json`       | Conteúdo revisado. Cada seção é um arquivo                                                                  |
| `apps/web/src/features/home`             | Menu inicial (`/`): o aluno escolhe entre o roadmap e a trilha                                              |
| `apps/web/src/features/path`             | Trilha em zigue-zague, baús, troféu e barra superior (XP, ofensiva, gemas)                                  |
| `apps/web/src/features/lesson`           | Player da lição; `lessonLogic.ts` é puro e testado                                                          |
| `apps/web/src/features/roadmap`          | Roadmap de estudos (`/roadmap`): clique abre os materiais, clique direito marca como concluído              |
| `apps/web/src/content/data/roadmap.json` | Tópicos do roadmap e links para materiais gratuitos (validado por `roadmapSchema.ts`)                       |
| `apps/web/src/features/explain`          | Painel de explicação (texto + 3D com passos)                                                                |
| `apps/web/src/scenes`                    | Engine 3D: `templates/*` são funções `params → layout`, e o `SceneView` renderiza, destaca e anima o pacote |
| `apps/web/src/lib/progress.ts`           | Progresso local (zustand + localStorage). Será sincronizado com o Supabase                                  |
| `content/source`                         | PDFs da Escola da Nuvem (fora do git, por direitos autorais)                                                |

## Adicionando uma cena 3D a uma questão

A questão não tem código 3D: ela escolhe um template e descreve os passos em JSON.

```json
"scene": {
  "template": "security-layers",
  "params": { "naclRule": "DENY 203.0.113.7" },
  "steps": [
    { "caption": "A NACL é a primeira barreira.", "focus": ["nacl"] },
    { "caption": "O IP malicioso é barrado.", "focus": ["internet", "nacl"],
      "packet": { "path": ["internet", "nacl"], "blocked": true } }
  ]
}
```

Além de `focus` e `packet`, um passo pode ter `alert` (nós em vermelho: falha, expiração) e `labels` (troca o rótulo de um nó só naquele passo, ex.: `{ "standby": "RDS · nova primária" }`).

O `npm test` falha se um passo referenciar um nó que não existe no template.

| Template                | Para quê                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `vpc-network`           | VPC, sub-redes, IGW, NAT, EC2 e banco                                                              |
| `security-layers`       | NACL × security group                                                                              |
| `shared-responsibility` | Camadas AWS × cliente                                                                              |
| `managed-db`            | Banco no EC2 × Amazon RDS, camada por camada                                                       |
| `catalog`               | Grupos de itens definidos em `params.groups` (mecanismos, serviços, opções), com `source` opcional |
| `rds-instance`          | Instância RDS: mecanismo, bancos, classe e tipos de armazenamento                                  |
| `rds-backup`            | Linha do tempo de snapshots, logs, retenção e snapshot manual                                      |
| `rds-multi-az`          | Primária e standby em duas AZs, para replicação e failover                                         |
| `aws-cli`               | Comando da CLI → API do serviço → recurso                                                          |

## Próximas fases (ver plano)

5. Pipeline de IA: PDF → texto → Claude API (structured outputs) → validação → tela de revisão
6. Supabase: login, tabelas com RLS, sincronização do progresso
7. Revisão espaçada dos erros, simulado de 65 questões, mais templates 3D
8. PWA e deploy

## Licença e conteúdo

O código está sob a licença [MIT](LICENSE). As questões e explicações são texto próprio. Os PDFs da Escola da Nuvem/AWS não fazem parte do repositório (`content/source` fica fora do git). AWS e os nomes dos serviços são marcas da Amazon.com, Inc. Este projeto não tem vínculo com a AWS nem com a Escola da Nuvem.

A fonte do logo (Roguepunk) tem licença de uso pessoal e não é distribuída. Sem ela, o logo usa a Orbitron.
