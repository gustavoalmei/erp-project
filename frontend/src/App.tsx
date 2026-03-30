import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/auth/Login'
import { RegisterPage } from './pages/auth/Register'
import { Dashboard } from './pages/dashboard'
import { Products } from './pages/products'
import { Categories } from './pages/categories'
import { ProfilePage } from './pages/auth/Profile'
import { PrivateRoute } from './components/PrivateRoute'
import { PublicRoute } from './components/PublicRoute'
import { Layout } from './components/layout'
import { Users } from './pages/users'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'USER']}>
            <Layout element={<Dashboard />} />
          </PrivateRoute>
        }
      />
      <Route
        path="/products"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'USER']}>
            <Layout element={<Products />} />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'USER']}>
            <Layout element={<Categories />} />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'USER']}>
            <Layout element={<ProfilePage />} />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <Layout element={<Users />} />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
