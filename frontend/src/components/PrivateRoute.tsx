import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface PrivateRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { user, companies, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="bg-color-bg-secondary dark:bg-color-bg-primary flex items-center justify-center min-h-screen text-color-text-primary dark:text-color-text-secondary">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Token existe mas empresa ainda não foi selecionada
    if (localStorage.getItem('token') && companies.length > 0) {
      return <Navigate to="/select-company" replace />
    }
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
