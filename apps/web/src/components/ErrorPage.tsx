import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function ErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  if (!notFound) console.error(error)

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-7xl">{notFound ? '🛰️' : '⚠️'}</div>
      <h1 className="text-3xl font-black text-magenta">{notFound ? 'Página não encontrada' : 'Algo deu errado'}</h1>
      <p className="font-bold text-muted">
        {notFound
          ? 'Esse endereço não existe na trilha.'
          : 'Recarregue a página. Seu progresso fica salvo no navegador.'}
      </p>
      <Link to="/" className="btn-3d w-full border-green-dark bg-green py-3.5 text-on-neon">
        Voltar ao início
      </Link>
    </main>
  )
}
