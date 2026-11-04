//file myDatabase.db nằm ở /data/data/com.libraryappsqlite/databases/myDatabase.db
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

const getDb = async (): Promise<SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'myDatabase.db', location: 'default' });
  return db;
};

export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
};

export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

const initialCategories: Category[] = [
  { id: 1, name: 'Áo' },
  { id: 2, name: 'Giày' },
  { id: 3, name: 'Balo' },
  { id: 4, name: 'Mũ' },
  { id: 5, name: 'Túi' },
];
const initialProducts: Product[] = [
    { id: 1, name: 'Áo sơ mi', price: 250000, img: 'sanpham1.png', categoryId: 1 },
    { id: 2, name: 'Giày sneaker', price: 1100000, img: 'sanpham2.png', categoryId: 2 },
    { id: 3, name: 'Balo thời trang', price: 490000, img: 'sanpham3.png', categoryId: 3 },
    { id: 4, name: 'Mũ lưỡi trai', price: 120000, img: 'sanpham4.png', categoryId: 4 },
    { id: 5, name: 'Túi xách nữ', price: 980000, img: 'sanpham5.png', categoryId: 5 },
    { id: 6, name: 'Áo thun năng động', price: 180000, img: 'sanpham6.png', categoryId: 1 },
    { id: 7, name: 'Giày chạy bộ', price: 850000, img: 'sanpham7.png', categoryId: 2 },
    { id: 8, name: 'Balo laptop', price: 550000, img: 'sanpham8.png', categoryId: 3 },
    { id: 9, name: 'Mũ len ấm áp', price: 150000, img: 'sanpham9.png', categoryId: 4 },
    { id: 10, name: 'Túi đeo chéo', price: 420000, img: 'sanpham10.png', categoryId: 5 },
  ];

//async: Khai báo đây là một hàm bất đồng bộ, cho phép sử dụng await bên trong
// onSuccess?: () => void: Tham số truyền vào là một callback tùy chọn, gọi khi quá trình khởi tạo thành công.
// Promise<void>: Hàm trả về một Promise, không trả giá trị cụ thể (kiểu void), nhằm đảm bảo có thể chờ quá trình khởi tạo hoàn tất.
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
    try {
      const database = await getDb();
 
      database.transaction((tx) => {
        //chỉ để test không dùng 2 câu lệnh này
        // tx.executeSql('DROP TABLE IF EXISTS products');
        // tx.executeSql('DROP TABLE IF EXISTS categories');
 
        tx.executeSql('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT)');
        initialCategories.forEach((category) => {
          tx.executeSql('INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)', [category.id, category.name]);
        });

 
        tx.executeSql(`CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          price REAL,
          img TEXT,
          categoryId INTEGER,
          FOREIGN KEY (categoryId) REFERENCES categories(id)
        )`);
 
        initialProducts.forEach((product) => {
          tx.executeSql('INSERT OR IGNORE INTO products (id, name, price, img, categoryId) VALUES (?, ?, ?, ?, ?)',
            [product.id, product.name, product.price, product.img, product.categoryId]);
        });


         tx.executeSql(
            `CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE,
              password TEXT,
              role TEXT
            )`,
            [],
            () => console.log('✅ Users table created'),
            (_, error) => console.error('❌ Error creating users table:', error)
          );

          tx.executeSql(
            `INSERT INTO users (username, password, role)
            SELECT 'admin', '123456', 'admin'
            WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')`,
            [],
            () => console.log('✅ Admin user added'),
            (_, error) => console.error('❌ Error inserting admin:', error)
          );

      },
      (error) => console.error('❌ Transaction error:', error),
      () => {  // Hàm khi thành công
        console.log('✅ Database initialized');
        if (onSuccess) onSuccess(); // onSuccess là tên biến đại diện cho hàm callback (có thể đặt tên bất kỳ). Nếu biến onSuccess tồn tại (tức là không phải undefined hoặc null), thì hãy gọi hàm đó =>Gọi loadData() ở useEffect() của Sanpham3Sqlite
      });
 
    } catch (error) {
      console.error('❌ initDatabase outer error:', error);
    }
  };
 
  export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM categories');
    const items: Category[] = [];
    const rows = results[0].rows;
    for (let i = 0; i < rows.length; i++) {
      items.push(rows.item(i));
    }
    return items;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const database = await getDb();
    const results = await database.executeSql('SELECT * FROM products');
    const items: Product[] = [];
    const rows = results[0].rows;
    for (let i = 0; i < rows.length; i++) {
      items.push(rows.item(i));
    }
    return items;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const database = await getDb();
    await database.executeSql(
      'INSERT INTO products (name, price, img, categoryId) VALUES (?, ?, ?, ?)',
      [product.name, product.price, product.img, product.categoryId]
    );
    console.log('✅ Product added');
  } catch (error) {
    console.error('❌ Error adding product:', error);
  }
};

