import axios from "axios";
import type {
  LoginForm,
  RegisterForm,
  LoginResponse,
  RegisterResponse,
  Category,
  Product,
  ProductForm,
  Customer,
  CustomerForm,
  Sale,
  SaleForm,
} from "../types";

const API_URL = "http://localhost:3000/api";

// Criar instância do axios
export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      const currentPath = window.location.pathname;

      // Só redirecionar se não estiver em rota de auth
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ========== AUTH ==========
export const authService = {
  register: async (data: RegisterForm) => {
    return await api.post<RegisterResponse>("/auth/register", data);
  },

  login: async (data: LoginForm) => {
    return await api.post<LoginResponse>("/auth/login", data);
  },
};

// ========== USERS ==========
export const userService = {
  getProfile: async () => {
    const response = await api.get<{ id: number; name: string; email: string; role: string }>("/users/me");
    return response.data;
  },

  updateProfile: async (name: string, email: string) => {
    const response = await api.put<{ id: number; name: string; email: string; role: string }>("/users/me", { name, email });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.patch("/users/me/password", { currentPassword, newPassword });
    return response.data;
  },
};

// ========== CATEGORIES ==========
export const categoryService = {
  getAll: async () => {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (name: string) => {
    const response = await api.post<Category>("/categories", { name });
    return response.data;
  },

  update: async (id: number, name: string) => {
    const response = await api.put<Category>(`/categories/${id}`, { name });
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/categories/${id}`);
  },
};

// ========== PRODUCTS ==========
export const productService = {
  getAll: async () => {
    const response = await api.get<Product[]>("/products");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: ProductForm) => {
    const response = await api.post<Product>("/products", data);
    return response.data;
  },

  update: async (id: number, data: ProductForm) => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/products/${id}`);
  },

  getLowStock: async (threshold: number = 10) => {
    const response = await api.get<{
      count: number;
      products: Array<{
        id: number;
        name: string;
        stock: number;
        sku: string;
      }>;
    }>(`/products/low-stock?threshold=${threshold}`);
    return response.data;
  },
};

// ========== CUSTOMERS ==========
export const customerService = {
  getAll: async () => {
    const response = await api.get<Customer[]>("/customers");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CustomerForm) => {
    const response = await api.post<Customer>("/customers", data);
    return response.data;
  },

  update: async (id: number, data: CustomerForm) => {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/customers/${id}`);
  },
};

// ========== SALES ==========
export const saleService = {
  getAll: async () => {
    const response = await api.get<Sale[]>("/sales");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  create: async (data: SaleForm) => {
    const response = await api.post<Sale>("/sales", data);
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await api.patch<Sale>(`/sales/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: number) => {
    const response = await api.delete<Sale>(`/sales/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<{
      totalRevenue: number;
      totalSales: number;
      averageTicket: number;
    }>("/sales/stats");
    return response;
  },

  getMonthlyRevenue: async (year?: number) => {
    const params = year ? `?year=${year}` : "";
    const response = await api.get<
      Array<{
        month: string;
        revenue: number;
      }>
    >(`/sales/monthly-revenue${params}`);
    return response.data;
  },

  getTodaySales: async () => {
    const response = await api.get<{
      totalRevenue: number;
      totalSales: number;
    }>("/sales/today");
    return response.data;
  },

  getPendingSales: async () => {
    const response = await api.get<{
      totalPending: number;
      count: number;
    }>("/sales/pending");
    return response.data;
  },
};
