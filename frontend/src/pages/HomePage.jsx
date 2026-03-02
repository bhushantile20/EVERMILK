import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../app/apiClient'

const planLabel = {
  one_time: 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const run = async () => {
      const [cRes, pRes] = await Promise.all([
        api.get('/api/categories/'),
        api.get('/api/products/'),
      ])

      const catData = Array.isArray(cRes.data) ? cRes.data : cRes.data?.results || []
      const prodData = Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || []

      setCategories(catData)
      setProducts(prodData)
    }

    run()
  }, [])

  const filtered = useMemo(() => {
    if (!selectedCategory) return products
    return products.filter((p) => {
      const catId = p.category
      return String(catId) === String(selectedCategory)
    })
  }, [products, selectedCategory])

  const minPrice = (p) => {
    const vals = [p.one_time_price, p.monthly_price, p.quarterly_price, p.yearly_price]
      .map((x) => Number(x))
      .filter((x) => !Number.isNaN(x))
    return vals.length ? Math.min(...vals) : 0
  }

  return (
    <div className="space-y-10">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 px-8 py-14 md:py-20 shadow-2xl">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          {/* Left – Headline */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm mb-5">
              🌿 Farm-fresh • Subscription-ready • Fast checkout
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Pure Milk,
              <span className="block text-green-100">Delivered Daily.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-green-100 max-w-md">
              Pick your favourite milk, select a plan — one-time or subscription — and manage everything from your dashboard. Fresh, pure, delivered fast.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700 shadow-lg transition-all duration-200 hover:bg-green-50 hover:shadow-xl hover:scale-[1.03]"
              >
                🛒 Shop Now
              </button>
              <Link
                to="/signup"
                className="rounded-xl bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md ring-1 ring-inset ring-white/30 transition-all duration-200 hover:bg-white/30 hover:shadow-lg hover:scale-[1.03]"
              >
                📋 Subscribe Now
              </Link>
            </div>
          </div>

          {/* Right – Why choose us */}
          <div className="space-y-3">
            {[
              { icon: '🌿', title: '100% Natural', desc: 'No preservatives. Straight from healthy cattle.' },
              { icon: '⚡', title: 'Daily Delivery', desc: 'Fresh milk at your doorstep every morning.' },
              { icon: '📦', title: 'Flexible Plans', desc: 'One-time, monthly, quarterly or yearly subscriptions.' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 rounded-2xl bg-white/15 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-white/20">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p className="text-xs text-green-100 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="card overflow-hidden">
        <div className="card-body">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Filter by category</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select a category to instantly filter products</p>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select w-full sm:w-48"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={!selectedCategory ? 'btn-primary' : 'btn-secondary'}
            >
              All
            </button>
            {categories.slice(0, 8).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(String(c.id))}
                className={String(selectedCategory) === String(c.id) ? 'btn-primary' : 'btn-secondary'}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Our Products</h2>
            <p className="text-sm text-slate-500 mt-0.5">Choose a plan at the product page and add to cart.</p>
          </div>
          <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
            {filtered.length} items
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              {/* Image */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-green-50">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl">
                    🥛
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold leading-tight text-slate-900 group-hover:text-green-700 transition-colors duration-200">
                    {p.name}
                  </h3>
                  <span className="shrink-0 rounded-full bg-green-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                    From ₹{minPrice(p)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{p.category_name}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(planLabel).map(([k, v]) => (
                      <span key={k} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {v}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-green-600 group-hover:text-green-700 transition-colors">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          </div>
        ) : null}

        {!loading && filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-green-200 bg-green-50 p-10 text-center">
            <p className="text-2xl mb-2">🥛</p>
            <p className="text-sm font-semibold text-slate-700">No products found in this category.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className="btn-primary mt-4"
            >
              View all products
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
