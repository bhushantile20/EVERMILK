import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Home, ShoppingCart, User, Calendar, Wallet, Sun, Moon } from 'lucide-react'

export default function MobileNav() {
  const { isDark, toggleTheme } = useTheme()
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 ${
      isActive ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'
    }`

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] h-16 px-2 flex items-center justify-around translate-y-0 backdrop-blur-lg bg-white/90 dark:bg-slate-900/90">
      <NavLink to="/" className={linkClass} end>
        <Home size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Home</span>
      </NavLink>
      
      <NavLink to="/dashboard/orders" className={linkClass}>
        <Calendar size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Orders</span>
      </NavLink>

      <button onClick={toggleTheme} className={linkClass({ isActive: false })}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
        <span className="text-[10px] font-bold uppercase tracking-tight">{isDark ? 'Light' : 'Dark'}</span>
      </button>

      <NavLink to="/cart" className={linkClass}>
        <div className="relative">
          <ShoppingCart size={20} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-tight">Cart</span>
      </NavLink>

      <NavLink to="/login" className={linkClass}>
        <User size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Profile</span>
      </NavLink>
    </nav>
  )
}
