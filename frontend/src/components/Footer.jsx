import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">

          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none mb-0.5">EVER MILK</span>
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest leading-none">Fresh Daily</span>
              </div>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your daily dose of freshness, delivered to your doorstep. Choose from one-time purchases or convenient subscription plans.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">🌿 100% Natural</span>
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">⚡ Daily Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-green-700 transition-colors duration-200 font-medium">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-500 hover:text-green-700 transition-colors duration-200 font-medium">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-500 hover:text-green-700 transition-colors duration-200 font-medium">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/?category=1" className="text-gray-500 hover:text-green-700 transition-colors duration-200 font-medium">
                  Cow Milk
                </Link>
              </li>
              <li>
                <Link to="/?category=2" className="text-gray-500 hover:text-green-700 transition-colors duration-200 font-medium">
                  Buffalo Milk
                </Link>
              </li>
              <li>
                <Link to="/?category=3" className="text-gray-500 hover:text-green-700 transition-colors duration-200 font-medium">
                  Goat Milk
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/dashboard/orders" className="text-gray-500 hover:text-green-700 transition-colors duration-200 font-medium">
                  My Orders
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-green-700 transition-colors duration-200 font-medium">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-green-700 transition-colors duration-200 font-medium">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 font-medium">
            © 2026 Milkman Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-gray-400 hover:text-green-700 transition-colors duration-200">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-green-700 transition-colors duration-200">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
