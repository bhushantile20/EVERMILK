import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../app/apiClient'

const statusConfig = {
  pending: { label: 'Pending', cls: 'badge-yellow' },
  processing: { label: 'Processing', cls: 'badge-slate' },
  delivered: { label: 'Delivered', cls: 'badge-green' },
  cancelled: { label: 'Cancelled', cls: 'badge-red' },
  completed: { label: 'Completed', cls: 'badge-green' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/api/orders/')
        const data = Array.isArray(res.data) ? res.data : res.data?.results || []
        setOrders(data)
      } catch (e) {
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">📦 My Orders</h1>
        <p className="mt-0.5 text-sm text-slate-500">Track and view your order history.</p>
      </div>

      <div className="card-body">
        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{error}</p>
        ) : null}

        {orders.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-green-200 bg-green-50 p-10 text-center">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm font-semibold text-slate-700">No orders yet.</p>
            <Link to="/" className="btn-primary mt-4">Browse products</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const sc = statusConfig[o.status] || { label: o.status, cls: 'badge-slate' }
              return (
                <Link
                  key={o.id}
                  to={`/dashboard/orders/${o.id}`}
                  className="flex items-center justify-between rounded-2xl border border-green-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md hover:bg-green-50/40"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">Order #{o.id}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{o.created_at}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-base font-extrabold text-green-700">₹{o.total_amount}</p>
                    <span className={sc.cls}>{sc.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
