import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Info, Truck, Leaf, Shield, ArrowLeft, Plus, Minus, Star, MapPin, ShoppingCart } from 'lucide-react'
import { api } from '../app/apiClient'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setGuestItems } from '../features/cart/cartSlice'

const planOptions = [
  { value: 'one_time', label: 'One-time Purchase', priceKey: 'one_time_price', multiplier: 1 },
  { value: 'monthly', label: 'Monthly Subscription', priceKey: 'monthly_price', multiplier: 30 },
  { value: 'quarterly', label: 'Quarterly Subscription', priceKey: 'quarterly_price', multiplier: 90 },
  { value: 'yearly', label: 'Yearly Subscription', priceKey: 'yearly_price', multiplier: 365 },
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const guestItems = useAppSelector((s) => s.cart.guestItems)

  const [product, setProduct] = useState(null)
  const [planType, setPlanType] = useState('one_time')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/api/products/${id}/`)
        setProduct(res.data)
      } catch (e) {
        setError('Failed to load product')
      } finally {
        setTimeout(() => setLoading(false), 500)
      }
    }

    run()
  }, [id])

  const selectedPlan = useMemo(
    () => planOptions.find((p) => p.value === planType) || planOptions[0],
    [planType],
  )

  const price = useMemo(() => {
    if (!product) return 0
    const v = Number(product[selectedPlan.priceKey])
    return Number.isNaN(v) ? 0 : v
  }, [product, selectedPlan])

  const incrementQty = () => {
    if (quantity < (product?.stock_quantity || 1)) setQuantity(q => q + 1)
  }

  const decrementQty = () => {
    if (quantity > 1) setQuantity(q => q - 1)
  }

  const addToGuestCart = () => {
    const pid = Number(id)
    const existingIndex = guestItems.findIndex(
      (i) => String(i.product_id) === String(pid) && i.plan_type === planType,
    )

    const next = [...guestItems]
    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: next[existingIndex].quantity + quantity,
      }
    } else {
      next.push({
        product_id: pid,
        plan_type: planType,
        quantity: quantity,
        product_snapshot: {
          id: product?.id,
          name: product?.name,
          image_url: product?.image_url,
          category_name: product?.category_name,
          one_time_price: product?.one_time_price,
          monthly_price: product?.monthly_price,
          quarterly_price: product?.quarterly_price,
          yearly_price: product?.yearly_price,
        },
      })
    }

    dispatch(setGuestItems(next))
    navigate('/cart')
  }

  const addToServerCart = async () => {
    setSaving(true)
    setError('')
    try {
      await api.post('/api/cart/add/', {
        product_id: Number(id),
        quantity: quantity,
        plan_type: planType,
      })
      navigate('/cart')
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to add to cart')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-100 border-t-emerald-600 mb-6" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Curating freshness...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-16"
        >
          <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-8 shadow-inner">
            🥛
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Product not found</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">The product you're looking for doesn't exist or has been removed from our catalog.</p>
          <Link to="/" className="rounded-xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30 transition-all duration-300">
            Back to homepage
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-6 pt-12 pb-24"
    >
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-700 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-slate-300 uppercase tracking-widest text-[10px]">Category:</span>
          <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{product.category_name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        {/* Left Column - Product Showcase */}
        <div className="space-y-12 h-fit">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-slate-100 overflow-hidden relative group"
          >
            <div className="aspect-[4/5] w-full bg-slate-50 relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10rem] drop-shadow-xl">
                  🥛
                </div>
              )}
              
              {/* Overlay badges */}
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-md px-4 py-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest shadow-sm border border-white">
                  <Leaf size={12} />
                  100% Organic
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-md px-4 py-2 text-[10px] font-black text-blue-600 uppercase tracking-widest shadow-sm border border-white">
                  <Shield size={12} />
                  Tested Pure
                </span>
              </div>
            </div>
          </motion.div>

          {/* Nutritional Breakdown Overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[2rem] p-8 sm:p-10 text-white relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full blur-[100px] opacity-10 -mr-20 -mt-20 group-hover:opacity-20 transition-opacity"></div>
            
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <Info size={20} className="text-emerald-400" />
              Nutritional per 100ml
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 relative z-10 text-center">
              {[
                { label: 'Energy', val: '64 kcal' },
                { label: 'Protein', val: '3.4 g' },
                { label: 'Fat', val: '3.6 g' },
                { label: 'Calcium', val: '120 mg' },
              ].map((n, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="text-2xl font-black text-emerald-400 leading-none">{n.val}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.label}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-sm text-slate-400 font-medium italic">
              * Natural variations may occur based on cattle diet and seasonal changes.
            </div>
          </motion.div>
        </div>

        {/* Right Column - Product Meta & Purchase */}
        <div className="flex flex-col h-full lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex text-amber-500 gap-0.5">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span className="text-sm font-bold text-slate-400">4.9 (124 reviews)</span>
              <div className="h-4 w-px bg-slate-200"></div>
              <span className="text-sm font-bold text-emerald-600">Premium Choice</span>
            </div>

            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Price Starting at</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 leading-none">₹{price}</span>
                  <span className="text-lg font-bold text-slate-300">/unit</span>
                </div>
              </div>
              
              <div className="h-12 w-px bg-slate-100"></div>
              
              <div className="flex-1">
                {product.stock_quantity > 0 ? (
                  <div className="flex flex-col gap-2">
                     <span className="inline-flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full w-fit uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      In Stock
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 ml-1">Sourced within last 12 hours</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-2 text-xs font-black text-rose-700 bg-rose-50 px-4 py-1.5 rounded-full w-fit uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Origin Story */}
            <div className="mb-12">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={14} className="text-emerald-600" />
                Origin & Quality
              </h3>
              <p className="text-lg leading-relaxed text-slate-600 font-medium mb-6">
                {product.description || "The purest form of farm-to-table dairy. Every drop is cold-chain processed to maintain the perfect temperature until it reaches your doorstep."}
              </p>
              <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center shrink-0">
                  🌱
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm mb-1">Grass-Fed Purity</div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Our cows graze on pesticide-free pastures in Greenfield Farms, ensuring the Highest Omega-3 and natural sweetness.</p>
                </div>
              </div>
            </div>

            {/* Delivery & Subscription Options */}
            <div className="mb-10">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Choose Your Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {planOptions.map((p) => {
                  const basePrice = Number(product?.one_time_price || 0)
                  const finalPrice = basePrice * (p.multiplier || 1)
                  const isActive = planType === p.value

                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPlanType(p.value)}
                      className={`relative flex flex-col p-5 rounded-2xl border-2 text-left transition-all duration-300 ${isActive
                        ? 'border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-900/5'
                        : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md'
                        }`}
                    >
                      {isActive && (
                        <div className="absolute top-5 right-5 text-emerald-600">
                          <Check size={20} weight="bold" />
                        </div>
                      )}
                      <span className={`text-[11px] font-black uppercase tracking-widest mb-2 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {p.label.split(' ')[0]}
                      </span>
                      <span className="text-lg font-black text-slate-900 leading-tight mb-2 pr-8">{p.label}</span>
                      <span className={`text-sm font-extrabold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                        ₹{finalPrice} <span className="text-[10px] opacity-70 underline underline-offset-4 decoration-2">total bill</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 mb-10">
              {/* Quantity Selector */}
              <div className="flex items-center p-1.5 bg-slate-50 border border-slate-100 rounded-2xl h-16 shrink-0 group">
                <button
                  type="button"
                  onClick={decrementQty}
                  disabled={quantity <= 1}
                  className="w-12 h-full flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-rose-600 disabled:opacity-20 transition-all hover:shadow-sm"
                >
                  <Minus size={20} />
                </button>
                <div className="w-16 flex items-center justify-center font-black text-slate-900 text-2xl">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={incrementQty}
                  disabled={quantity >= product.stock_quantity}
                  className="w-12 h-full flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-emerald-600 disabled:opacity-20 transition-all hover:shadow-sm"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={user ? addToServerCart : addToGuestCart}
                disabled={saving || product.stock_quantity < 1}
                className="relative overflow-hidden group/btn flex-1 h-16 rounded-2xl bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-transparent opacity-0 group-hover/btn:opacity-20 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <span>
                    {saving ? 'Processing...' : product.stock_quantity < 1 ? 'Temporarily Sold Out' : 'Subscribe Now'}
                  </span>
                  {!user && product.stock_quantity > 0 && !saving && (
                    <span className="text-[9px] font-bold opacity-70 uppercase tracking-[0.2em] mt-0.5">Guest Checkout Enabled</span>
                  )}
                </div>
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-2xl bg-rose-50 border border-rose-100 p-5 flex items-start gap-4"
              >
                <Shield size={20} className="text-rose-500 mt-1 shrink-0" />
                <p className="text-sm font-bold text-rose-700">{error}</p>
              </motion.div>
            )}

            {/* Trust Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-slate-100 mt-auto">
              {[
                { icon: <Truck className="text-emerald-600" />, label: 'Prime Delivery', sub: 'Before 7:00 AM' },
                { icon: <Shield className="text-blue-600" />, label: 'Milk Analysis', sub: 'Purity Certificate' },
                { icon: <ShoppingCart className="text-purple-600" />, label: 'Flexi plans', sub: 'Pause Anytime' },
              ].map((t, i) => (
                <div key={i} className="flex gap-4 items-center sm:items-start group/trust">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover/trust:bg-emerald-50 transition-colors">
                    {t.icon}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{t.label}</div>
                    <div className="text-[10px] font-bold text-slate-400 lowercase">{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
