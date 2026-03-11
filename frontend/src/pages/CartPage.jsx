import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../app/apiClient'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setServerCart, setGuestItems } from '../features/cart/cartSlice'

const planLabel = {
  one_time: 'One-time Purchase',
  monthly: 'Monthly Plan',
  quarterly: 'Quarterly Plan',
  yearly: 'Yearly Plan',
}

export default function CartPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const guestItems = useAppSelector((s) => s.cart.guestItems)
  const serverCart = useAppSelector((s) => s.cart.serverCart)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadServerCart = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/cart/')
      dispatch(setServerCart(res.data))
    } catch (e) {
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadServerCart()
    }
  }, [user])

  const guestTotal = useMemo(() => {
    return guestItems.reduce((sum, i) => {
      const snap = i.product_snapshot
      const plan = i.plan_type
      const basePrice = Number(snap?.one_time_price || 0)
      const multiplier =
        plan === 'monthly' ? 30
          : plan === 'quarterly' ? 90
            : plan === 'yearly' ? 365
              : 1
      const price = basePrice * multiplier
      return sum + (Number.isNaN(price) ? 0 : price) * (i.quantity || 0)
    }, 0)
  }, [guestItems])

  const updateGuestQty = (idx, qty) => {
    const q = Math.max(1, Number(qty) || 1)
    const next = guestItems.map((it, i) => (i === idx ? { ...it, quantity: q } : it))
    dispatch(setGuestItems(next))
  }

  const removeGuest = (idx) => {
    const next = guestItems.filter((_, i) => i !== idx)
    dispatch(setGuestItems(next))
  }

  const updateServerQty = async (itemId, qty) => {
    setError('')
    try {
      await api.patch(`/api/cart/update/${itemId}/`, { quantity: Math.max(1, Number(qty) || 1) })
      await loadServerCart()
    } catch (e) {
      setError('Failed to update quantity')
    }
  }

  const removeServerItem = async (itemId) => {
    setError('')
    try {
      await api.delete(`/api/cart/remove/${itemId}/`)
      await loadServerCart()
    } catch (e) {
      setError('Failed to remove item')
    }
  }

  const onCheckout = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  const CartItemRow = ({ image, name, plan, unitPrice, lineTotal, quantity, onQtyChange, onRemove, onSubscribe }) => (
    <div className="flex gap-5 sm:gap-6 py-6 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 relative group">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-gray-200">🥛</div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-1">{name}</h3>
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
              {planLabel[plan] || plan}
            </span>
            {unitPrice != null && (
              <p className="text-sm font-medium text-gray-500 mt-2">₹{unitPrice} / unit</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-gray-900 leading-tight">₹{lineTotal}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 sm:mt-0">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 shadow-sm p-0.5">
            <button
              type="button"
              onClick={() => onQtyChange(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
            </button>
            <div className="w-10 text-center text-sm font-bold text-gray-900 select-none">
              {quantity}
            </div>
            <button
              type="button"
              onClick={() => onQtyChange(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>

          <div className="flex gap-4 items-center">
            {/* Subscribe Button */}
            <button
              type="button"
              onClick={onSubscribe}
              className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
            >
              Subscribe
            </button>
            {/* Remove Button */}
            <button
              type="button"
              onClick={onRemove}
              className="text-sm font-semibold text-rose-500 hover:text-rose-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const isCartEmpty = user ? (!serverCart?.items?.length) : (guestItems.length === 0)
  const cartTotal = user ? (serverCart?.total_price || 0) : guestTotal

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-20">

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Your Cart</h1>
        <p className="mt-2 text-gray-500">Review your subscription and one-time items before checkout.</p>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mb-8 flex items-center justify-center p-8 bg-white rounded-2xl border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-100 border-t-green-600 mb-3" />
            <p className="text-sm font-medium text-gray-500">Syncing cart...</p>
          </div>
        </div>
      )}

      {isCartEmpty && !loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center max-w-2xl mx-auto mt-8">
          <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
            🛒
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't added any fresh milk to your cart yet.</p>
          <Link to="/" className="btn-primary inline-flex">
            Browse Products
          </Link>
        </div>
      ) : !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Column - Cart Items */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Cart Items ({user ? serverCart?.items?.length : guestItems.length})
              </h2>
            </div>
            <div className="px-6 pb-2">
              {!user ? (
                <>
                  {guestItems.map((it, idx) => {
                    const snap = it.product_snapshot
                    const plan = it.plan_type
                    const basePrice = Number(snap?.one_time_price || 0)
                    const multiplier =
                      plan === 'monthly' ? 30
                        : plan === 'quarterly' ? 90
                          : plan === 'yearly' ? 365
                            : 1
                    const unit = basePrice * multiplier
                    const u = Number.isNaN(unit) ? 0 : unit
                    return (
                      <CartItemRow
                        key={`${it.product_id}-${it.plan_type}`}
                        image={snap?.image_url}
                        name={snap?.name || `Product #${it.product_id}`}
                        plan={it.plan_type}
                        unitPrice={u}
                        lineTotal={u * (it.quantity || 0)}
                        quantity={it.quantity}
                        onQtyChange={(v) => updateGuestQty(idx, v)}
                        onRemove={() => removeGuest(idx)}
                        onSubscribe={() => navigate(`/subscribe/${it.product_id}`, { state: { product: snap } })}
                      />
                    )
                  })}
                </>
              ) : (
                <>
                  {serverCart?.items?.map((it) => (
                    <CartItemRow
                      key={it.id}
                      image={it.product?.image_url || it.product?.image}
                      name={it.product?.name}
                      plan={it.plan_type}
                      unitPrice={it.price_at_time}
                      lineTotal={it.total_price}
                      quantity={it.quantity}
                      onQtyChange={(v) => updateServerQty(it.id, v)}
                      onRemove={() => removeServerItem(it.id)}
                      onSubscribe={() => navigate(`/subscribe/${it.product?.id}`, { state: { product: it.product } })}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-28">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">₹{cartTotal}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-500 font-medium">Delivery</span>
                <span className="font-bold text-green-600">Free</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mb-8">
              <div className="flex items-end justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-gray-900 block leading-none">₹{cartTotal}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Taxes Included</span>
                </div>
              </div>
            </div>

            {!user ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 text-center mb-4">You need an account to checkout and manage your subscriptions.</p>
                  <Link to="/login" className="btn-primary w-full shadow-md">
                    Login to Checkout
                  </Link>
                </div>
                <p className="text-xs text-center text-gray-400">
                  Don't have an account? <Link to="/signup" className="text-green-600 font-bold hover:underline">Sign up</Link>
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={onCheckout}
                disabled={!serverCart?.items?.length}
                className="btn-primary w-full h-14 text-base shadow-md disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            )}

            <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="text-xs font-semibold">Secure Checkout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
