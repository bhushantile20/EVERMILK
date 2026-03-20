import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../app/apiClient'
import { ChevronLeft, ChevronRight, Pause, Play, Calendar as CalendarIcon, X, Trash2 } from 'lucide-react'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const statusConfig = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
  completed: { label: 'Completed', cls: 'bg-teal-100 text-teal-800 border-teal-200' },
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [selectedSubId, setSelectedSubId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const [oRes, sRes] = await Promise.all([
          api.get('/api/orders/'),
          api.get('/api/subscriptions/my/')
        ])
        
        const oData = Array.isArray(oRes.data) ? oRes.data : oRes.data?.results || []
        const sData = Array.isArray(sRes.data) ? sRes.data : sRes.data?.results || []
        
        setOrders(oData)
        setSubscriptions(sData)

        // Fetch deliveries for small calendar
        const allDeliveries = []
        for (const sub of sData) {
          if (sub.status === 'active' || sub.status === 'paused') {
            const delRes = await api.get(`/api/subscriptions/${sub.id}/deliveries/`)
            const subDeliveries = (delRes.data || []).map(d => ({ ...d, sub_id: sub.id }))
            allDeliveries.push(...subDeliveries)
          }
        }
        setDeliveries(allDeliveries)
      } catch (e) {
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const toggleSubscription = async (sub) => {
    try {
      if (sub.status === 'active') {
        const today = new Date().toISOString().split('T')[0]
        await api.post('/api/subscriptions/pause/', { 
          subscription_id: sub.id,
          start_date: today,
          end_date: sub.end_date,
          reason: 'Paused from dashboard'
        })
        setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'paused' } : s))
      } else {
        await api.post('/api/subscriptions/resume/', { 
          subscription_id: sub.id 
        })
        setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'active' } : s))
      }
    } catch (e) {
      console.error('Subscription error:', e)
      alert(e.response?.data?.error || 'Failed to update subscription status')
    }
  }

  const cancelSubscription = async (sub) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return
    
    try {
      await api.post(`/api/subscriptions/${sub.id}/cancel/`, { reason: 'Cancelled by user' })
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'cancelled' } : s))
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to cancel subscription')
    }
  }

  const deleteSubscription = async (sub) => {
    if (!window.confirm('Are you sure you want to permanently delete this subscription and its history? This action cannot be undone.')) return
    
    try {
      await api.delete(`/api/subscriptions/${sub.id}/delete/`)
      setSubscriptions(prev => prev.filter(s => s.id !== sub.id))
      if (selectedSubId === sub.id) setSelectedSubId(null)
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete subscription')
    }
  }

  // Small Calendar Logic
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const getDeliveriesForDay = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return deliveries.filter(d => 
      d.delivery_date === dateStr && (selectedSubId === null || d.sub_id === selectedSubId)
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-green-600 mb-4" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">📦 Dashboard</h1>
          <p className="mt-2 text-gray-500">Manage your orders and recurring subscriptions.</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner border border-gray-200/50">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2 text-sm font-black transition-all rounded-lg ${
              activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            All Orders
          </button>
          <button 
            onClick={() => setActiveTab('subs')}
            className={`px-5 py-2 text-sm font-black transition-all rounded-lg ${
              activeTab === 'subs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Active Subs
          </button>
        </div>
      </div>



      {error ? (
        <div className="mb-8 rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      ) : null}

      {activeTab === 'orders' ? (
        <>
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
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Subscriptions List */}
          <div className="lg:col-span-7 space-y-6">
            {subscriptions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 font-medium">
                No active subscriptions found.
              </div>
            ) : (
              subscriptions.map(sub => (
                <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{sub.product_name}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{sub.plan_type} • {sub.quantity} Unit</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {sub.status !== 'cancelled' ? (
                      <>
                        <button 
                          onClick={() => toggleSubscription(sub)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            sub.status === 'active' 
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {sub.status === 'active' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
                        </button>
                        <button 
                          onClick={() => cancelSubscription(sub)}
                          className="px-4 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                          title="Cancel Subscription"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => deleteSubscription(sub)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 size={14} /> Delete Permanently
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedSubId(selectedSubId === sub.id ? null : sub.id)}
                      className={`px-4 flex items-center justify-center rounded-xl transition-all ${
                        selectedSubId === sub.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-50 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Filter Calendar"
                    >
                      <CalendarIcon size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Small Calendar Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                    {selectedSubId ? 'Filtered Schedule' : 'Delivery Schedule'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={16}/></button>
                    <span className="text-[10px] font-black uppercase tracking-widest min-w-[60px] text-center">{MONTHS[currentMonth.getMonth()]}</span>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={16}/></button>
                  </div>
                </div>
                {selectedSubId && (
                  <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-400 truncate max-w-[150px]">
                      {subscriptions.find(s => s.id === selectedSubId)?.product_name}
                    </span>
                    <button 
                      onClick={() => setSelectedSubId(null)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[9px] font-black text-slate-500 uppercase">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayDeliveries = getDeliveriesForDay(day)
                  const hasDelivery = dayDeliveries.length > 0
                  return (
                    <div 
                      key={day} 
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                        hasDelivery ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">Scheduled Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
