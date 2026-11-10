// src/database/projectDb.ts
// CSDL SQLite dành riêng cho Đồ án Cuối kỳ Lập trình Di động 2
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { User, Category, Product, Order, CartItem, OrderNotification } from './types';

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
  { id: 1, name: 'Chăm sóc da', description: 'Sản phẩm dưỡng da và làm đẹp' },
  { id: 2, name: 'Sữa dinh dưỡng', description: 'Sữa công thức cho trẻ nhỏ' },
  { id: 3, name: 'Thực phẩm và gia vị', description: 'Gia vị, nước chấm và thực phẩm' },
  { id: 4, name: 'Chăm sóc cá nhân', description: 'Sản phẩm vệ sinh và chăm sóc cá nhân' },
  { id: 5, name: 'Thực phẩm bổ sung', description: 'Sản phẩm bổ sung dinh dưỡng' },
];

// Dữ liệu mẫu khởi tạo sản phẩm (Dùng ảnh có sẵn trong thư mục assets/images)
const defaultProducts = [
  {
    id: 1,
    name: 'Kem dưỡng da Yuja Niacin',
    price: 249000,
    img: 'sanpham1.png',
    categoryId: 1,
    description: 'Kem dưỡng ẩm Yuja Niacin với chiết xuất cam yuzu.',
  },
  {
    id: 2,
    name: 'Sữa bột Enfamil Enspire 350g',
    price: 690000,
    img: 'sanpham2.png',
    categoryId: 2,
    description: 'Sữa công thức Enfamil Enspire dành cho trẻ nhỏ.',
  },
  {
    id: 3,
    name: 'Sữa TH true FORMULA 800g',
    price: 420000,
    img: 'sanpham3.png',
    categoryId: 2,
    description: 'Sữa công thức TH true FORMULA dành cho trẻ từ 0 đến 6 tháng.',
  },
  {
    id: 4,
    name: 'Sữa Meiji Infant Formula 800g',
    price: 650000,
    img: 'sanpham4.png',
    categoryId: 2,
    description: 'Sữa công thức Meiji Premium dành cho trẻ từ 0 đến 1 tuổi.',
  },
  {
    id: 5,
    name: 'Gia vị Aji-Quick Bún Riêu Cua',
    price: 9000,
    img: 'sanpham5.png',
    categoryId: 3,
    description: 'Gia vị nêm sẵn Aji-Quick vị bún riêu cua.',
  },
  {
    id: 6,
    name: 'Dầu hào Ajinomoto',
    price: 28000,
    img: 'sanpham6.png',
    categoryId: 3,
    description: 'Dầu hào Ajinomoto dùng nêm nếm và chế biến món ăn.',
  },
  {
    id: 7,
    name: 'Thực phẩm bổ sung KingsUp',
    price: 450000,
    img: 'sanpham7.png',
    categoryId: 5,
    description: 'Sản phẩm bổ sung dinh dưỡng KingsUp.',
  },
  {
    id: 8,
    name: 'Xà phòng Lifebuoy Vitamin+ 90g',
    price: 12000,
    img: 'sanpham8.png',
    categoryId: 4,
    description: 'Xà phòng Lifebuoy Vitamin+ giúp làm sạch và bảo vệ da.',
  },
  {
    id: 9,
    name: 'Bánh xếp kiểu Nhật Aji Gyoza',
    price: 89000,
    img: 'sanpham9.png',
    categoryId: 3,
    description: 'Bánh xếp kiểu Nhật nhân thịt heo và gà.',
  },
  {
    id: 10,
    name: 'Bộ gia vị Chinsu',
    price: 95000,
    img: 'sanpham10.png',
    categoryId: 3,
    description: 'Bộ sản phẩm gia vị và nước chấm Chinsu.',
  },
];

const legacyCategoryNames: Record<number, string> = {
  1: 'Áo thời trang',
  2: 'Giày sneaker',
  3: 'Balo du lịch',
  4: 'Phụ kiện mũ nón',
  5: 'Túi xách cao cấp',
};

