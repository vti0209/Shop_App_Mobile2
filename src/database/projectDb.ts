// src/database/projectDb.ts
// CSDL SQLite dành riêng cho Đồ án Cuối kỳ Lập trình Di động 2
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { User, Category, Product, Order } from './types';

SQLite.enablePromise(true);

let dbInstance: SQLiteDatabase | null = null;

export const getProjectDb = async (): Promise<SQLiteDatabase> => {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabase({
    name: 'app_project.db',
    location: 'default',
  });
  return dbInstance;
};

// Dữ liệu mẫu khởi tạo danh mục
const defaultCategories = [
  { id: 1, name: 'Áo thời trang', description: 'Áo thun, sơ mi, áo khoác hiện đại' },
  { id: 2, name: 'Giày sneaker', description: 'Giày thể thao, giày lười, cao cổ' },
  { id: 3, name: 'Balo du lịch', description: 'Balo đi học, đi làm, chống nước' },
  { id: 4, name: 'Phụ kiện mũ nón', description: 'Mũ lưỡi trai, bucket thời trang' },
  { id: 5, name: 'Túi xách cao cấp', description: 'Túi đeo chéo, ví da công sở' },
];

// Dữ liệu mẫu khởi tạo sản phẩm (Dùng ảnh có sẵn trong thư mục assets/images)
const defaultProducts = [
  {
    id: 1,
    name: 'Áo Polo Thể Thao Nam',
    price: 280000,
    img: 'sanpham1.png',
    categoryId: 1,
    description: 'Chất liệu thun gai cá sấu cao cấp, thoáng mát co giãn 4 chiều.',
  },
  {
    id: 2,
    name: 'Giày Sneaker Phố Trắng',
    price: 850000,
    img: 'sanpham2.png',
    categoryId: 2,
    description: 'Phong cách năng động trẻ trung, đế cao su êm ái chống trơn trượt.',
  },
  {
    id: 3,
    name: 'Balo Laptop Chống Nước',
    price: 450000,
    img: 'sanpham3.png',
    categoryId: 3,
    description: 'Có ngăn đệm chống sốc cho laptop 15.6 inch, cổng sạc USB tiện dụng.',
  },
  {
    id: 4,
    name: 'Mũ Lưỡi Trai Classic',
    price: 150000,
    img: 'sanpham4.png',
    categoryId: 4,
    description: 'Vải kaki 100% cotton dày dặn, form nón chuẩn phong cách unisex.',
  },
  {
    id: 5,
    name: 'Túi Đeo Chéo Canvas',
    price: 320000,
    img: 'sanpham5.png',
    categoryId: 5,
    description: 'Thiết kế nhiều ngăn đa năng, khóa kéo kim loại bền bỉ.',
  },
  {
    id: 6,
    name: 'Áo Sơ Mi Oxford Dài Tay',
    price: 390000,
    img: 'sanpham6.png',
    categoryId: 1,
    description: 'Vải cotton oxford ít nhăn, phù hợp công sở và dạo phố.',
  },
  {
    id: 7,
    name: 'Giày Chạy Bộ Running Pro',
    price: 1200000,
    img: 'sanpham7.png',
    categoryId: 2,
    description: 'Đế đệm bọt khí êm chân, trợ lực tốt khi vận động thể thao.',
  },
];

/**
 * Khởi tạo cơ sở dữ liệu dự án lớn:
 * - Tạo bảng users, categories, products, orders, order_items
 * - Đảm bảo có sẵn tài khoản Admin (admin / 123456) theo Chức năng 11
 */
export const initProjectDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const db = await getProjectDb();

    await db.transaction((tx) => {
      // 1. BẢNG LOẠI SẢN PHẨM (categories)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT
        )
      `);

      // 2. BẢNG SẢN PHẨM (products)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          img TEXT NOT NULL,
          categoryId INTEGER,
          description TEXT,
          FOREIGN KEY (categoryId) REFERENCES categories(id)
        )
      `);

      // 3. BẢNG NGƯỜI DÙNG (users)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          fullName TEXT,
          phone TEXT,
          role TEXT NOT NULL DEFAULT 'user',
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 4. BẢNG ĐƠN HÀNG (orders) - Sẵn sàng cho Chức năng 18 & 19
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          customerName TEXT NOT NULL,
          customerPhone TEXT NOT NULL,
          customerAddress TEXT NOT NULL,
          totalAmount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `);

      // 5. BẢNG CHI TIẾT ĐƠN HÀNG (order_items)
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER,
          productId INTEGER,
          productName TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          img TEXT,
          FOREIGN KEY (orderId) REFERENCES orders(id)
        )
      `);

      // Chèn danh mục mặc định nếu chưa có
      defaultCategories.forEach((cat) => {
        tx.executeSql(
          'INSERT OR IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)',
          [cat.id, cat.name, cat.description]
        );
      });

      // Chèn sản phẩm mặc định nếu chưa có
      defaultProducts.forEach((prod) => {
        tx.executeSql(
          'INSERT OR IGNORE INTO products (id, name, price, img, categoryId, description) VALUES (?, ?, ?, ?, ?, ?)',
          [prod.id, prod.name, prod.price, prod.img, prod.categoryId, prod.description]
        );
      });

      // Chèn tài khoản Admin mặc định (Chức năng 11: admin / 123456)
      tx.executeSql(`
        INSERT INTO users (username, password, fullName, phone, role)
        SELECT 'admin', '123456', 'Quản Trị Viên', '0373143781', 'admin'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
      `);

      // Chèn tài khoản Khách hàng mẫu
      tx.executeSql(`
        INSERT INTO users (username, password, fullName, phone, role)
        SELECT 'khachhang1', '123456', 'Ho Van Tiet', '0373532152', 'user'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'khachhang1')
      `);
    });

    console.log('✅ [ProjectDb] Khởi tạo CSDL dự án lớn thành công!');
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('❌ [ProjectDb] Lỗi khởi tạo database:', error);
  }
};

