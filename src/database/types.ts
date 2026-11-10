// src/database/types.ts
// Định nghĩa kiểu dữ liệu cho toàn bộ Dự án Cuối kỳ

export interface User {
  id: number;
  username: string;
  password?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt?: string;

  // Cấu hình giao hàng mặc định (Default Delivery Information)
  deliveryFullName?: string;
  deliveryPhone?: string;
  deliveryProvince?: string;
  deliveryDistrict?: string;
  deliveryWard?: string;
  deliveryStreetAddress?: string;

  // Trường cũ để tương thích ngược
  deliveryLocation?: string;
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
  customerUsername?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  discountAmount?: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderNotification {
  id: number;
  userId: number;
  orderId: number;
  message: string;
  isRead: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
