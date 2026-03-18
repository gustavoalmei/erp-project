// User & Auth
export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

// Category
export interface Category {
  id: number;
  name: string;
}

// Product
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  categoryId: number;
  category: Category;
  createdAt: string;
}

export interface ProductForm {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  categoryId: number;
}

// Customer
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  address?: string;
}

export interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  document: string;
  address?: string;
}

// Sale
export interface SaleItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
}

export interface Sale {
  id: number;
  customerId: number;
  userId: number;
  total: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  customer: Customer;
  user: User;
  items: SaleItem[];
}

export interface CreateSaleItem {
  productId: number;
  quantity: number;
}

export interface SaleForm {
  customerId: number;
  items: CreateSaleItem[];
}