// ====================== THỐNG KÊ DASHBOARD (CHO TRANG CHỦ ADMIN) ======================
export const getDashboardStats = async (): Promise<{
  totalUsers: number;
  totalCategories: number;
  totalProducts: number;
}> => {
  try {
    const db = await getProjectDb();
    const [userRes] = await db.executeSql('SELECT COUNT(*) as count FROM users');
    const [catRes] = await db.executeSql('SELECT COUNT(*) as count FROM categories');
    const [prodRes] = await db.executeSql('SELECT COUNT(*) as count FROM products');

    return {
      totalUsers: userRes.rows.item(0)?.count || 0,
      totalCategories: catRes.rows.item(0)?.count || 0,
      totalProducts: prodRes.rows.item(0)?.count || 0,
    };
  } catch (error) {
    console.error('❌ Lỗi lấy thống kê dashboard:', error);
    return { totalUsers: 0, totalCategories: 0, totalProducts: 0 };
  }
};

// ====================== THAO TÁC NGƯỜI DÙNG (USERS) ======================
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const db = await getProjectDb();
    const [results] = await db.executeSql('SELECT * FROM users ORDER BY id DESC');
    const list: User[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      list.push(results.rows.item(i));
    }
    return list;
  } catch (error) {
    console.error('❌ Lỗi tải danh sách người dùng:', error);
    return [];
  }
};

export const addUser = async (user: Omit<User, 'id'>): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql(
      'INSERT INTO users (username, password, fullName, phone, role) VALUES (?, ?, ?, ?, ?)',
      [user.username, user.password || '123456', user.fullName || '', user.phone || '', user.role || 'user']
    );
    return true;
  } catch (error) {
    console.error('❌ Lỗi thêm người dùng:', error);
    return false;
  }
};

export const updateUserRole = async (id: number, newRole: 'admin' | 'user'): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql('UPDATE users SET role = ? WHERE id = ?', [newRole, id]);
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật vai trò người dùng:', error);
    return false;
  }
};

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql('DELETE FROM users WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('❌ Lỗi xóa người dùng:', error);
    return false;
  }
};

// ====================== THAO TÁC LOẠI SẢN PHẨM (CATEGORIES) ======================
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const db = await getProjectDb();
    const [results] = await db.executeSql('SELECT * FROM categories ORDER BY id ASC');
    const list: Category[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      list.push(results.rows.item(i));
    }
    return list;
  } catch (error) {
    console.error('❌ Lỗi tải danh mục:', error);
    return [];
  }
};

export const addCategory = async (name: string, description: string = ''): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    return true;
  } catch (error) {
    console.error('❌ Lỗi thêm danh mục:', error);
    return false;
  }
};

export const updateCategory = async (category: Category): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql('UPDATE categories SET name = ?, description = ? WHERE id = ?', [
      category.name,
      category.description || '',
      category.id,
    ]);
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật danh mục:', error);
    return false;
  }
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('❌ Lỗi xóa danh mục:', error);
    return false;
  }
};

// ====================== THAO TÁC SẢN PHẨM (PRODUCTS) ======================
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const db = await getProjectDb();
    const [results] = await db.executeSql(`
      SELECT products.*, categories.name as categoryName
      FROM products
      LEFT JOIN categories ON products.categoryId = categories.id
      ORDER BY products.id DESC
    `);
    const list: Product[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      list.push(results.rows.item(i));
    }
    return list;
  } catch (error) {
    console.error('❌ Lỗi tải sản phẩm:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql(
      'INSERT INTO products (name, price, img, categoryId, description) VALUES (?, ?, ?, ?, ?)',
      [product.name, product.price, product.img, product.categoryId, product.description || '']
    );
    return true;
  } catch (error) {
    console.error('❌ Lỗi thêm sản phẩm:', error);
    return false;
  }
};

export const updateProduct = async (product: Product): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql(
      'UPDATE products SET name = ?, price = ?, img = ?, categoryId = ?, description = ? WHERE id = ?',
      [product.name, product.price, product.img, product.categoryId, product.description || '', product.id]
    );
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật sản phẩm:', error);
    return false;
  }
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql('DELETE FROM products WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('❌ Lỗi xóa sản phẩm:', error);
    return false;
  }
};
