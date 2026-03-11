import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch } from '../app/hooks'
import { api } from '../app/apiClient'
import { createSubscription, calculateSummary } from '../features/subscription/subscriptionSlice'

export default function SubscribePlan() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [product, setProduct] = useState(location.state?.product || null)
  const [loading, setLoading] = useState(true)

  const [plan, setPlan] = useState('monthly')
  const [quantity, setQuantity] = useState(1)
  
  // Format start date as YYYY-MM-DD
  const initDate = new Date()
  initDate.setDate(initDate.getDate() + 1)
  const [startDate, setStartDate] = useState(initDate.toISOString().split('T')[0])

  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!product) {
      api.get(`/api/products/${id}/`)
        .then(res => setProduct(res.data))
        .catch(() => setError('Failed to load product details.'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [id, product])

  const basePrice = useMemo(() => {
    return product ? Number(product.one_time_price || 0) : 0
  }, [product])

  const duration = useMemo(() => {
    if (plan === 'daily') return 1
    if (plan === 'monthly') return 30
    if (plan === 'quarterly') return 90
    if (plan === 'yearly') return 365
    return 1
  }, [plan])

  const summary = useMemo(() => {
    return calculateSummary(basePrice, quantity, plan, duration)
  }, [basePrice, quantity, plan, duration])

  const handlePay = async () => {
    setPaying(true)
    setError('')
    try {
      const subRes = await dispatch(createSubscription({
        product_id: parseInt(id),
        quantity,
        plan_type: plan,
        start_date: startDate
      })).unwrap()

      const orderId = subRes.order_id

      // Create Payment
      const paymentRes = await api.post('/api/payments/create/', {
        order_id: orderId,
        payment_method: 'credit_card', 
      })

      // Verify Payment (Simulation success)
      await api.post('/api/payments/verify/', {
        payment_id: paymentRes.data?.id,
        transaction_id: paymentRes.data?.transaction_id || `TXN_${Date.now()}`,
        status: 'completed'
      })

      navigate('/dashboard/orders')
    } catch (e) {
      setError(e.error || e.message || 'Payment flow failed. Please try again.')
      setPaying(false)
    }
  }

  if (loading) {
     return (
       <div className="flex justify-center items-center min-h-[50vh]">
         <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-green-600 mb-4" />
       </div>
     )
  }

  if (error && !product) {
     return <div className="text-center text-rose-500 py-20">{error}</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">Choose Your Plan</h1>
        <p className="mt-2 text-gray-500 text-lg">Flexible subscription options that fit your lifestyle</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Top Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex justify-between items-center sm:p-6 mb-2">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-green-50 rounded-xl flex items-center justify-center p-2 border border-green-100 relative group overflow-hidden">
                {product?.image_url || product?.image ? (
                   <img src={product.image_url || product.image} alt={product.name} className="h-full w-full object-contain" />
                ) : (
                  <div className="text-3xl opacity-75">🥛</div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Selected product</p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{product?.name}</h3>
                <p className="text-sm text-gray-500 mt-1 sm:mt-0">500ml • ₹{basePrice} per delivery</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 pb-1 pr-1">Base price</span>
              <p className="text-3xl font-extrabold text-green-700">₹{basePrice}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 pt-2">Select Subscription Plan</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Daily */}
            <div 
              onClick={() => setPlan('daily')} 
              className={`relative cursor-pointer rounded-2xl p-6 transition-all border-2 
                ${plan === 'daily' ? 'border-green-500 bg-white ring-4 ring-green-50 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'}
              `}
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2">Daily</h4>
              <p className="text-sm text-gray-500">Fresh delivery every morning</p>
            </div>

            {/* Monthly */}
            <div 
              onClick={() => setPlan('monthly')} 
              className={`relative cursor-pointer rounded-2xl p-6 transition-all border-2 
                ${plan === 'monthly' ? 'border-green-600 bg-white ring-4 ring-green-50 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'}
              `}
            >
              <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide shadow-sm">
                Most Popular
              </div>
              <div className="flex justify-between items-start">
                 <h4 className="text-xl font-bold text-gray-900 mb-2">Monthly</h4>
                 {plan === 'monthly' && <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <p className="text-sm font-bold text-green-600 mb-1">Save 10%</p>
              <p className="text-sm text-gray-400">Save 10% with monthly plan</p>
            </div>

            {/* Quarterly */}
            <div 
              onClick={() => setPlan('quarterly')} 
              className={`relative cursor-pointer rounded-2xl p-6 transition-all border-2 
                ${plan === 'quarterly' ? 'border-green-500 bg-white ring-4 ring-green-50 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'}
              `}
            >
              <div className="flex justify-between items-start">
                 <h4 className="text-xl font-bold text-gray-900 mb-2">Quarterly</h4>
                 {plan === 'quarterly' && <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <p className="text-sm font-bold text-green-600 mb-1">Save 15%</p>
              <p className="text-sm text-gray-400">Save 15% for 3 months</p>
            </div>

            {/* Yearly */}
            <div 
              onClick={() => setPlan('yearly')} 
              className={`relative cursor-pointer rounded-2xl p-6 transition-all border-2 
                ${plan === 'yearly' ? 'border-green-500 bg-white ring-4 ring-green-50 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'}
              `}
            >
              <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide shadow-sm">
                Best Value
              </div>
              <div className="flex justify-between items-start">
                 <h4 className="text-xl font-bold text-gray-900 mb-2">Yearly</h4>
                 {plan === 'yearly' && <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <p className="text-sm font-bold text-green-600 mb-1">Save 25%</p>
              <p className="text-sm text-gray-400">Save 25% with annual plan</p>
            </div>
          </div>

          <div>
             <h3 className="text-lg font-bold text-gray-900 pb-3">Quantity per Delivery</h3>
             <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-white inline-flex shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-600 transition-colors">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  </button>
                  <span className="w-12 text-center text-lg font-bold select-none">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-600 transition-colors">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                <span className="text-gray-400 font-medium">500ml per delivery</span>
             </div>
          </div>

          <div>
             <h3 className="text-lg font-bold text-gray-900 pb-3">Delivery Start Date</h3>
             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input max-w-xs shadow-sm bg-white" />
          </div>

        </div>

        {/* Right Side - Summary */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8 sticky top-28">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Payment Summary</h2>

            <div className="space-y-4 text-sm mb-6">
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">Product</span>
                 <span className="font-bold text-gray-900">{product?.name}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">Quantity</span>
                 <span className="font-bold text-gray-900">x{quantity}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">Plan</span>
                 <span className="font-bold text-gray-900 capitalize">{plan}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">Duration</span>
                 <span className="font-bold text-gray-900 capitalize">{duration} {duration === 1 ? 'day' : 'days'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">Price per delivery</span>
                 <span className="font-bold text-gray-900">₹{summary.pricePerDelivery}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">Discount</span>
                 <span className="font-bold text-green-600">-{summary.discount}%</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">You save</span>
                 <span className="font-bold text-green-600">₹{summary.savings}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-500">Start date</span>
                 <span className="font-bold text-gray-900">{startDate}</span>
               </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mb-6">
               <div className="flex justify-between items-center mb-1">
                 <span className="text-lg font-bold text-gray-900">Total Amount</span>
                 <span className="text-2xl font-extrabold text-green-700 block">₹{summary.totalAmount}</span>
               </div>
            </div>

            {summary.savings > 0 && (
              <div className="bg-green-50 text-green-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-2 mb-6 border border-green-100">
                🎉 You save ₹{summary.savings} with the {plan === 'monthly' ? 'Monthly' : plan === 'quarterly' ? 'Quarterly' : 'Yearly'} plan!
              </div>
            )}

            {error && <div className="text-rose-600 text-sm mb-4 font-semibold text-center">{error}</div>}

            <button 
              onClick={handlePay} 
              disabled={paying}
              className="btn-primary w-full h-14 text-base font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-75 disabled:hover:scale-100"
            >
              {paying ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-white/30" />
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Pay ₹{summary.totalAmount} Now
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
