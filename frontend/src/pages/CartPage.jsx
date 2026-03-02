import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../app/apiClient'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setServerCart, setGuestItems } from '../features/cart/cartSlice'

const planLabel = {
  one_time: 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
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
      const price = Number(
        plan === 'one_time'
          ? snap?.one_time_price
          : plan === 'monthly'
            ? snap?.monthly_price
            : plan === 'quarterly'
              ? snap?.quarterly_price
              : snap?.yearly_price,
      )
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

  const CartItemRow = ({ image, name, plan, unitPrice, lineTotal, quantity, onQtyChange, onRemove }) => (
    <div className="flex gap-4 rounded-2xl border border-green-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-green-50">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🥛</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 truncate">{name}</p>
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 mt-1">
          {planLabel[plan]}
        </span>
        {unitPrice != null && (
          <p className="text-xs text-slate-500 mt-1">Unit: ₹{unitPrice}</p>
        )}
        <p className="text-sm font-semibold text-slate-700 mt-0.5">Line total: ₹{lineTotal}</p>
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Qty</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => onQtyChange(e.target.value)}
            className="input w-20 py-1.5 text-center"
          />
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors duration-150"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="card-header">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">🛒 Your Cart</h1>
              <p className="mt-0.5 text-sm text-slate-500">Review your items and proceed to checkout.</p>
            </div>
          </div>
          {error ? (
            <p className="mt-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">{error}</p>
          ) : null}
          {loading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-green-600" />
              Loading cart…
            </div>
          ) : null}
        </div>

        <div className="card-body">
          {!user ? (
            /* ── Guest Cart ── */
            <div className="space-y-4">
              {guestItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-green-200 bg-green-50 p-10 text-center">
                  <p className="text-3xl mb-2">🛒</p>
                  <p className="text-sm font-semibold text-slate-700">Your cart is empty.</p>
                  <Link to="/" className="btn-primary mt-4">Browse products</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {guestItems.map((it, idx) => {
                    const snap = it.product_snapshot
                    const plan = it.plan_type
                    const unit = Number(
                      plan === 'one_time' ? snap?.one_time_price
                        : plan === 'monthly' ? snap?.monthly_price
                          : plan === 'quarterly' ? snap?.quarterly_price
                            : snap?.yearly_price
                    )
                    const u = Number.isNaN(unit) ? 0 : unit
                    return (
                      <CartItemRow
                        key={`${it.product_id}-${it.plan_type}`}
                        image={snap?.image_url}
                        name={snap?.name || `Product #${it.product_id}`}
                        plan={it.plan_type}
                        lineTotal={u * (it.quantity || 0)}
                        quantity={it.quantity}
                        onQtyChange={(v) => updateGuestQty(idx, v)}
                        onRemove={() => removeGuest(idx)}
                      />
                    )
                  })}

                  <div className="flex items-center justify-between rounded-2xl bg-green-50 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-700">Total</p>
                    <p className="text-xl font-extrabold text-green-700">₹{guestTotal}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-white px-5 py-4">
                <p className="text-sm text-slate-600">Login required to checkout.</p>
                <Link to="/login" className="btn-primary">
                  Login to checkout
                </Link>
              </div>
            </div>
          ) : (
            /* ── Server Cart ── */
            <div className="space-y-4">
              {serverCart?.items?.length ? (
                <div className="space-y-3">
                  {serverCart.items.map((it) => (
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
                    />
                  ))}

                  <div className="flex items-center justify-between rounded-2xl bg-green-50 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-700">Total</p>
                    <p className="text-xl font-extrabold text-green-700">₹{serverCart.total_price}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-green-200 bg-green-50 p-10 text-center">
                  <p className="text-3xl mb-2">🛒</p>
                  <p className="text-sm font-semibold text-slate-700">Your cart is empty.</p>
                  <Link to="/" className="btn-primary mt-4">Browse products</Link>
                </div>
              )}

              <button
                type="button"
                onClick={onCheckout}
                disabled={!serverCart?.items?.length}
                className="btn-primary w-full py-3 text-base disabled:opacity-60"
              >
                Proceed to Checkout →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
