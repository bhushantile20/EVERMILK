import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../app/apiClient'
import { useAppDispatch } from '../../app/hooks'
import { setSession } from '../../features/auth/authSlice'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const performLogin = async (loginEmail, loginPassword) => {
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/api/auth/login/', { email: loginEmail, password: loginPassword })
      dispatch(setSession(res.data))
      // Verify admin status could go here if the backend returns it in the user object
      navigate('/admin/analytics', { replace: true })
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Invalid admin credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    await performLogin(email, password)
  }

  const handleDemoLogin = async () => {
    setEmail('admin@evermilk.com')
    setPassword('Bhushan@2003')
    await performLogin('admin@evermilk.com', 'Bhushan@2003')
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card overflow-hidden shadow-lg border border-gray-100">
          <div className="h-2 w-full bg-slate-800" />

          <div className="card-body px-8 py-10">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner border border-slate-100">
                ⚙️
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Admin Portal
              </h1>
              <p className="mt-1.5 text-sm font-medium text-slate-500">Sign in to manage Milkman</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email / Username
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="admin@milkman.com"
                  className="input bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              {error ? (
                <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <p className="text-sm font-medium text-rose-700 leading-tight">{error}</p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition-all shadow-md mt-6"
              >
                {loading ? 'Authenticating...' : 'Sign in to Admin'}
              </button>
            </form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider font-bold">
                <span className="bg-white px-3 text-slate-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:border-slate-200 hover:bg-slate-50 disabled:opacity-60 transition-all"
              >
                <svg className="h-5 w-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20.2C9.5 20.2 7.29 18.92 6 16.98C6.03 14.99 10 13.9 12 13.9C13.99 13.9 17.97 14.99 18 16.98C16.71 18.92 14.5 20.2 12 20.2Z"/>
                </svg>
                Admin Demo Login
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm font-medium text-slate-500">
                New administrator?{' '}
                <Link to="/admin/signup" className="font-bold text-slate-900 hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Authorized Personnel Only
        </div>
      </div>
    </div>
  )
}
