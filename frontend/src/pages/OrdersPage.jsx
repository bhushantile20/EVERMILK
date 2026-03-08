import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../app/apiClient'

const statusConfig = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
  completed: { label: 'Completed', cls: 'bg-teal-100 text-teal-800 border-teal-200' },
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
        setError('Failed to load your orders. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-green-600 mb-4" />
          <p className="text-gray-500 font-medium">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">📦 My Orders</h1>
          <p className="mt-2 text-gray-500">Track and view your recent subscription and one-time orders.</p>
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm w-max">
          <button className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-900 rounded-md">All Orders</button>
          <button className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800">Active Subs</button>
        </div>
      </div>

      {error ? (
        <div className="mb-8 rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      ) : null}

      {orders.length === 0 && !error ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center max-w-2xl mx-auto mt-8">
          <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
            📦
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders with us yet. Start fresh today!</p>
          <Link to="/" className="btn-primary inline-flex">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Order ID</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="divide-y divide-gray-100">
            {orders.map((o) => {
              const sc = statusConfig[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-800 border-gray-200' }
              const dateObj = new Date(o.created_at)
              const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

              return (
                <Link
                  key={o.id}
                  to={`/dashboard/orders/${o.id}`}
                  className="block group hover:bg-green-50/30 transition-colors"
                >
                  {/* Mobile View */}
                  <div className="md:hidden p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">Order #{o.id}</p>
                        <p className="text-xs text-gray-500">{formattedDate}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-end justify-between pt-2 border-t border-gray-50">
                      <p className="text-sm font-medium text-gray-500">Total Amount</p>
                      <p className="text-lg font-extrabold text-gray-900">₹{o.total_amount}</p>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center">
                    <div className="col-span-3">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">#{o.id}</span>
                    </div>
                    <div className="col-span-3 text-sm text-gray-600">
                      {formattedDate}
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-base font-extrabold text-gray-900">₹{o.total_amount}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-bold text-green-600 group-hover:underline">View Details &rarr;</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
