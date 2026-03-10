import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../app/apiClient'
import { useAppDispatch } from '../../app/hooks'
import { setSession } from '../../features/auth/authSlice'

export default function AdminSignupPage() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [phone_number, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [password_confirm, setPasswordConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await api.post('/api/auth/register/', {
                username,
                email,
                phone_number,
                password,
                password_confirm,
                role: 'admin'
            })
            dispatch(setSession(res.data))
            navigate('/admin/analytics', { replace: true })
        } catch (err) {
            if (err.response?.data) {
                const errorMessages = typeof err.response.data === 'string'
                    ? err.response.data
                    : Object.entries(err.response.data)
                        .map(([field, msgs]) => {
                            const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
                            return typeof msgs === 'string' ? msgs : `${fieldName}: ${msgs[0]}`;
                        })
                        .join(' | ');
                setError(errorMessages || 'Admin registration failed');
            } else {
                setError('Admin registration failed');
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[75vh] items-center justify-center p-6 bg-slate-50/50">
            <div className="w-full max-w-md">
                <div className="card overflow-hidden shadow-xl border border-slate-200">
                    <div className="h-2 w-full bg-slate-800" />

                    <div className="card-body px-8 py-10">
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                                🚀
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Register New Admin
                            </h1>
                            <p className="mt-2 text-sm font-medium text-slate-500">Create administrative access for EVER MILK</p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Username
                                    </label>
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        placeholder="admin_name"
                                        className="input bg-white"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Phone
                                    </label>
                                    <input
                                        value={phone_number}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        placeholder="+91..."
                                        className="input bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    required
                                    placeholder="admin@milkman.com"
                                    className="input bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="input bg-white"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Confirm
                                    </label>
                                    <input
                                        value={password_confirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="input bg-white"
                                    />
                                </div>
                            </div>

                            {error ? (
                                <div className="rounded-xl bg-rose-50 border border-border-rose-100 px-4 py-3 flex items-start gap-3 mt-4">
                                    <p className="text-xs font-semibold text-rose-700 leading-tight">{error}</p>
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition-all shadow-md mt-6"
                            >
                                {loading ? 'Creating Account...' : 'Register Admin Account'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Already have admin access?{' '}
                                <Link to="/admin/login" className="font-bold text-slate-900 hover:underline">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
