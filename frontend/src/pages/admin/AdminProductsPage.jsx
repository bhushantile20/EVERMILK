import { useEffect, useState } from 'react'
import { api } from '../../app/apiClient'

const empty = {
  name: '',
  category: '',
  description: '',
  one_time_price: 0,
  monthly_price: 0,
  quarterly_price: 0,
  yearly_price: 0,
  stock_quantity: 0,
  is_active: true,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(empty)
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([api.get('/api/products/'), api.get('/api/categories/')])
      const prodData = Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || []
      const catData = Array.isArray(cRes.data) ? cRes.data : cRes.data?.results || []
      setProducts(prodData)
      setCategories(catData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => setError('Failed to load data'))
  }, [])

  const startCreate = () => {
    setSelected(null)
    setForm(empty)
    setImage(null)
  }

  const startEdit = (p) => {
    setSelected(p)
    setForm({
      name: p.name,
      category: p.category,
      description: p.description || '',
      one_time_price: p.one_time_price || 0,
      monthly_price: p.monthly_price || 0,
      quarterly_price: p.quarterly_price || 0,
      yearly_price: p.yearly_price || 0,
      stock_quantity: p.stock_quantity || 0,
      is_active: p.is_active,
    })
    setImage(null)
  }

  const save = async () => {
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append('image', image)

      if (selected) {
        await api.put(`/api/products/${selected.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await api.post('/api/products/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      await load()
      startCreate()
    } catch (e) {
      setError('Failed to save product. Check inputs and try again.')
    }
  }

  const remove = async (p) => {
    setError('')
    if (!window.confirm(`Are you sure you want to delete "${p.name}"?`)) return
    try {
      await api.delete(`/api/products/${p.id}/`)
      await load()
    } catch (e) {
      setError('Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-100 border-t-green-600" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

      {/* Product List Panel */}
      <div className="lg:col-span-7 rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/30">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Products Inventory</h1>
            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">{products.length} Items</p>
          </div>
          <button onClick={startCreate} className="btn-primary py-2 px-4 shadow-sm text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add New
          </button>
        </div>

        {error ? (
          <div className="m-4 rounded-xl bg-rose-50 border border-rose-100 p-3 flex items-start gap-3">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl mb-3">🍼</div>
              <p className="text-sm font-bold text-gray-500">No products found.</p>
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 hover:border-green-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                    {p.image_url || p.image ? (
                      <img src={p.image_url || p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🥛</div>
                    )}
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900 leading-tight mb-0.5 group-hover:text-green-700 transition-colors">{p.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{p.category_name || 'Uncategorized'}</span>
                      {p.is_active ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm" title="Active"></span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-300 shadow-sm" title="Inactive"></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end">
                  <div className="text-right mr-3 hidden sm:block">
                    <div className="text-xs font-bold text-gray-900">₹{p.one_time_price}</div>
                    <div className="text-[10px] text-gray-500 font-semibold">{p.stock_quantity} in stock</div>
                  </div>
                  <button onClick={() => startEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => remove(p)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-5 rounded-3xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8 self-start sticky top-28">
        <h2 className="text-lg font-extrabold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          {selected ? (
            <span>Editing: <span className="text-green-700">{selected.name}</span></span>
          ) : 'Create New Product'}
          {selected && (
            <button onClick={startCreate} className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-50 px-2.5 py-1 rounded-md">Cancel Edit</button>
          )}
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Farm Fresh Cow Milk"
              className="input bg-white w-full shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input bg-white w-full cursor-pointer shadow-sm"
            >
              <option value="" disabled>Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Briefly describe the product..."
              className="input bg-white w-full shadow-sm py-3"
              rows={3}
            />
          </div>

          <div className="pt-4 border-t border-gray-50">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Pricing Plans (₹)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">One-time</label>
                <input
                  type="number"
                  value={form.one_time_price}
                  onChange={(e) => setForm({ ...form, one_time_price: e.target.value })}
                  className="input bg-white w-full mt-1 px-3 py-2 text-sm text-center font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Monthly</label>
                <input
                  type="number"
                  value={form.monthly_price}
                  onChange={(e) => setForm({ ...form, monthly_price: e.target.value })}
                  className="input bg-white w-full mt-1 px-3 py-2 text-sm text-center font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Quarterly</label>
                <input
                  type="number"
                  value={form.quarterly_price}
                  onChange={(e) => setForm({ ...form, quarterly_price: e.target.value })}
                  className="input bg-white w-full mt-1 px-3 py-2 text-sm text-center font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Yearly</label>
                <input
                  type="number"
                  value={form.yearly_price}
                  onChange={(e) => setForm({ ...form, yearly_price: e.target.value })}
                  className="input bg-white w-full mt-1 px-3 py-2 text-sm text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock Qty</label>
              <input
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                className="input bg-white w-full mt-1 px-3 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer p-2 border border-gray-200 rounded-lg justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={!!form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500 accent-green-600"
              />
              Product is Active
            </label>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={save}
            className="btn-primary w-full py-3.5 mt-6 shadow-md shadow-green-600/20"
          >
            {selected ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  )
}
