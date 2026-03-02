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
    `rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${isActive
      ? 'bg-white/25 text-white shadow-md backdrop-blur-md'
      : 'text-green-50 hover:bg-white/15 hover:text-white'
    }`

  return (
    <header className="header-footer sticky top-0 z-50 shadow-lg">
      <div className="container-app flex items-center justify-between py-3.5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-base font-extrabold text-white backdrop-blur-md transition-all duration-200 group-hover:bg-white/30 group-hover:scale-105 shadow-inner">
            🥛
          </div>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight text-white">Milkman</div>
            <div className="text-xs text-green-100">Farm-fresh milk, daily</div>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1.5">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>

          <NavLink to="/cart" className={linkClass}>
            <span className="flex items-center gap-2">
              Cart
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-green-700 shadow">
                {cartCount}
              </span>
            </span>
          </NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard/orders" className={linkClass}>
                Orders
              </NavLink>
              <button
                type="button"
                onClick={onLogout}
                className="ml-1 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 transition-all duration-200 hover:bg-white/25 hover:shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="ml-1 rounded-xl bg-white px-4 py-2 text-sm font-bold text-green-700 shadow-md transition-all duration-200 hover:bg-green-50 hover:shadow-lg hover:scale-[1.02]"
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
