import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
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
        setLoading(false)
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-green-600 mb-4" />
          <p className="text-gray-500 font-medium">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12">
          <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
            🥛
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn-primary">
            Back to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-8">
        <Link to="/" className="hover:text-green-700 transition-colors">Home</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* Left Column - Image Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden sticky top-28 group">
          <div className="aspect-[4/3] lg:aspect-square w-full bg-gray-50 relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-8xl text-gray-200">
                🥛
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center rounded-lg bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-bold text-green-700 uppercase tracking-wider shadow-sm border border-gray-100">
                {product.category_name}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-green-700 leading-none">₹{price}</span>
              <span className="text-sm font-medium text-gray-400">/ unit</span>
            </div>
            <div className="h-6 w-px bg-gray-200"></div>
            <div>
              {product.stock_quantity > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-base leading-relaxed text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Delivery & Subscription Options */}
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Delivery Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {planOptions.map((p) => {
                // Calculate the final price based on the base price * multiplier
                const basePrice = Number(product?.one_time_price || 0)
                const finalPrice = basePrice * (p.multiplier || 1)

                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlanType(p.value)}
                    className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-300 ${planType === p.value
                      ? 'border-green-600 bg-green-50/50 shadow-sm'
                      : 'border-white bg-white shadow-sm hover:border-green-200 hover:shadow-md'
                      }`}
                  >
                    {planType === p.value && (
                      <div className="absolute top-4 right-4 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                    <span className="font-bold text-gray-900 mb-1 leading-tight pr-6">{p.label}</span>
                    <span className="text-sm font-bold text-green-700">₹{finalPrice} / unit</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Quantity Selector */}
            <div className="flex items-center p-1 bg-white border border-gray-200 rounded-xl shadow-sm md:w-auto w-full">
              <button
                type="button"
                onClick={decrementQty}
                disabled={quantity <= 1}
                className="w-12 h-12 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
              </button>
              <div className="flex-1 sm:w-16 flex items-center justify-center font-bold text-gray-900 text-lg">
                {quantity}
              </div>
              <button
                type="button"
                onClick={incrementQty}
                disabled={quantity >= product.stock_quantity}
                className="w-12 h-12 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={user ? addToServerCart : addToGuestCart}
              disabled={saving || product.stock_quantity < 1}
              className="btn-primary flex-1 flex flex-col justify-center items-center h-14"
            >
              <span className="font-bold text-base">
                {saving ? 'Adding...' : product.stock_quantity < 1 ? 'Out of Stock' : 'Add to Cart'}
              </span>
              {!user && product.stock_quantity > 0 && !saving && (
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">(Login to Checkout)</span>
              )}
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <p className="text-sm font-medium text-rose-700">{error}</p>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-2xl mb-1">🌿</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Organic Source</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center border-x border-gray-100 px-2">
              <span className="text-2xl mb-1">❄️</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Cold Chain</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-2xl mb-1">🚚</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
