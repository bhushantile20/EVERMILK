import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { clearSession } from '../features/auth/authSlice'

import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
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

          <a href="/#products-section" className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 text-gray-600 hover:bg-gray-50 hover:text-green-700">
            Products
          </a>

          <a href="/#about-section" className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 text-gray-600 hover:bg-gray-50 hover:text-green-700">
            About Us
          </a>

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
                Orders
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

          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-emerald-400 transition-all duration-300 shadow-sm"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/admin/login"
              className="px-3 py-2 rounded-lg bg-slate-900 font-bold text-white text-[11px] uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
              Admin Demo
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
