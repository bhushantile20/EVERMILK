import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-10 text-center shadow-sm border border-gray-100">
        <div className="mx-auto w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
          🥛
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">404</h1>
        <p className="mt-3 text-sm font-semibold text-gray-500 mb-8 border-b border-gray-100 pb-8">
          Oops! We spilled the milk. The page you're looking for was not found.
        </p>
        <Link to="/" className="btn-primary w-full shadow-md shadow-green-600/20 py-3.5">
          Take Me Home
        </Link>
      </div>
    </div>
  )
}
