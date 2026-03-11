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
    <div className="w-full bg-white selection:bg-emerald-100 selection:text-emerald-900">
      <style>{`
        .bottle-shadow { filter: drop-shadow(0 25px 35px rgba(16, 185, 129, 0.15)); }
        
        .milk-fill {
          animation: milkRise 7s ease-in-out infinite;
        }
        
        .milk-wave {
          animation: milkWave 2.5s linear infinite;
        }
        
        .milk-drop {
          animation: drip 7s ease-in infinite;
        }
        
        .milk-ripple {
          animation: ripple 7s ease-out infinite;
          transform-origin: center;
        }
        
        @keyframes milkRise {
          0%, 10% { transform: translateY(180px); }
          40%, 85% { transform: translateY(30px); }
          95%, 100% { transform: translateY(180px); }
        }
        
        @keyframes milkWave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100px); }
        }
        
        @keyframes drip {
          0%, 35% { transform: translateY(-15px) scale(0); opacity: 0; }
          40% { transform: translateY(-15px) scale(1); opacity: 1; }
          43% { transform: translateY(40px) scale(1); opacity: 0; }
          100% { transform: translateY(40px) scale(0); opacity: 0; }
        }
        
        @keyframes ripple {
          0%, 41% { transform: scale(0) scaleY(0.2); opacity: 0; }
          43% { transform: scale(1) scaleY(0.2); opacity: 0.8; }
          48% { transform: scale(3.5) scaleY(0.2); opacity: 0; }
          100% { transform: scale(3.5) scaleY(0.2); opacity: 0; }
        }
      `}</style>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-50/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left – Headline */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                EverMilk — Fresh Daily
              </div>

              <h1 className="text-4.5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Farm-fresh milk, <br />
                <span className="text-emerald-600">delivered daily.</span>
              </h1>

              <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg font-medium">
                Experience the convenience of modern subscription management paired with the purity of farm-fresh dairy. Start your morning right with pure, zero-preservative milk.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  View Products
                </button>
                <Link
                  to="/signup"
                  className="rounded-xl bg-white border border-slate-200 px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
                >
                  Create Account
                </Link>
              </div>

              {/* Trust snippet */}
              <div className="mt-12 flex items-center gap-4 border-t border-slate-100 pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 shadow-sm object-cover" />
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex text-amber-400 text-sm gap-0.5">
                    {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                  </div>
                  <span className="text-sm font-medium text-slate-500">Trusted by <span className="text-slate-900 font-bold">2,000+</span> families</span>
                </div>
              </div>
            </div>

            {/* Right – Animation Container */}
            <div className="relative flex justify-center lg:justify-end items-center px-4 w-full">
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 lg:w-96 lg:h-96 bg-emerald-200/40 rounded-full blur-3xl shadow-[0_0_100px_rgba(16,185,129,0.2)]" />

              {/* Glass Milk Bottle Animation */}
              <div className="relative z-10 bottle-shadow">
                <svg width="240" height="360" viewBox="0 0 100 200" className="drop-shadow-sm">
                  <defs>
                    <clipPath id="bottleMask">
                      <path d="M35 15 L65 15 C68 15, 70 17, 70 20 L70 35 C70 45, 85 55, 85 80 L85 180 C85 190, 75 195, 50 195 C25 195, 15 190, 15 180 L15 80 C15 55, 30 45, 30 35 L30 20 C30 17, 32 15, 35 15 Z" />
                    </clipPath>
                    {/* Continuous double wave for smooth looping */}
                    <path id="wavePath" d="M0 20 Q 25 40 50 20 T 100 20 T 150 20 T 200 20 L 200 200 L 0 200 Z" />
                  </defs>

                  {/* Bottle Background (Inner shadow/glass back) */}
                  <path d="M35 15 L65 15 C68 15, 70 17, 70 20 L70 35 C70 45, 85 55, 85 80 L85 180 C85 190, 75 195, 50 195 C25 195, 15 190, 15 180 L15 80 C15 55, 30 45, 30 35 L30 20 C30 17, 32 15, 35 15 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

                  {/* Milk Fill animating upwards with waves */}
                  <g clipPath="url(#bottleMask)">
                    <g className="milk-fill">
                      <use href="#wavePath" className="milk-wave" fill="#ffffff" />
                      {/* Add slightly darker wave behind for depth */}
                      <use href="#wavePath" className="milk-wave" fill="#f1f5f9" style={{ animationDelay: '-1s', opacity: 0.5, transform: 'translateY(-5px) scaleX(-1)' }} />
                    </g>
                    {/* Ripple Effect */}
                    <circle cx="50" cy="40" r="10" fill="none" stroke="#fff" strokeWidth="2" className="milk-ripple" />
                  </g>

                  {/* Drop Effect falling in */}
                  <circle cx="50" cy="0" r="4" fill="#ffffff" className="milk-drop" />

                  {/* Bottle highlights / Reflection */}
                  <path d="M22 85 L22 175 C22 180, 24 185, 27 188" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M78 85 L78 120" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <ellipse cx="50" cy="15" rx="14" ry="2" fill="rgba(226, 232, 240, 0.5)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="bg-slate-50 py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Why choose EverMilk?</h2>
            <p className="mt-4 text-slate-500 font-medium text-lg">We bring the best of nature directly to your doorstep with modern ease.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🌿', title: '100% Natural', desc: 'Sourced directly from organic, trusted local farms.' },
              { icon: '🌅', title: 'Morning Delivery', desc: 'Fresh at your door every single morning before 7 AM.' },
              { icon: '📱', title: 'Smart Subscriptions', desc: 'Pause, cancel or modify your plan with one click.' },
              { icon: '✨', title: 'Zero Preservatives', desc: 'Pure, chemical-free milk for your entire family.' },
            ].map((f, i) => (
              <div key={i} className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Filter & Products ── */}
      <section id="products-section" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Our Products</h2>
              <p className="mt-4 text-slate-500 text-lg font-medium">Select a one-time purchase or start a subscription seamlessly.</p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Filter:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${!selectedCategory ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  All
                </button>
                {categories.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(String(c.id))}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${String(selectedCategory) === String(c.id) ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200"
              >
                {/* Image / Icon container */}
                <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden flex-shrink-0 border-b border-slate-100">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-7xl transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-sm">
                      🥛
                    </div>
                  )}
                  {/* Subscription Badge */}
                  <div className="absolute top-4 left-4 flex gap-1">
                    <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest shadow-sm border border-white/50">
                      Subscription Ready
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                  </div>

                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">{p.category_name}</p>

                  {/* Plans pill list */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {Object.entries(planLabel).map(([k, v]) => (
                      <span key={k} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        {v}
                      </span>
                    ))}
                  </div>

                  {/* Footer of card */}
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Starting at</span>
                      <span className="text-2xl font-black text-slate-900">
                        ₹{parseFloat(p.one_time_price || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-md group-hover:-rotate-12">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {loading && (
            <div className="mt-20 flex flex-col items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-emerald-600 shadow-sm" />
              <p className="mt-5 text-sm font-bold text-slate-500 uppercase tracking-widest">Loading catalog...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-20 text-center">
              <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 text-3xl">
                🥛
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">No products found</h3>
              <p className="text-base text-slate-500 mt-3 max-w-md mx-auto font-medium">We couldn't find any products in this category at the moment. Please check back later.</p>
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className="mt-8 rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
