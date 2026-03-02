import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../app/apiClient'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setGuestItems } from '../features/cart/cartSlice'

const planOptions = [
  { value: 'one_time', label: 'One-time', priceKey: 'one_time_price' },
  { value: 'monthly', label: 'Monthly', priceKey: 'monthly_price' },
  { value: 'quarterly', label: 'Quarterly', priceKey: 'quarterly_price' },
  { value: 'yearly', label: 'Yearly', priceKey: 'yearly_price' },
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const guestItems = useAppSelector((s) => s.cart.guestItems)

  const [product, setProduct] = useState(null)
  const [planType, setPlanType] = useState('one_time')
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

  const addToGuestCart = () => {
    const pid = Number(id)
    const q = 1

    const existingIndex = guestItems.findIndex(
      (i) => String(i.product_id) === String(pid) && i.plan_type === planType,
    )

    const next = [...guestItems]
    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: next[existingIndex].quantity + q,
      }
    } else {
      next.push({
        product_id: pid,
        plan_type: planType,
        quantity: q,
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
        quantity: 1,
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
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="card p-8 text-center">
        <p className="text-2xl mb-3">🥛</p>
        <p className="text-sm font-semibold text-slate-700">Product not found.</p>
        <Link to="/" className="btn-primary mt-4">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Image Card */}
      <div className="card overflow-hidden">
        <div className="aspect-[4/3] w-full overflow-hidden bg-green-50">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">
              🥛
            </div>
          )}
        </div>
      </div>

      {/* Details Card */}
      <div className="card p-6">
        <div className="mb-1">
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            {product.category_name}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
          {product.name}
        </h1>
        {product.description ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.description}</p>
        ) : null}

        <div className="mt-6 space-y-5">
          {/* Plan Selector */}
          <div>
            <p className="text-sm font-bold text-slate-800 mb-2">Choose a Plan</p>
            <div className="grid grid-cols-2 gap-2">
              {planOptions.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlanType(p.value)}
                  className={`rounded-xl border-2 px-4 py-3 text-left text-sm transition-all duration-200 ${planType === p.value
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                    }`}
                >
                  <div className="font-semibold text-slate-900">{p.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">₹{Number(product[p.priceKey])}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between rounded-2xl bg-green-50 px-5 py-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</p>
              <p className="text-3xl font-extrabold text-green-700 mt-0.5">₹{price}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Stock</p>
              <p className="text-sm font-bold text-slate-700">
                {product.stock_quantity} {product.stock_quantity === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {error ? (
            <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={user ? addToServerCart : addToGuestCart}
            disabled={saving}
            className="btn-primary w-full py-3 text-base disabled:opacity-60"
          >
            {saving ? '⏳ Adding...' : user ? '🛒 Add to Cart' : '🛒 Add to Cart (login to checkout)'}
          </button>
        </div>
      </div>
    </div>
  )
}
