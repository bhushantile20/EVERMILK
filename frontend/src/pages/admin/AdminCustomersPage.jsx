import { useEffect, useState } from 'react'
import { api } from '../../app/apiClient'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/auth/users/')
      const data = Array.isArray(res.data) ? res.data : res.data?.results || []
      setCustomers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => setError('Failed to load customers'))
  }, [])

  const deactivate = async (id) => {
    setError('')
    if (!window.confirm("Are you sure you want to deactivate this account?")) return
    try {
      await api.patch(`/api/auth/users/${id}/deactivate/`)
      await load()
    } catch (e) {
      setError('Failed to deactivate')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-100 border-t-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Customer Accounts</h1>
        <div className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          {customers.length} Accounts
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      ) : null}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">👥</div>
            <p className="text-gray-500 font-medium">No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4 border-l border-gray-100">Status</th>
                  <th className="px-6 py-4 border-l border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 font-bold flex items-center justify-center border border-green-200 text-lg uppercase tracking-wider shadow-sm">
                          {c.username?.charAt(0) || c.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight mb-0.5">{c.username || c.email}</div>
                          <div className="text-xs text-gray-500 font-medium">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-gray-100">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 border-l border-gray-100 text-right">
                      <button
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold leading-5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        onClick={() => deactivate(c.id)}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
