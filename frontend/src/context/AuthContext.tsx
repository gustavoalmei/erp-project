import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginForm, RegisterForm, LoginResponse, RegisterResponse } from '../types';
import { authService } from '../services/api.ts';
import { Bounce, ToastContainer, toast } from 'react-toastify';

interface ToastData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginForm) => Promise<LoginResponse>;
  register: (data: RegisterForm) => Promise<RegisterResponse>;
  logout: () => void;
  updateUser: (updated: User) => void;
  isAuthenticated: boolean;
  showToast: (data: ToastData) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (data: LoginForm): Promise<LoginResponse> => {
    const response = await authService.login(data);

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    setUser(response.data.user);
    return response.data;
  };

  const register = async (data: RegisterForm): Promise<RegisterResponse> => {
    const response = await authService.register(data)
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const showToast = (data: ToastData): void => {
    toast(data.message, { type: data.type });
  };

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
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}