const legacyProductNames: Record<number, string> = {
  1: 'Áo Polo Thể Thao Nam',
  2: 'Giày Sneaker Phố Trắng',
  3: 'Balo Laptop Chống Nước',
  4: 'Mũ Lưỡi Trai Classic',
  5: 'Túi Đeo Chéo Canvas',
  6: 'Áo Sơ Mi Oxford Dài Tay',
  7: 'Giày Chạy Bộ Running Pro',
};

/**
 * Khởi tạo cơ sở dữ liệu dự án lớn:
 * - Tạo bảng users, categories, products, orders, order_items
 * - Đảm bảo có sẵn tài khoản Admin (admin / 123456) theo Chức năng 11
 */
export const initProjectDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    const db = await getProjectDb();

    await db.transaction((tx) => {
      // 1. BẢNG danh mục (categories)
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
          deliveryLocation TEXT,
          deliveryStreetAddress TEXT,
          avatar TEXT,
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
          notes TEXT,
          paymentMethod TEXT NOT NULL DEFAULT 'COD',
          shippingMethod TEXT NOT NULL DEFAULT 'Standard Shipping',
          discountAmount REAL NOT NULL DEFAULT 0,
          totalAmount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `);

      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS order_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          orderId INTEGER NOT NULL,
          message TEXT NOT NULL,
          isRead INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (orderId) REFERENCES orders(id)
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
        tx.executeSql(
          'UPDATE categories SET name = ?, description = ? WHERE id = ? AND name = ?',
          [cat.name, cat.description, cat.id, legacyCategoryNames[cat.id]]
        );
      });

      // Thêm ảnh mẫu còn thiếu và cập nhật các sản phẩm mẫu thời trang cũ.
      defaultProducts.forEach((prod) => {
        tx.executeSql(
          'INSERT OR IGNORE INTO products (id, name, price, img, categoryId, description) VALUES (?, ?, ?, ?, ?, ?)',
          [prod.id, prod.name, prod.price, prod.img, prod.categoryId, prod.description]
        );
        if (legacyProductNames[prod.id]) {
          tx.executeSql(
            `UPDATE products
             SET name = ?, price = ?, img = ?, categoryId = ?, description = ?
             WHERE id = ? AND name = ?`,
            [
              prod.name,
              prod.price,
              prod.img,
              prod.categoryId,
              prod.description,
              prod.id,
              legacyProductNames[prod.id],
            ]
          );
        }
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

    const [userColumns] = await db.executeSql('PRAGMA table_info(users)');
    const existingUserColumns = Array.from({ length: userColumns.rows.length }, (_, index) =>
      userColumns.rows.item(index).name
    );
    for (const [column, definition] of [
      ['avatar', 'TEXT'],
      ['deliveryLocation', 'TEXT'],
      ['deliveryStreetAddress', 'TEXT'],
      ['email', 'TEXT'],
      ['deliveryFullName', 'TEXT'],
      ['deliveryPhone', 'TEXT'],
      ['deliveryProvince', 'TEXT'],
      ['deliveryDistrict', 'TEXT'],
      ['deliveryWard', 'TEXT'],
    ]) {
      if (!existingUserColumns.includes(column)) {
        await db.executeSql(`ALTER TABLE users ADD COLUMN ${column} ${definition}`);
      }
    }

    // Đảm bảo tài khoản mẫu khachhang1 có sẵn thông tin giao hàng mặc định để kiểm tra
    await db.executeSql(`
      UPDATE users
      SET email = COALESCE(NULLIF(email, ''), 'vantiet@example.com'),
          deliveryFullName = COALESCE(NULLIF(deliveryFullName, ''), fullName, 'Hồ Văn Tiết'),
          deliveryPhone = COALESCE(NULLIF(deliveryPhone, ''), phone, '0373532152'),
          deliveryProvince = COALESCE(NULLIF(deliveryProvince, ''), 'Thành phố Hà Nội'),
          deliveryDistrict = COALESCE(NULLIF(deliveryDistrict, ''), 'Quận Cầu Giấy'),
          deliveryWard = COALESCE(NULLIF(deliveryWard, ''), 'Phường Dịch Vọng'),
          deliveryStreetAddress = COALESCE(NULLIF(deliveryStreetAddress, ''), 'Số 123 Đường Cầu Giấy')
      WHERE username = 'khachhang1'
    `);

    const [orderColumns] = await db.executeSql('PRAGMA table_info(orders)');
    const existingOrderColumns = Array.from({ length: orderColumns.rows.length }, (_, index) =>
      orderColumns.rows.item(index).name
    );
    for (const [column, definition] of [
      ['notes', 'TEXT'],
      ['paymentMethod', "TEXT NOT NULL DEFAULT 'COD'"],
      ['shippingMethod', "TEXT NOT NULL DEFAULT 'Standard Shipping'"],
      ['discountAmount', 'REAL NOT NULL DEFAULT 0'],
    ]) {
      if (!existingOrderColumns.includes(column)) {
        await db.executeSql(`ALTER TABLE orders ADD COLUMN ${column} ${definition}`);
      }
    }

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
    const [userRes] = await db.executeSql(
      "SELECT COUNT(*) as count FROM users WHERE username <> 'admin'"
    );
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
      'INSERT INTO users (username, password, fullName, phone, avatar, role) VALUES (?, ?, ?, ?, ?, ?)',
      [
        user.username,
        user.password || '123456',
        user.fullName || '',
        user.phone || '',
        user.avatar || null,
        user.role || 'user',
      ]
    );
    return true;
  } catch (error) {
    console.error('❌ Lỗi thêm người dùng:', error);
    return false;
  }
};

export const updateUser = async (
  id: number,
  user: Pick<User, 'username' | 'fullName'> &
    Partial<Pick<User, 'phone' | 'avatar'>> & { password?: string }
): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql(
      `UPDATE users
       SET username = ?, fullName = ?, phone = COALESCE(?, phone),
           avatar = COALESCE(?, avatar), password = COALESCE(?, password)
       WHERE id = ?`,
      [user.username, user.fullName || '', user.phone ?? null, user.avatar ?? null, user.password || null, id]
    );
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật người dùng:', error);
    return false;
  }
};

export const updateUserProfile = async (
  id: number,
  user: Pick<User, 'username' | 'fullName' | 'phone' | 'avatar'> &
    Partial<Pick<User, 'deliveryLocation' | 'deliveryStreetAddress'>>
): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await db.executeSql(
      `UPDATE users
       SET username = ?, fullName = ?, phone = ?, avatar = ?,
           deliveryLocation = ?, deliveryStreetAddress = ?
       WHERE id = ?`,
      [
        user.username,
        user.fullName || '',
        user.phone || '',
        user.avatar || null,
        user.deliveryLocation || '',
        user.deliveryStreetAddress || '',
        id,
      ]
    );
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật hồ sơ người dùng:', error);
    return false;
  }
};

/**
 * Cập nhật thông tin tài khoản cá nhân (Account Information)
 * Chỉ cập nhật Username, Email, Avatar, Password mà không đụng đến thông tin giao hàng
 */
export const updateAccountInfo = async (
  id: number,
  data: {
    username?: string;
    email?: string;
    avatar?: string;
    fullName?: string;
    phone?: string;
    newPassword?: string;
  }
): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    if (data.newPassword && data.newPassword.trim().length > 0) {
      await db.executeSql(
        `UPDATE users
         SET username = COALESCE(?, username),
             email = COALESCE(?, email),
             avatar = COALESCE(?, avatar),
             fullName = COALESCE(?, fullName),
             phone = COALESCE(?, phone),
             password = ?
         WHERE id = ?`,
        [
          data.username?.trim() || null,
          data.email?.trim() || null,
          data.avatar || null,
          data.fullName?.trim() || null,
          data.phone?.trim() || null,
          data.newPassword.trim(),
          id,
        ]
      );
    } else {
      await db.executeSql(
        `UPDATE users
         SET username = COALESCE(?, username),
             email = COALESCE(?, email),
             avatar = COALESCE(?, avatar),
             fullName = COALESCE(?, fullName),
             phone = COALESCE(?, phone)
         WHERE id = ?`,
        [
          data.username?.trim() || null,
          data.email?.trim() || null,
          data.avatar || null,
          data.fullName?.trim() || null,
          data.phone?.trim() || null,
          id,
        ]
      );
    }
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật thông tin tài khoản:', error);
    return false;
  }
};

/**
 * Cập nhật thông tin giao hàng mặc định (Default Delivery Information)
 * Chỉ cập nhật preset giao hàng dùng cho Checkout, HOÀN TOÀN KHÔNG sửa đổi thông tin tài khoản
 */
export const updateDefaultDeliveryInfo = async (
  id: number,
  data: {
    deliveryFullName: string;
    deliveryPhone: string;
    deliveryProvince: string;
    deliveryDistrict: string;
    deliveryWard: string;
    deliveryStreetAddress: string;
  }
): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    const compositeLocation = [
      data.deliveryProvince,
      data.deliveryDistrict,
      data.deliveryWard,
    ]
      .filter(Boolean)
      .join(', ');

    await db.executeSql(
      `UPDATE users
       SET deliveryFullName = ?,
           deliveryPhone = ?,
           deliveryProvince = ?,
           deliveryDistrict = ?,
           deliveryWard = ?,
           deliveryStreetAddress = ?,
           deliveryLocation = ?
       WHERE id = ?`,
      [
        data.deliveryFullName.trim(),
        data.deliveryPhone.trim(),
        data.deliveryProvince.trim(),
        data.deliveryDistrict.trim(),
        data.deliveryWard.trim(),
        data.deliveryStreetAddress.trim(),
        compositeLocation,
        id,
      ]
    );
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật thông tin giao hàng mặc định:', error);
    return false;
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const db = await getProjectDb();
    const [results] = await db.executeSql('SELECT * FROM users WHERE username = ?', [username]);
    return results.rows.length > 0 ? results.rows.item(0) : null;
  } catch (error) {
    console.error('❌ Lỗi tải hồ sơ người dùng:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const db = await getProjectDb();
    const [results] = await db.executeSql('SELECT * FROM users WHERE id = ?', [id]);
    return results.rows.length > 0 ? results.rows.item(0) : null;
  } catch (error) {
    console.error('❌ Lỗi tải hồ sơ người dùng:', error);
    throw error;
  }
};

export const getUserByCredentials = async (
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const db = await getProjectDb();
    const [results] = await db.executeSql(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    return results.rows.length > 0 ? results.rows.item(0) : null;
  } catch (error) {
    console.error('❌ Lỗi xác thực người dùng:', error);
    throw error;
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

// ====================== THAO TÁC Danh mục (CATEGORIES) ======================
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

export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  try {
    const db = await getProjectDb();
    const [results] = await db.executeSql(
      `SELECT products.*, categories.name as categoryName
       FROM products
       LEFT JOIN categories ON products.categoryId = categories.id
       WHERE products.categoryId = ?
       ORDER BY products.id DESC`,
      [categoryId]
    );
    const list: Product[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      list.push(results.rows.item(i));
    }
    return list;
  } catch (error) {
    console.error('❌ Lỗi tải sản phẩm theo loại:', error);
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

export const createOrder = async (
  userId: number,
  details: Pick<Order, 'customerName' | 'customerPhone' | 'customerAddress' | 'totalAmount'> &
    Partial<Pick<Order, 'notes' | 'paymentMethod' | 'shippingMethod' | 'discountAmount'>>,
  items: CartItem[]
): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT INTO orders
              (userId, customerName, customerPhone, customerAddress, notes, paymentMethod,
               shippingMethod, discountAmount, totalAmount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [
              userId,
              details.customerName,
              details.customerPhone,
              details.customerAddress,
              details.notes || '',
              details.paymentMethod || 'COD',
              details.shippingMethod || 'Standard Shipping',
              details.discountAmount || 0,
              details.totalAmount,
            ],
            (transaction, result) => {
              const orderId = result.insertId;
              if (!orderId) {
                reject(new Error('Không tạo được mã đơn hàng.'));
                return;
              }
              transaction.executeSql(
                `INSERT INTO order_notifications (userId, orderId, message)
                 VALUES (?, ?, ?)`,
                [userId, orderId, `Đơn hàng #${orderId} đã được ghi nhận và đang chờ xác nhận.`]
              );

              items.forEach(({ product, quantity }) => {
                transaction.executeSql(
                  `INSERT INTO order_items
                    (orderId, productId, productName, price, quantity, img)
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [orderId, product.id, product.name, product.price, quantity, product.img]
                );
              });
            }
          );
        },
        reject,
        () => resolve()
      );
    });
    return true;
  } catch (error) {
    console.error('❌ Lỗi tạo đơn hàng:', error);
    return false;
  }
};

export const fetchOrdersByUser = async (userId: number): Promise<Order[]> => {
  try {
    const db = await getProjectDb();
    const [results] = await db.executeSql(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    const orders: Order[] = [];
    for (let index = 0; index < results.rows.length; index += 1) {
      const order = results.rows.item(index) as Order;
      const [itemsResult] = await db.executeSql(
        'SELECT * FROM order_items WHERE orderId = ? ORDER BY id ASC',
        [order.id]
      );
      const items = [];
      for (let itemIndex = 0; itemIndex < itemsResult.rows.length; itemIndex += 1) {
        items.push(itemsResult.rows.item(itemIndex));
      }
      orders.push({ ...order, items });
    }
    return orders;
  } catch (error) {
    console.error('❌ Lỗi tải lịch sử đơn hàng:', error);
    throw error;
  }
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  try {
    const db = await getProjectDb();
    const [results] = await db.executeSql(`
      SELECT orders.*, users.username AS customerUsername
      FROM orders
      LEFT JOIN users ON users.id = orders.userId
      ORDER BY orders.createdAt DESC, orders.id DESC
    `);
    const orders: Order[] = [];
    for (let index = 0; index < results.rows.length; index += 1) {
      const order = results.rows.item(index) as Order;
      const [itemsResult] = await db.executeSql(
        'SELECT * FROM order_items WHERE orderId = ? ORDER BY id ASC',
        [order.id]
      );
      const items = [];
      for (let itemIndex = 0; itemIndex < itemsResult.rows.length; itemIndex += 1) {
        items.push(itemsResult.rows.item(itemIndex));
      }
      orders.push({ ...order, items });
    }
    return orders;
  } catch (error) {
    console.error('❌ Lỗi tải danh sách đơn hàng:', error);
    throw error;
  }
};

/**
 * Bảng quy tắc chuyển đổi trạng thái đơn hàng một chiều (Strict One-Way Workflow)
 * 5 trạng thái: PENDING ('CHỜ XÁC NHẬN'), CONFIRMED ('ĐÃ XÁC NHẬN'), SHIPPING ('ĐANG GIAO'), COMPLETED ('ĐÃ GIAO'), CANCELLED ('ĐÃ HỦY')
 */
export const VALID_STATUS_TRANSITIONS: Record<Order['status'], Order['status'][]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], // Đã giao: Trạng thái cuối, đóng băng
  CANCELLED: [], // Đã hủy: Đóng băng hoàn toàn (Rule 2)
};

export const canTransitionOrderStatus = (
  currentStatus: Order['status'],
  nextStatus: Order['status']
): boolean => {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
};

export const updateOrderStatus = async (
  orderId: number,
  status: Order['status']
): Promise<boolean> => {
  try {
    const db = await getProjectDb();
    await new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT userId, status FROM orders WHERE id = ?',
            [orderId],
            (transaction, result) => {
              if (!result.rows.length) {
                reject(new Error(`Không tìm thấy đơn hàng #${orderId}.`));
                return;
              }
              const order = result.rows.item(0) as { userId: number; status: Order['status'] };
              if (order.status === status) {
                resolve();
                return;
              }

              // Quy tắc 2: Đơn hàng một khi đã là 'ĐÃ HỦY' thì đóng băng trạng thái, Admin không thể sửa nữa
              if (order.status === 'CANCELLED') {
                reject(
                  new Error(`Đơn hàng #${orderId} đang ở trạng thái 'ĐÃ HỦY' và đã bị đóng băng. Không thể thay đổi trạng thái nữa.`)
                );
                return;
              }

              // Đơn hàng đã ở trạng thái 'ĐÃ GIAO' (Hoàn tất) thì đóng băng
              if (order.status === 'COMPLETED') {
                reject(
                  new Error(`Đơn hàng #${orderId} đang ở trạng thái 'ĐÃ GIAO' (Hoàn tất). Không thể thay đổi trạng thái nữa.`)
                );
                return;
              }

              // Quy tắc 1: Ngăn chặn đi lùi quy trình (One-way State Workflow)
              if (!canTransitionOrderStatus(order.status, status)) {
                reject(
                  new Error(
                    `Quy trình một chiều: Không thể chuyển trạng thái từ '${order.status}' sang '${status}'. Các trạng thái trước đó đã bị chặn.`
                  )
                );
                return;
              }

              transaction.executeSql(
                'UPDATE orders SET status = ? WHERE id = ?',
                [status, orderId]
              );
              transaction.executeSql(
                `INSERT INTO order_notifications (userId, orderId, message)
                 VALUES (?, ?, ?)`,
                [order.userId, orderId, orderStatusNotification(orderId, status)]
              );
              resolve();
            }
          );
        },
        reject,
        () => resolve()
      );
    });
    return true;
  } catch (error) {
    console.error('❌ Lỗi cập nhật trạng thái đơn hàng:', error);
    return false;
  }
};

