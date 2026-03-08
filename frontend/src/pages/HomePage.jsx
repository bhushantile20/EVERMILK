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
      setLoading(true)
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/api/categories/'),
          api.get('/api/products/'),
        ])

        const catData = Array.isArray(cRes.data) ? cRes.data : cRes.data?.results || []
        const prodData = Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || []

        setCategories(catData)
        setProducts(prodData)
      } finally {
        setLoading(false)
      }
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


  return (
    <div className="w-full">
      {/* ── Hero Section ── */}
      <section className="bg-green-50/50 py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left – Headline */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-1.5 text-xs font-bold text-green-700 shadow-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Freshly stocked every morning
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
                Farm-fresh milk, <br />
                <span className="text-green-700">delivered daily.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg">
                Experience the convenience of modern subscription management with the purity of farm-fresh dairy. No additives, no hassle — just pure health.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn-primary"
                >
                  View Products
                </button>
                <Link
                  to="/signup"
                  className="btn-secondary"
                >
                  Create Account
                </Link>
              </div>

              {/* Testimonials snippet */}
              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-sm shadow-sm ring-1 ring-gray-100">👩</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-sm shadow-sm ring-1 ring-gray-100">👨</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-sm shadow-sm ring-1 ring-gray-100">👵</div>
                </div>
                <div className="text-sm">
                  <div className="flex text-yellow-400">★★★★★</div>
                  <span className="text-gray-500 font-medium">Trusted by 2,000+ families</span>
                </div>
              </div>
            </div>

            {/* Right – Why choose us Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '🌿', title: '100% Natural', desc: 'Sourced directly from organic, trusted local farms.' },
                { icon: '⚡', title: 'Morning Delivery', desc: 'Fresh at your door every single morning before 7 AM.' },
                { icon: '📦', title: 'Smart Subscriptions', desc: 'Pause, cancel or modify your plan with one click.' },
                { icon: '💧', title: 'Zero Preservatives', desc: 'Pure milk without chemicals or adulteration.' },
              ].map((f, i) => (
                <div key={f.title} className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-green-200 ${i === 1 || i === 3 ? 'sm:mt-8' : ''}`}>
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Filter & Products ── */}
      <section id="products-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Products</h2>
              <p className="mt-2 text-gray-500">Select a one-time purchase or start a subscription seamlessly.</p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Filter:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${!selectedCategory ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  All
                </button>
                {categories.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(String(c.id))}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${String(selectedCategory) === String(c.id) ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="group bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-green-200"
              >
                {/* Image / Icon container */}
                <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-50 mb-6 relative">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl text-gray-200 transition-transform duration-500 group-hover:scale-110">
                      🥛
                    </div>
                  )}
                  {/* Subscription Badge */}
                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-extrabold text-green-700 uppercase tracking-wider shadow-sm border border-white">
                      Subscription Ready
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                      {p.name}
                    </h3>
                  </div>

                  <p className="text-sm font-medium text-gray-400 mb-4">{p.category_name}</p>

                  {/* Plans pill list */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {Object.entries(planLabel).map(([k, v]) => (
                      <span key={k} className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] uppercase font-bold text-gray-500">
                        {v}
                      </span>
                    ))}
                  </div>

                  {/* Footer of card */}
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Starting at</span>
                      <span className="text-2xl font-extrabold text-gray-900 leading-none">
                        ₹{p.one_time_price || 0}
                      </span>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-50 text-green-700 font-bold transition-all duration-300 group-hover:bg-green-700 group-hover:text-white group-hover:shadow-md">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {loading && (
            <div className="mt-16 flex flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-green-600" />
              <p className="mt-4 text-sm font-semibold text-gray-500">Loading catalog...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-16 text-center">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                🥛
              </div>
              <h3 className="text-lg font-bold text-gray-900">No products found</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">We couldn't find any products in this category at the moment. Please check back later.</p>
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className="btn-secondary mt-6"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
