import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../app/apiClient'

const statusConfig = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
  completed: { label: 'Completed', cls: 'bg-teal-100 text-teal-800 border-teal-200' },
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-green-600 mb-4" />
          <p className="text-gray-500 font-medium">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
            📦
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">We couldn't locate the details for this order.</p>
          <Link to="/dashboard/orders" className="btn-primary shadow-sm inline-flex">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const sc = statusConfig[order.status] || { label: order.status, cls: 'bg-gray-100 text-gray-800 border-gray-200' }
  const dateObj = new Date(order.created_at)
  const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-20 space-y-8">

      {/* Header & Back Link */}
      <div>
        <Link
          to="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to orders
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Main Details */}
        <div className="md:col-span-2 space-y-8">

          {/* Order Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-2 w-full bg-green-600" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-gray-100">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-1">
                    Order #{order.id}
                  </h1>
                  <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${sc.cls}`}>
                    {sc.label}
                  </span>
                </div>
              </div>

              {order.shipping_address ? (
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Delivery Address
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{order.shipping_address}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Order Items Section - Optional placeholder since backend doesn't return items in the snippet, but structure is here for future */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 opacity-50 pointer-events-none">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items View (WIP)</h2>
            <p className="text-sm text-gray-500">Items belonging to this order will be displayed here.</p>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="md:col-span-1 space-y-6">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">₹{order.total_amount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Delivery</span>
                <span className="font-bold text-green-600">Free</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mb-6 pb-6 border-b">
              <div className="flex items-end justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <p className="text-2xl font-extrabold text-green-700 block leading-none">₹{order.total_amount}</p>
              </div>
            </div>

            {payment ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Payment Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${payment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200'
                      : payment.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                    {payment.status || 'unknown'}
                  </span>
                </div>

                {payment.payment_method && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Payment Method</p>
                    <p className="text-sm font-bold text-gray-900 capitalize flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      {payment.payment_method?.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center">No payment details available</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
