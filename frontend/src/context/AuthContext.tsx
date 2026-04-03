import { useState, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { Bounce, ToastContainer, toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { authService, userService } from '@/services/api'
import type { LoginForm, LoginResponse, RegisterForm, RegisterResponse, User } from '@/types'
import { AuthContext, type ToastData } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(
    () => !!(localStorage.getItem('user') && localStorage.getItem('token')),
  )
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      authService
        .verify()
        .then(() => userService.getProfile())
        .then((freshUser) => {
          localStorage.setItem('user', JSON.stringify(freshUser))
          setUser(freshUser as User)
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        })
        .finally(() => setLoading(false))
    }
  }, [])

  const login = async (data: LoginForm): Promise<LoginResponse> => {
    const response = await authService.login(data)
    localStorage.setItem('token', response.data.token)
    const freshUser = await userService.getProfile()
    localStorage.setItem('user', JSON.stringify(freshUser))
    setUser(freshUser as User)
    return response.data
  }

  const register = async (data: RegisterForm): Promise<RegisterResponse> => {
    const response = await authService.register(data)
    return response.data
  }

  const logout = async () => {
    await authService.logout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const updateUser = (updated: User) => {
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  const showToast = (data: ToastData): void => {
    toast(data.message, { type: data.type })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        showToast,
        isMobile,
      }}
    >
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
        theme="dark"
        transition={Bounce}
      />
      {children}
    </AuthContext.Provider>
  )
}
