// src/database/types.ts
// Định nghĩa kiểu dữ liệu cho toàn bộ Dự án Cuối kỳ

export interface User {
  id: number;
  username: string;
  password?: string;
  fullName?: string;
  phone?: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
  description?: string;
  categoryName?: string; // Dùng khi join bảng
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  img: string;
}

export interface Order {
  id: number;
  userId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  items?: OrderItem[];
}
