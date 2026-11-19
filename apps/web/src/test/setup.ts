import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { useProgress } from '../lib/progress'

// Os testes de lógica rodam em node; os de componente pedem jsdom com `// @vitest-environment jsdom`.
if (typeof window !== 'undefined') {
  // APIs que o jsdom não implementa e que as páginas chamam
  window.scrollTo = () => {}
  Element.prototype.scrollIntoView = () => {}
  // sem WebGL: a explicação mostra os passos da cena em texto
  HTMLCanvasElement.prototype.getContext = () => null
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

afterEach(() => {
  cleanup()
  useProgress.getState().reset()
  if (typeof localStorage !== 'undefined') localStorage.clear()
})
