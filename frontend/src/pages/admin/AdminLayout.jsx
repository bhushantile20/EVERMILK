import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
      ? 'bg-white/25 text-white shadow-md backdrop-blur-md'
      : 'text-green-50 hover:bg-white/15 hover:text-white'
    }`

  return (
    <div className="content-wrapper min-h-screen flex flex-col">
      <header className="header-footer shadow-lg">
        <div className="container-app flex items-center justify-between py-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-base font-extrabold text-white backdrop-blur-md shadow-inner">
              ⚙️
            </div>
            <div>
              <div className="text-base font-extrabold text-white">Admin Panel</div>
              <div className="text-xs text-green-100">Milkman management</div>
            </div>
          </div>
          <nav className="flex items-center gap-1.5">
            <NavLink to="/admin/products" className={linkClass}>Products</NavLink>
            <NavLink to="/admin/categories" className={linkClass}>Categories</NavLink>
            <NavLink to="/admin/orders" className={linkClass}>Orders</NavLink>
            <NavLink to="/admin/payments" className={linkClass}>Payments</NavLink>
            <NavLink to="/admin/customers" className={linkClass}>Customers</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-grow container-app py-8">
        <Outlet />
      </main>
    </div>
  )
}
