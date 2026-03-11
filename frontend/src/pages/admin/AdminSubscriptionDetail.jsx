import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchAdminSubscriptionDetail, cancelAdminSubscription, deleteAdminSubscription, clearCurrentDetail } from '../../features/subscription/subscriptionAdminSlice'

export default function AdminSubscriptionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  
  const { currentDetail, loading, error } = useAppSelector(s => s.adminSubscription)

  useEffect(() => {
    dispatch(fetchAdminSubscriptionDetail(id))
    return () => {
      dispatch(clearCurrentDetail())
    }
  }, [dispatch, id])

  const sub = currentDetail?.subscription
  const deliveries = currentDetail?.deliveries || []

  const handleCancelClick = async () => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      await dispatch(cancelAdminSubscription(id))
      dispatch(fetchAdminSubscriptionDetail(id))
    }
  }

  const handleDeleteClick = async () => {
    if (window.confirm('WARNING: This will permanently delete the subscription. Continue?')) {
      await dispatch(deleteAdminSubscription(id))
      navigate('/admin/subscriptions')
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">active</span>
      case 'paused': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider">paused</span>
      case 'cancelled': return <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold uppercase tracking-wider">cancelled</span>
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>
    }
  }

  const getDeliveryStatus = (st) => {
    switch(st) {
      case 'delivered': return <span className="text-green-600 font-bold text-xs uppercase">Delivered</span>
      case 'pending': return <span className="text-gray-500 font-bold text-xs uppercase">Pending</span>
      case 'skipped': return <span className="text-rose-500 font-bold text-xs uppercase">Skipped</span>
      default: return <span className="text-gray-400 font-bold text-xs uppercase">{st}</span>
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-green-600"/>
    </div>
  )

  if (error || !sub) return (
    <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl max-w-lg mx-auto mt-10 text-center">
      <p className="text-rose-700 font-bold">{error || 'Subscription not found'}</p>
      <button onClick={() => navigate('/admin/subscriptions')} className="mt-4 text-sm font-semibold text-rose-600 hover:text-rose-800">
        &larr; Back to Subscriptions
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/subscriptions')} className="text-gray-500 hover:text-gray-900 font-semibold text-sm flex items-center gap-2">
          &larr; Back
        </button>
        <div className="flex gap-2">
           {sub.status !== 'cancelled' && (
             <button onClick={handleCancelClick} className="btn-secondary text-rose-600 border-gray-200 bg-white hover:bg-rose-50 px-4 py-1.5 shadow-sm text-sm">
               Cancel Sub
             </button>
           )}
           <button onClick={handleDeleteClick} className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg px-4 py-1.5 shadow-sm text-sm transition-colors">
             Delete Permanently
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Details Panel */}
         <div className="lg:col-span-5 space-y-6">
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
             <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
               <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{sub.custom_id}</h1>
                  <p className="text-sm font-medium text-gray-500 mt-1">Customer ID: #{sub.user}</p>
               </div>
               {getStatusBadge(sub.status)}
             </div>

             <div className="space-y-4">
               <div>
                 <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Product Details</p>
                 <p className="font-bold text-gray-900">{sub.product?.name || 'Unknown Product'}</p>
                 <p className="text-sm text-gray-500">{sub.quantity} unit(s) • {sub.plan_type} plan</p>
               </div>
               
               <div>
                 <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Schedule Range</p>
                 <p className="text-sm font-medium text-gray-900">{sub.start_date} &rarr; {sub.end_date}</p>
               </div>

               <div className="pt-2">
                 <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Total Expected Amount</p>
                 <p className="text-4xl font-extrabold text-green-700 leading-none">₹{parseFloat(sub.total_amount).toLocaleString('en-IN')}</p>
               </div>
             </div>
           </div>
         </div>

         {/* Deliveries Table */}
         <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
           <div className="p-6 border-b border-gray-100 bg-gray-50/50">
             <h2 className="text-lg font-bold text-gray-900">Delivery Schedule</h2>
             <p className="text-sm text-gray-500">{deliveries.length} total deliveries linked to this subscription</p>
           </div>
           
           <div className="flex-1 overflow-y-auto w-full">
             <table className="min-w-full divide-y divide-gray-100">
               <thead className="bg-white sticky top-0 z-10 shadow-sm">
                 <tr>
                   <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider"># Delivery</th>
                   <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Date</th>
                   <th className="px-6 py-4 text-left text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Quantity</th>
                   <th className="px-6 py-4 text-right text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Status</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-50">
                 {deliveries.map((del, index) => (
                   <tr key={del.id} className="hover:bg-gray-50/50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-bold w-20">
                       {(index + 1).toString().padStart(3, '0')}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                       {del.delivery_date}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       x{del.quantity}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right">
                       {getDeliveryStatus(del.status)}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      </div>
    </div>
  )
}
