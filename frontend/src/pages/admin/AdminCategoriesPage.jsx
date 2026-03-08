import { useEffect, useState } from 'react'
import { api } from '../../app/apiClient'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/categories/')
      const data = Array.isArray(res.data) ? res.data : res.data?.results || []
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => setError('Failed to load'))
  }, [])

  const startCreate = () => {
    setEditing(null)
    setName('')
    setDescription('')
  }

  const startEdit = (c) => {
    setEditing(c)
    setName(c.name)
    setDescription(c.description || '')
  }

  const save = async () => {
    setError('')
    try {
      if (editing) {
        await api.put(`/api/categories/${editing.id}/`, { name, description, is_active: true })
      } else {
        await api.post('/api/categories/', { name, description, is_active: true })
      }
      await load()
      startCreate()
    } catch (e) {
      setError('Failed to save category')
    }
  }

  const remove = async (c) => {
    setError('')
    if (!window.confirm(`Are you sure you want to delete category "${c.name}"?`)) return
    try {
      await api.delete(`/api/categories/${c.id}/`)
      await load()
    } catch (e) {
      setError('Failed to delete category')
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

      {/* Category List Panel */}
      <div className="lg:col-span-7 rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[50vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/30">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Categories</h1>
            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">{categories.length} Items</p>
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

        <div className="flex-1 p-4 space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl mb-3">📁</div>
              <p className="text-sm font-bold text-gray-500">No categories found.</p>
            </div>
          ) : (
            categories.map((c) => (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 hover:border-green-300 hover:shadow-sm transition-all group">
                <div>
                  <div className="text-base font-bold text-gray-900 leading-tight mb-0.5 group-hover:text-green-700 transition-colors">{c.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[250px]">{c.description || 'No description'}</div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end">
                  <button onClick={() => startEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => remove(c)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
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
          {editing ? (
            <span>Editing: <span className="text-green-700">{editing.name}</span></span>
          ) : 'Create Category'}
          {editing && (
            <button onClick={startCreate} className="text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-50 px-2.5 py-1 rounded-md">Cancel Edit</button>
          )}
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dairy"
              className="input bg-white w-full shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the category..."
              className="input bg-white w-full shadow-sm py-3"
              rows={4}
            />
          </div>

          <button
            type="button"
            onClick={save}
            className="btn-primary w-full py-3.5 mt-6 shadow-md shadow-green-600/20"
          >
            {editing ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  )
}
