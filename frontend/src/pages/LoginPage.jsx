import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../app/apiClient'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setSession } from '../features/auth/authSlice'
import { clearGuestCart } from '../features/cart/cartSlice'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const guestItems = useAppSelector((s) => s.cart.guestItems)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const syncGuestCart = async () => {
    for (const item of guestItems) {
      await api.post('/api/cart/add/', {
        product_id: item.product_id,
        quantity: item.quantity,
        plan_type: item.plan_type,
      })
    }
    dispatch(clearGuestCart())
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/api/auth/login/', { email, password })
      dispatch(setSession(res.data))

      if (guestItems?.length) {
        await syncGuestCart()
      }

      const from = location.state?.from?.pathname
      navigate(from || '/cart', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card overflow-hidden">
          {/* Green top bar */}
          <div className="h-2 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

          <div className="card-body px-8 py-8">
            <div className="text-center mb-6">
              <span className="text-4xl">🥛</span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-slate-500">Sign in to your Milkman account</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input"
                />
              </div>

              {error ? (
                <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60"
              >
                {loading ? '⏳ Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-green-600 hover:text-green-700">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