const orderStatusNotification = (orderId: number, status: Order['status']): string => {
  const messages: Record<Order['status'], string> = {
    PENDING: 'đang chờ xác nhận',
    CONFIRMED: 'đã được xác nhận',
    SHIPPING: 'đang trên đường giao đến bạn',
    COMPLETED: 'đã giao thành công',
    CANCELLED: 'đã được hủy',
  };
  return `Đơn hàng #${orderId} ${messages[status]}.`;
};

export const fetchOrderNotifications = async (userId: number): Promise<OrderNotification[]> => {
  const db = await getProjectDb();
  const [results] = await db.executeSql(
    'SELECT * FROM order_notifications WHERE userId = ? ORDER BY createdAt DESC, id DESC',
    [userId]
  );
  return Array.from({ length: results.rows.length }, (_, index) =>
    results.rows.item(index) as OrderNotification
  );
};

export const fetchUnreadNotificationCount = async (userId: number): Promise<number> => {
  const db = await getProjectDb();
  const [results] = await db.executeSql(
    'SELECT COUNT(*) AS count FROM order_notifications WHERE userId = ? AND isRead = 0',
    [userId]
  );
  return results.rows.item(0)?.count || 0;
};

export const markOrderNotificationsRead = async (userId: number): Promise<void> => {
  const db = await getProjectDb();
  await db.executeSql(
    'UPDATE order_notifications SET isRead = 1 WHERE userId = ? AND isRead = 0',
    [userId]
  );
};
