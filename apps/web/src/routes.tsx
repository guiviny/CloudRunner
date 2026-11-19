import type { RouteObject } from 'react-router'
import { ErrorPage } from './components/ErrorPage'
import { HomePage } from './features/home/HomePage'
import { LessonPage } from './features/lesson/LessonPage'
import { PathPage } from './features/path/PathPage'
import { RoadmapPage } from './features/roadmap/RoadmapPage'

// Rota-pai sem caminho: concentra o tratamento de erro (404 e falhas de render) num só lugar.
export const routes: RouteObject[] = [
  {
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/trilha', element: <PathPage /> },
      { path: '/licao/:lessonId', element: <LessonPage /> },
      { path: '/roadmap', element: <RoadmapPage /> },
    ],
  },
]
