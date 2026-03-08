import { useEffect, useState } from 'react'
import { api } from '../../app/apiClient'

const statusConfig = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
  completed: { label: 'Completed', cls: 'bg-teal-100 text-teal-800 border-teal-200' },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/orders/admin/all/')
      const data = Array.isArray(res.data) ? res.data : res.data?.results || []
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => setError('Failed to load orders'))
  }, [])

  const updateStatus = async (id, status) => {
    setError('')
    try {
      await api.patch(`/api/orders/${id}/update-status/`, { status })
      await load()
    } catch (e) {
      setError('Failed to update status')
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
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Order Management</h1>
        <div className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          {orders.length} Total Orders
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      ) : null}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">📦</div>
            <p className="text-gray-500 font-medium">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4 border-l border-gray-100">Amount</th>
                  <th className="px-6 py-4 border-l border-gray-100">Status</th>
                  <th className="px-6 py-4 border-l border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const sc = statusConfig[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-800 border-gray-200' }
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 mb-0.5">#{o.id}</div>
                        <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100">
                        <span className="font-extrabold text-gray-900">₹{o.total_amount}</span>
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100 text-right space-x-2">
                        {o.status === 'pending' && (
                          <button
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold leading-5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                            onClick={() => updateStatus(o.id, 'processing')}
                          >
                            Mark Processing
                          </button>
                        )}
                        {o.status === 'processing' && (
                          <button
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold leading-5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 transition-colors"
                            onClick={() => updateStatus(o.id, 'delivered')}
                          >
                            Mark Delivered
                          </button>
                        )}
                        {['pending', 'processing'].includes(o.status) && (
                          <button
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold leading-5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            onClick={() => updateStatus(o.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                        {!['pending', 'processing'].includes(o.status) && (
                          <span className="text-xs text-gray-400 font-semibold italic">No actions available</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
