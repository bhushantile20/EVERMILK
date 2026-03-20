import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  History, 
  Pause, 
  Play, 
  Info
} from 'lucide-react'
import { api } from '../app/apiClient'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedSubId, setSelectedSubId] = useState(null)

  // Mock wallet - in a real app this would come from an API
  const walletBalance = 450.00

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const subRes = await api.get('/api/subscriptions/my/')
        const subs = subRes.data || []
        setSubscriptions(subs)

        // Fetch deliveries for each active subscription
        const allDeliveries = []
        for (const sub of subs) {
          if (sub.status === 'active') {
            const delRes = await api.get(`/api/subscriptions/${sub.id}/deliveries/`)
            // Tag deliveries with their sub_id if the API doesn't already provide it clearly
            const subDeliveries = (delRes.data || []).map(d => ({ ...d, sub_id: sub.id }))
            allDeliveries.push(...subDeliveries)
          }
        }
        setDeliveries(allDeliveries)
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      } finally {
        setTimeout(() => setLoading(false), 800)
      }
    }
    fetchData()
  }, [])

  // Calendar Logic
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

  const isToday = (day) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear()
  }

  const getDeliveriesForDay = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    let filtered = deliveries.filter(d => d.delivery_date === dateStr)
    if (selectedSubId) {
      filtered = filtered.filter(d => d.sub_id === selectedSubId)
    }
    return filtered
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Dashboard</h1>
          <p className="text-slate-500 font-medium">Manage your daily freshness and subscriptions.</p>
        </motion.div>

        <div className="flex flex-wrap gap-4">
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex items-center gap-4 bg-emerald-600 rounded-2xl p-4 pr-8 text-white shadow-lg shadow-emerald-200"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Wallet Balance</div>
              <div className="text-2xl font-black">₹{walletBalance.toFixed(2)}</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Calendar & stats */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Calendar Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CalendarIcon size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  {selectedSubId 
                    ? `Schedule: ${subscriptions.find(s => s.id === selectedSubId)?.product_name || 'Milk'}` 
                    : 'Delivery Calendar'}
                </h2>
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                <span className="text-sm font-black text-slate-900 min-w-[120px] text-center">{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayDeliveries = getDeliveriesForDay(i + 1)
                  const hasDelivery = dayDeliveries.length > 0
                  const isCurrent = isToday(i + 1)

                  return (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className={`aspect-square rounded-2xl border relative flex flex-col items-center justify-center transition-all ${
                        isCurrent 
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600 ring-offset-2' 
                        : hasDelivery 
                        ? 'border-emerald-100 bg-emerald-50/30' 
                        : 'border-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <span className={`text-sm font-black ${isCurrent ? 'text-emerald-700' : 'text-slate-900'}`}>{i + 1}</span>
                      
                      {hasDelivery && (
                        <div className="absolute bottom-2 flex gap-1">
                          {dayDeliveries.map((d, idx) => (
                            <div key={idx} className={`w-1.5 h-1.5 rounded-full ${d.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-8 border-t border-slate-50 pt-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Delivered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">No Delivery</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10"></div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Upcoming Delivery</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">🚛</div>
                <div>
                  <div className="text-xl font-black">Tomorrow, 6:30 AM</div>
                  <div className="text-sm font-medium text-emerald-400">Pure Buffalo Milk (1L)</div>
                </div>
              </div>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-colors mb-2">Pause Tomorrow</button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Active Subs</span>
                  <span className="text-lg font-black text-slate-900">{subscriptions.filter(s => s.status === 'active').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Refilled Bottles</span>
                  <span className="text-lg font-black text-emerald-600">12 Bottles</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Carbon Saved</span>
                  <span className="text-lg font-black text-emerald-600">2.4 kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Subscriptions List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900">Active Plans</h2>
              {selectedSubId ? (
                <button 
                  onClick={() => setSelectedSubId(null)}
                  className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline"
                >
                  Show All
                </button>
              ) : (
                <Link to="/" className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline">+ Add New</Link>
              )}
            </div>

            <div className="space-y-6">
              {loading ? (
                 <div className="space-y-4">
                   {[1, 2].map(i => (
                     <div key={i} className="animate-pulse h-24 bg-slate-50 rounded-2xl"></div>
                   ))}
                 </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🥛</div>
                  <p className="text-sm font-bold text-slate-400">No active plans</p>
                </div>
              ) : (
                subscriptions.map(sub => {
                  const isSelected = selectedSubId === sub.id
                  return (
                    <motion.div 
                      key={sub.id} 
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedSubId(isSelected ? null : sub.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected 
                        ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-100' 
                        : 'border-slate-100 bg-white hover:border-emerald-100 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className={`text-sm font-black line-clamp-1 ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>{sub.product_name || 'Milk Product'}</div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>{sub.plan_type} • {sub.quantity} Unit</div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          sub.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                         <button 
                           onClick={(e) => e.stopPropagation()} 
                           className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                             isSelected ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                           }`}
                         >
                           {sub.status === 'active' ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Resume</>}
                         </button>
                         <Link 
                           to={`/dashboard/orders`} 
                           onClick={(e) => e.stopPropagation()}
                           className={`p-2 border rounded-xl transition-all ${
                             isSelected ? 'border-emerald-200 text-emerald-600 hover:bg-white' : 'border-slate-100 hover:border-emerald-100 text-slate-400 hover:text-emerald-600'
                           }`}
                         >
                           <History size={16} />
                         </Link>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>

          <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
             <div className="flex items-center gap-3 mb-4">
               <Info size={18} className="text-emerald-600" />
               <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Support Tip</span>
             </div>
             <p className="text-xs font-bold text-emerald-600/80 leading-relaxed">
               Need to go on vacation? Use the "Pause" button on your active plans to stop deliveries instantly. You only pay for what you consume.
             </p>
          </div>
        </div>

      </div>
    </div>
  )
}
