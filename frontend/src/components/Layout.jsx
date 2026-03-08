import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-white bg-opacity-50">
      <Navbar />
      <main className="flex-grow w-full pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
