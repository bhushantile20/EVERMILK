import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../app/apiClient'

export default function CheckoutPage() {
  const navigate = useNavigate()

  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [cartRes, addrRes] = await Promise.all([api.get('/api/cart/'), api.get('/api/addresses/')])
      setCart(cartRes.data)
      const addrData = Array.isArray(addrRes.data) ? addrRes.data : addrRes.data?.results || []
      setAddresses(addrData)
      if (addrData.length) {
        setSelectedAddressId(String(addrData[0].id))
      } else {
        setShowAddressForm(true)
      }
    } catch (e) {
      setError('Failed to load checkout')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const createAddress = async () => {
    const res = await api.post('/api/addresses/create/', {
      address_line: `${form.address_line1}${form.address_line2 ? `, ${form.address_line2}` : ''}`,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      is_default: true,
    })
    const created = res.data
    const next = [created, ...addresses]
    setAddresses(next)
    setSelectedAddressId(String(created.id))
    setShowAddressForm(false)
    return created
  }

  const formatAddress = (a) => {
    if (!a) return ''
    const line = a.address_line || ''
    const city = a.city || ''
    const state = a.state || ''
    const pin = a.pincode || ''
    return `${line}, ${city}, ${state} - ${pin}`.trim()
  }

  const startPayment = async () => {
    setError('')
    try {
      const cartRes = await api.get('/api/cart/')
      setCart(cartRes.data)
      if (!cartRes.data?.items?.length) {
        setError('Cart is empty')
        return
      }
    } catch (e) {
      setError('Failed to load cart')
      return
    }

    if (!selectedAddressId && (!form.address_line1 || !form.city || !form.pincode)) {
      setError('Select an address or fill in the new address form completely.')
      return
    }

    setShowPaymentModal(true)
  }

  const doPayment = async (success) => {
    setPaying(true)
    setError('')

    try {
      let addrId = selectedAddressId
      if (!addrId || showAddressForm) {
        const created = await createAddress()
        addrId = String(created.id)
      }

      const selectedAddress = addresses.find((a) => String(a.id) === String(addrId))
      const shippingAddressText = selectedAddress
        ? formatAddress(selectedAddress)
        : `${form.address_line1}${form.address_line2 ? `, ${form.address_line2}` : ''}, ${form.city}, ${form.state} - ${form.pincode}`

      const orderRes = await api.post('/api/orders/create/', {
        shipping_address: shippingAddressText,
      })
      const order = orderRes.data

      const paymentRes = await api.post('/api/payments/create/', {
        order_id: order?.id,
        payment_method: 'cash_on_delivery',
      })

      await api.post('/api/payments/verify/', {
        payment_id: paymentRes.data?.id,
        transaction_id: paymentRes.data?.transaction_id,
        status: success ? 'completed' : 'failed',
      })

      setShowPaymentModal(false)
      navigate('/dashboard/orders')
    } catch (e) {
      setError('Payment flow failed. Please try again.')
    } finally {
      setShowPaymentModal(false)
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-green-600 mb-4" />
          <p className="text-gray-500 font-medium">Preparing checkout...</p>
        </div>
      </div>
    )
  }

  if (!cart?.items?.length) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12">
          <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
            🛒
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">You have no items in your cart to checkout.</p>
          <Link to="/" className="btn-primary">
            Return to Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-20">

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Checkout</h1>
        <p className="mt-2 text-gray-500">Provide your delivery details and securely complete your order.</p>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* Left Column - Delivery Address */}
        <div className="lg:col-span-8 space-y-8">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
            </div>

            {addresses.length > 0 && !showAddressForm && (
              <div className="space-y-4">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer gap-4 rounded-xl border-2 p-5 transition-all duration-300 ${String(selectedAddressId) === String(a.id)
                      ? 'border-green-600 bg-green-50/30 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-green-200 hover:shadow-md'
                      }`}
                  >
                    <div className="pt-0.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${String(selectedAddressId) === String(a.id) ? 'border-green-600' : 'border-gray-300'}`}>
                        {String(selectedAddressId) === String(a.id) && <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">{a.full_name || 'Home'}</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {a.address_line1} {a.address_line2 && `, ${a.address_line2}`}
                        <br />
                        {a.city}, {a.state} - {a.pincode}
                      </p>
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Add a New Address
                </button>
              </div>
            )}

            {(showAddressForm || addresses.length === 0) && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">New Address</h3>
                  {addresses.length > 0 && (
                    <button type="button" onClick={() => setShowAddressForm(false)} className="text-sm font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
                    <input type="text" placeholder="John Doe" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input bg-white w-full" />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</label>
                    <input type="text" placeholder="+91 98765 43210" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input bg-white w-full" />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Address Line 1</label>
                    <input type="text" placeholder="House/Flat No., Building Name" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} className="input bg-white w-full" />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Address Line 2 (Optional)</label>
                    <input type="text" placeholder="Street, Area, Landmark" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} className="input bg-white w-full" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">City</label>
                    <input type="text" placeholder="Mumbai" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input bg-white w-full" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">State</label>
                    <input type="text" placeholder="Maharashtra" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input bg-white w-full" />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Pincode</label>
                    <input type="text" placeholder="400001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input bg-white w-1/2" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 opacity-50 pointer-events-none">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold">2</div>
              <h2 className="text-xl font-bold text-gray-900">Payment Option</h2>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-28">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-500 font-medium">{cart?.total_items || 0} Items</span>
              <span className="font-bold text-gray-900">₹{cart?.total_price || 0}</span>
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
                <span className="text-3xl font-extrabold text-gray-900 block leading-none">₹{cart?.total_price || 0}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Taxes Included</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100 flex gap-3">
            <div className="text-xl">💳</div>
            <div>
              <p className="font-bold text-green-900 text-sm mb-0.5">Cash on Delivery</p>
              <p className="text-xs text-green-700">You will pay at the time of delivery.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={startPayment}
            className="btn-primary w-full h-14 text-base shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>Confirm Order</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {showPaymentModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl transform transition-all scale-100">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-6">
              💳
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Simulate Payment</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                This is a demo payment gateway. Please choose the outcome of the transaction below.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={paying}
                onClick={() => doPayment(true)}
                className="btn-primary py-3.5 flex justify-center items-center"
              >
                {paying ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-white/30" />
                ) : '✅ Payment Successful'}
              </button>
              <button
                type="button"
                disabled={paying}
                onClick={() => doPayment(false)}
                className="btn-secondary py-3.5 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
              >
                ❌ Simulate Failure
              </button>
              <button
                type="button"
                disabled={paying}
                onClick={() => setShowPaymentModal(false)}
                className="text-sm font-bold text-gray-400 hover:text-gray-600 mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
