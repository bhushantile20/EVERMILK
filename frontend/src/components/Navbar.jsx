import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { clearSession } from '../features/auth/authSlice'

export default function Navbar() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const serverTotal = useAppSelector((s) => s.cart.serverCart?.total_items)
  const guestTotal = useAppSelector((s) => s.cart.guestItems?.reduce((a, i) => a + (i.quantity || 0), 0))

  const cartCount = user ? (serverTotal || 0) : (guestTotal || 0)

  const onLogout = () => {
    dispatch(clearSession())
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive
      ? 'bg-green-50 text-green-700 shadow-sm'
      : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
    }`

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none mb-0.5">EVER MILK</span>
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest leading-none">Fresh Daily</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>

          <NavLink to="/cart" className={linkClass}>
            <span className="flex items-center gap-2">
              Cart
              {cartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-700 text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </span>
          </NavLink>

          {user ? (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              <NavLink to="/dashboard/orders" className={linkClass}>
                Dashboard
              </NavLink>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-rose-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <NavLink to="/login" className="text-sm font-semibold text-gray-600 hover:text-green-700 transition-colors">
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="btn-primary py-2 px-5 text-sm"
              >
                Sign up
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
