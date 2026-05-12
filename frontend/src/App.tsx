import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Bounce, ToastContainer } from 'react-toastify'
import { useAuth } from './hooks/useAuth'
import { settingsService } from './services/api'
import { applySettingsColors } from './utils/applySettings'
import { LoginPage } from './pages/auth/Login'
import { RegisterPage } from './pages/auth/Register'
import { SelectCompanyPage } from './pages/auth/SelectCompany'
import { Dashboard } from './pages/dashboard'
import { Products } from './pages/products'
import { Categories } from './pages/categories'
import { ProfilePage } from './pages/auth/Profile'
import { PrivateRoute } from './components/PrivateRoute'
import { PublicRoute } from './components/PublicRoute'
import { Layout } from './components/layout'
import { Users } from './pages/users'
import { Customers } from './pages/customers'
import { NotFound } from './pages/NotFound'
import { Sell } from './pages/sell'
import { Settings } from './pages/settings'

function App() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return
    settingsService
      .getSettings()
      .then((settings) => {
        applySettingsColors(settings)
      })
      .catch(() => {}) // falha silenciosa — usa valores padrão do index.css
  }, [isAuthenticated])

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme={'dark'}
        transition={Bounce}
      />
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
        <Route path="/select-company" element={<SelectCompanyPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER']}>
              <Layout element={<Dashboard />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']}>
              <Layout element={<Products />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']}>
              <Layout element={<Categories />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER']}>
              <Layout element={<ProfilePage />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER']}>
              <Layout element={<Customers />} />
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

        <Route
          path="/sell"
          element={
            <PrivateRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']}>
              <Layout element={<Sell />} />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <Layout element={<Settings />} />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
