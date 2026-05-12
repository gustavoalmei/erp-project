import { useState, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { authService, settingsService, userService } from '@/services/api'
import type { Company, LoginForm, LoginResponse, RegisterForm, RegisterResponse, User } from '@/types'
import { applySettingsColors } from '@/utils/applySettings'
import { AuthContext, type ToastData } from './auth-context'

const COMPANIES_KEY = 'pendingCompanies'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(COMPANIES_KEY) ?? '[]')
    } catch {
      return []
    }
  })
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
    const incoming = response.data.companies ?? []
    sessionStorage.setItem(COMPANIES_KEY, JSON.stringify(incoming))
    setCompanies(incoming)
    return response.data
  }

  const switchCompany = async (): Promise<void> => {
    const response = await authService.getMyCompanies()
    const fresh = response.data
    sessionStorage.setItem(COMPANIES_KEY, JSON.stringify(fresh))
    setCompanies(fresh)
    navigate('/select-company')
  }

  const createCompany = async (name: string): Promise<void> => {
    const response = await authService.createCompany(name)
    const newCompany = { id: response.data.id, name: response.data.name, role: response.data.role }
    const updated = [...companies, newCompany]
    sessionStorage.setItem(COMPANIES_KEY, JSON.stringify(updated))
    setCompanies(updated)
  }

  const selectCompany = async (companyId: number): Promise<void> => {
    const response = await authService.selectCompany(companyId)
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    sessionStorage.removeItem(COMPANIES_KEY)
    setCompanies([])
    setUser(response.data.user)
    try {
      const settings = await settingsService.getSettings()
      applySettingsColors(settings)
      window.dispatchEvent(new CustomEvent('settings-updated'))
    } catch {
      // fail silently — usa valores padrão do index.css
    }
  }

  const register = async (data: RegisterForm): Promise<RegisterResponse> => {
    const response = await authService.register(data)
    return response.data
  }

  const logout = async () => {
    await authService.logout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem(COMPANIES_KEY)
    setUser(null)
    setCompanies([])
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
        companies,
        loading,
        login,
        switchCompany,
        createCompany,
        selectCompany,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        showToast,
        isMobile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
