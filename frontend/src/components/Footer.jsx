import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="header-footer text-on-dark mt-auto">
      <div className="container-app py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-base font-extrabold text-white shadow-inner">
                🥛
              </div>
              <div className="leading-tight">
                <div className="text-base font-extrabold tracking-tight text-white">Milkman</div>
                <div className="text-xs text-green-100">Farm-fresh milk, daily</div>
              </div>
            </Link>
            <p className="text-sm text-green-100 leading-relaxed">
              Your daily dose of freshness, delivered to your doorstep. Choose from one-time purchases or convenient subscription plans.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">🌿 100% Natural</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">⚡ Daily Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/80">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-green-100 hover:text-white transition-colors duration-150">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-green-100 hover:text-white transition-colors duration-150">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-green-100 hover:text-white transition-colors duration-150">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-green-100 hover:text-white transition-colors duration-150">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/80">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/?category=1" className="text-green-100 hover:text-white transition-colors duration-150">
                  Cow Milk
                </Link>
              </li>
              <li>
                <Link to="/?category=2" className="text-green-100 hover:text-white transition-colors duration-150">
                  Buffalo Milk
                </Link>
              </li>
              <li>
                <Link to="/?category=3" className="text-green-100 hover:text-white transition-colors duration-150">
                  Goat Milk
                </Link>
              </li>
              <li>
                <Link to="/" className="text-green-100 hover:text-white transition-colors duration-150">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/80">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard/orders" className="text-green-100 hover:text-white transition-colors duration-150">
                  My Orders
                </Link>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors duration-150">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors duration-150">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-green-100 hover:text-white transition-colors duration-150">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/15">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-green-100">
              © 2024 Milkman. All rights reserved. Made with 🌿 for fresh milk lovers.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-green-100 hover:text-white transition-colors duration-150">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-green-100 hover:text-white transition-colors duration-150">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="text-green-100 hover:text-white transition-colors duration-150">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
