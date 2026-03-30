import { createContext } from 'react'
import type { LoginForm, LoginResponse, RegisterForm, RegisterResponse, User } from '@/types'

export interface ToastData {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (data: LoginForm) => Promise<LoginResponse>
  register: (data: RegisterForm) => Promise<RegisterResponse>
  logout: () => void
  updateUser: (updated: User) => void
  isAuthenticated: boolean
  showToast: (data: ToastData) => void
  isMobile: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
