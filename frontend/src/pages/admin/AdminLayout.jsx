import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isActive
      ? 'bg-green-600 text-white shadow-md'
      : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
    }`

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div>
              <div className="text-base font-extrabold text-green-900 tracking-tight">Admin Portal</div>
              <div className="text-[10px] font-bold text-green-700 uppercase tracking-widest">EVER MILK Management</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <NavLink to="/admin/analytics" className={linkClass}>Analytics</NavLink>
            <NavLink to="/admin/products" className={linkClass}>Products</NavLink>
            <NavLink to="/admin/categories" className={linkClass}>Categories</NavLink>
            <NavLink to="/admin/orders" className={linkClass}>Orders</NavLink>
            <NavLink to="/admin/payments" className={linkClass}>Payments</NavLink>
            <NavLink to="/admin/customers" className={linkClass}>Customers</NavLink>
            <NavLink to="/admin/subscriptions" className={linkClass}>Subscriptions</NavLink>
          </nav>
        </div>

        {/* Mobile Navigation Scroll */}
        <div className="md:hidden border-t border-gray-50 bg-white px-4 py-2 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-2 min-w-max">
            <NavLink to="/admin/analytics" className={linkClass}>Analytics</NavLink>
            <NavLink to="/admin/products" className={linkClass}>Products</NavLink>
            <NavLink to="/admin/categories" className={linkClass}>Categories</NavLink>
            <NavLink to="/admin/orders" className={linkClass}>Orders</NavLink>
            <NavLink to="/admin/payments" className={linkClass}>Payments</NavLink>
            <NavLink to="/admin/customers" className={linkClass}>Customers</NavLink>
            <NavLink to="/admin/subscriptions" className={linkClass}>Subscriptions</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
