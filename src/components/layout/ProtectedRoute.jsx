import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

export default function ProtectedRoute({ children, requireAuth, requireAuthor, requireRole }) {
  const { isAuthenticated, user } = useAuthStore()

  if (requireAuth && !isAuthenticated) return <Navigate to="/login" replace />
  if (requireAuthor && !user?.hasAuthorProfile) return <Navigate to="/profile" replace />
  const roles = requireRole ? (Array.isArray(requireRole) ? requireRole : [requireRole]) : null
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />

  return children
}
