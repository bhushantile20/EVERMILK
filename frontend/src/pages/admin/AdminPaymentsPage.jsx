import { useEffect, useState } from 'react'
import { api } from '../../app/apiClient'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/payments/admin/all/')
        const data = Array.isArray(res.data) ? res.data : res.data?.results || []
        setPayments(data)
      } catch {
        setError('Failed to load payments')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

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
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Payment History</h1>
        <div className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          {payments.length} Records
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      ) : null}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">💳</div>
            <p className="text-gray-500 font-medium">No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4 border-l border-gray-100">Amount</th>
                  <th className="px-6 py-4 border-l border-gray-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => {
                  const isFailed = p.status === 'failed'
                  const isCompleted = p.status === 'completed'
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 mb-0.5">PMT-{String(p.id).substring(0, 8).toUpperCase()}</div>
                        <div className="text-xs text-gray-500 font-medium tracking-wide">Order #{p.order}</div>
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100">
                        <span className={`font-extrabold ${isFailed ? 'text-gray-500 line-through' : 'text-green-700'}`}>₹{p.amount}</span>
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${isCompleted ? 'bg-green-50 text-green-700 border-green-200'
                          : isFailed ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                          {p.status}
                        </span>
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