export const updateProduct = async (product: Product) => {
    try {
      const database = await getDb();
      await database.executeSql(
        'UPDATE products SET name = ?, price = ?, categoryId = ?, img = ? WHERE id = ?',
        [product.name, product.price, product.categoryId, product.img, product.id]
      );
      console.log('✅ Product updated with image');
    } catch (error) {
      console.error('❌ Error updating product:', error);
    }
  };
 
export const deleteProduct = async (id: number) => {
  try {
    const database = await getDb();
    await database.executeSql('DELETE FROM products WHERE id = ?', [id]);
    console.log('✅ Product deleted');
  } catch (error) {
    console.error('❌ Error deleting product:', error);
  }
};
//---------------lọc sản phẩm theo loại------
export const fetchProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM products WHERE categoryId = ?',
      [categoryId]
    );

    const products: Product[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      products.push(rows.item(i));
    }

    return products;
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    return [];
  }
};

//tìm kiếm sản phẩm theo tên sản phẩm hoặc theo tên loại
export const searchProductsByNameOrCategory = async (keyword: string): Promise<Product[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      `
      SELECT products.* FROM products
      JOIN categories ON products.categoryId = categories.id
      WHERE products.name LIKE ? OR categories.name LIKE ?
      `,
      [`%${keyword}%`, `%${keyword}%`]
    );

    const products: Product[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      products.push(rows.item(i));
    }

    return products;
  } catch (error) {
    console.error('❌ Error searching by name or category:', error);
    return [];
  }
};
//------------------crud user-----------------
// ➕ Thêm người dùng
export const addUser = async (username: string, password: string, role: string): Promise<boolean> => {
  try {
    const db = await getDb();
    await db.executeSql(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    );
    console.log('✅ User added');
    return true; // Thêm thành công
  } catch (error) {
    console.error('❌ Error adding user:', error);
    return false; // Thêm thất bại
  }
};


// 🔄 Cập nhật người dùng
export const updateUser = async (user: User) => {
  try {
    const db = await getDb();
    await db.executeSql(
      'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?',
      [user.username, user.password, user.role, user.id]
    );
    console.log('✅ User updated');
  } catch (error) {
    console.error('❌ Error updating user:', error);
  }
};

// ❌ Xóa người dùng theo id
export const deleteUser = async (id: number) => {
  try {
    const db = await getDb();
    await db.executeSql('DELETE FROM users WHERE id = ?', [id]);
    console.log('✅ User deleted');
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  }
};

// 🔍 Lấy danh sách tất cả người dùng
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql('SELECT * FROM users');
    const users: User[] = [];
    const rows = results.rows;
    for (let i = 0; i < rows.length; i++) {
      users.push(rows.item(i));
    }
    return users;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
};

// 🔑 Lấy người dùng theo username & password (dùng cho đăng nhập)
export const getUserByCredentials = async (username: string, password: string): Promise<User | null> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    const rows = results.rows;
    if (rows.length > 0) {
      return rows.item(0);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user by credentials:', error);
    return null;
  }
};

// 🔍 Lấy người dùng theo id
export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const db = await getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    const rows = results.rows;
    if (rows.length > 0) {
      return rows.item(0);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user by id:', error);
    return null;
  }
};