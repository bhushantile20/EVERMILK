import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../app/apiClient'

const planLabel = {
  one_time: 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col animate-pulse">
    <div className="aspect-[4/3] w-full bg-slate-100" />
    <div className="p-6 lg:p-8 space-y-4">
      <div className="h-6 bg-slate-100 rounded w-3/4" />
      <div className="h-4 bg-slate-100 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-6 bg-slate-100 rounded-lg w-16" />
        <div className="h-6 bg-slate-100 rounded-lg w-16" />
      </div>
      <div className="pt-5 border-t border-slate-50 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-12" />
          <div className="h-6 bg-slate-100 rounded w-20" />
        </div>
        <div className="h-12 w-12 bg-slate-100 rounded-xl" />
      </div>
    </div>
  </div>
)

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
        setTimeout(() => setLoading(false), 800) // Slight delay for smoother feel
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
    <div className="w-full bg-[var(--bg-main)] selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
      <style>{`
        .bottle-shadow { filter: drop-shadow(0 25px 35px rgba(16, 185, 129, 0.15)); }
      `}</style>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-50/40 dark:from-emerald-950/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left – Headline */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                EverMilk — Fresh Daily
              </div>

              <h1 className="text-4.5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.1]">
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

            </motion.div>

            {/* Right – Animation Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="relative flex justify-center lg:justify-end items-center px-4 w-full"
            >
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 lg:w-96 lg:h-96 bg-emerald-200/40 rounded-full blur-3xl shadow-[0_0_100px_rgba(16,185,129,0.2)]" />

              {/* Premium Product Showcase Image */}
              <div className="relative z-10 bottle-shadow flex justify-center items-center w-full max-w-md lg:max-w-lg transition-transform duration-700 hover:scale-[1.02]">
                <img 
                  src="/hero-milk.png" 
                  alt="Premium Fresh Milk Presentation" 
                  className="w-full h-auto object-contain rounded-[2.5rem] drop-shadow-2xl border border-white/50" 
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-slate-50 py-24 border-t border-slate-100"
      >
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
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl hover:border-emerald-100 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── About Us Section ── */}
      <section id="about-section" className="py-28 bg-white border-t border-slate-100 overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-6">
                Our Story
              </div>
              <h2 className="text-3.5xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
                Rooted in purity. <br className="hidden md:block" />
                <span className="text-emerald-600">Dedicated to your family.</span>
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed font-medium mb-6">
                EverMilk was founded on a simple, uncompromising belief: everyone deserves access to real, honest dairy. In a world of over-processed alternatives, we chose to go back to the roots.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">
                We work exclusively with local, organic farmers whose cows graze freely on natural pastures. By completely eliminating the middlemen, we ensure that the milk arriving at your doorstep before 7 AM is exactly as nature intended. No preservatives, no dilution—just wholesome nutrition.
              </p>
              
              <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-slate-100 text-center lg:text-left">
                <div>
                  <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">100%</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Organic</div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">&lt; 12h</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Farm to Door</div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">Zero</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Additives</div>
                </div>
              </div>
            </motion.div>
            
            {/* Right Card Graphic */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-full min-h-[450px] w-full order-1 lg:order-2 flex items-center justify-center"
            >
              {/* Back Decorative Card */}
              <div className="absolute inset-0 right-4 lg:right-12 left-4 lg:left-0 top-10 bottom-0 bg-emerald-100/50 border border-emerald-100 rounded-[2.5rem] shadow-sm transform rotate-3 transition-transform duration-700 hover:rotate-6"></div>
              
              {/* Front Main Card */}
              <div className="absolute inset-x-0 sm:inset-x-8 lg:inset-x-0 bottom-8 top-0 lg:right-12 bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 sm:p-12 flex flex-col justify-between overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-emerald-500/20 transition-colors duration-500">
                    <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L6.643 12.8 10.823 17 18.357 9.424l-1.415-1.422-6.119 6.138z"/>
                    </svg>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-[1.15] mb-5 tracking-tight">
                    Committed to <br className="hidden sm:block"/> Transparency
                  </h3>
                  <p className="text-slate-300 font-medium text-lg leading-relaxed max-w-sm">
                    We trace every single bottle back to the specific farm it came from. You always know exactly what your family is drinking.
                  </p>
                </div>
                
                <div className="relative z-10 flex items-center gap-5 pt-8 border-t border-slate-700/50 mt-10">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl border border-emerald-500/30 shrink-0">
                    🌱
                  </div>
                  <div>
                    <div className="text-white font-bold tracking-wide">Sustainable Impact</div>
                    <div className="text-emerald-400 text-sm font-medium mt-0.5">Returnable glass bottles</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Category Filter & Products ── */}
      <section id="products-section" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          >
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
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${!selectedCategory ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  All
                </button>
                {categories.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(String(c.id))}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${String(selectedCategory) === String(c.id) ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)
            ) : (
              filtered.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={`/products/${p.id}`}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-emerald-200"
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
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: -10 }}
                          whileTap={{ scale: 0.9 }}
                          className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-md"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

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
