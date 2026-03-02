import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../app/apiClient'

const statusConfig = {
  pending: { label: 'Pending', cls: 'badge-yellow' },
  processing: { label: 'Processing', cls: 'badge-slate' },
  delivered: { label: 'Delivered', cls: 'badge-green' },
  cancelled: { label: 'Cancelled', cls: 'badge-red' },
  completed: { label: 'Completed', cls: 'badge-green' },
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const [oRes, pRes] = await Promise.all([
          api.get(`/api/orders/${id}/`),
          api.get(`/api/payments/${id}/`).catch(() => ({ data: null })),
        ])
        setOrder(oRes.data)
        setPayment(pRes.data)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="card p-8 text-center">
        <p className="text-2xl mb-3">📦</p>
        <p className="text-sm font-semibold text-slate-700">Order not found.</p>
        <Link to="/dashboard/orders" className="btn-primary mt-4">
          Back to orders
        </Link>
      </div>
    )
  }

  const sc = statusConfig[order.status] || { label: order.status, cls: 'badge-slate' }

  return (
    <div className="space-y-5">
      {/* Order Header Card */}
      <div className="card overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
        <div className="card-body">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Order #{order.id}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{order.created_at}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <p className="text-2xl font-extrabold text-green-700">₹{order.total_amount}</p>
              <span className={sc.cls}>{sc.label}</span>
            </div>
          </div>

          {order.shipping_address ? (
            <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                📍 Delivery Address
              </p>
              <p className="text-sm text-slate-700">{order.shipping_address}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Payment Info Card */}
      {payment ? (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="text-sm font-extrabold text-slate-900">💳 Payment Info</h2>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Status</span>
              <span className={
                payment.status === 'completed' ? 'badge-green'
                  : payment.status === 'failed' ? 'badge-red'
                    : 'badge-yellow'
              }>
                {payment.status || 'unknown'}
              </span>
            </div>
            {payment.payment_method && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-slate-600">Method</span>
                <span className="text-sm font-semibold text-slate-900 capitalize">
                  {payment.payment_method?.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Back Link */}
      <div>
        <Link
          to="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 hover:underline"
        >
          ← Back to orders
        </Link>
      </div>
    </div>
  )
}
