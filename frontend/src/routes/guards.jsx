import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

export function RequireAuth() {
  const user = useAppSelector((s) => s.auth.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function RequireAdmin() {
  const user = useAppSelector((s) => s.auth.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  const role = (user?.role || '').toLowerCase()
  const isAdminRole = role === 'admin' || role === 'staff'

  // DRF check - sometimes superusers might not have the 'role' explicitly set to 'admin' 
  // depending on how createsuperuser operates, but they are is_staff or is_superuser
  const isDjangoAdmin = user?.is_staff || user?.is_superuser

  // Allow either explicit admin role, or Django staff/superuser privileges
  const isAdmin = isAdminRole || isDjangoAdmin

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
