import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchAdminSubscriptions, cancelAdminSubscription } from '../../features/subscription/subscriptionAdminSlice'

export default function AdminSubscriptions() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { subscriptions, loading, error } = useAppSelector(s => s.adminSubscription)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All') // All, Active, Paused, Cancelled

  useEffect(() => {
    dispatch(fetchAdminSubscriptions())
  }, [dispatch])

  const handleCancelClick = async (subId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      await dispatch(cancelAdminSubscription(subId))
    }
  }

  const exportCSV = () => {
    if (!subscriptions || subscriptions.length === 0) return

    const generateCSV = (data) => {
      const headers = ['ID', 'Customer', 'Contact', 'Product', 'Plan', 'Amount', 'Status', 'Next Date']
      const rows = data.map(sub => [
        sub.subscription_id,
        sub.customer_name,
        sub.phone_number,
        sub.product_name,
        sub.plan_type,
        sub.amount,
        sub.status,
        sub.next_delivery_date || 'N/A'
      ])
      let csvContent = headers.join(',') + '\n'
      rows.forEach(row => {
        csvContent += row.map(str => `"${str}"`).join(',') + '\n'
      })
      return csvContent
    }

    const csvData = generateCSV(filteredSubs)
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'subscriptions_export.csv'
    link.click()
  }

  let filteredSubs = subscriptions || []
  
  if (activeTab !== 'All') {
    filteredSubs = filteredSubs.filter(s => s.status.toLowerCase() === activeTab.toLowerCase())
  }
  
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase()
    filteredSubs = filteredSubs.filter(s => 
      (s.customer_name || '').toLowerCase().includes(q) ||
      (s.product_name || '').toLowerCase().includes(q) ||
      (s.subscription_id || '').toLowerCase().includes(q)
    )
  }

  // Stat calculations
  const totalCount = subscriptions.length
  const activeCount = subscriptions.filter(s => s.status === 'active').length
  const pausedCount = subscriptions.filter(s => s.status === 'paused').length
  const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">active</span>
      case 'paused':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">paused</span>
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">cancelled</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-4 md:p-0">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">{totalCount} total subscriptions</p>
        </div>
        <button 
          onClick={exportCSV}
          className="btn-secondary text-sm border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2 py-2 px-4 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Export
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-2 border-b border-gray-100 pb-4">
        {/* Tabs */}
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab('All')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All ({totalCount})
          </button>
          <button 
            onClick={() => setActiveTab('Active')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'Active' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            Active ({activeCount})
          </button>
          <button 
            onClick={() => setActiveTab('Paused')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'Paused' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
          >
            Paused ({pausedCount})
          </button>
          <button 
            onClick={() => setActiveTab('Cancelled')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'Cancelled' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-auto min-w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="input w-full pl-10 bg-white border-gray-200 focus:ring-green-500 focus:border-green-500 rounded-xl"
            placeholder="Search customer or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-50 p-4 border border-rose-100 text-rose-700 text-sm font-medium">
          {error}
        </div>
      ) : loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-green-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Next Date</th>
                  <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredSubs.length > 0 ? (
                  filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-medium">
                        {sub.subscription_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {sub.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sub.phone_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {sub.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {sub.plan_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-green-700">
                        ₹{parseFloat(sub.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sub.next_delivery_date || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold space-x-3">
                        <button 
                          onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View
                        </button>
                        {sub.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleCancelClick(sub.id)}
                            className="text-rose-600 hover:text-rose-900 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/30">
                      No matching subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
