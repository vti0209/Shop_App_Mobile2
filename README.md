Dưới đây là các bước em làm theo thứ tự, từ `App.tsx` đến `ParentControl.tsx` và cuối cùng là `LightControl.tsx`

# Bước 1: Làm file `App.tsx`

Mục đích: Hiển thị component cha `ParentControl`.

1. Import `React`, `View` và `ParentControl`.
2. Tạo component `App`.
3. Dùng `View` để chứa `<ParentControl />`.
4. Export `App` để ứng dụng hiển thị.

Ở bước này, chưa xử lý trạng thái đèn hay độ sáng vì những việc đó thuộc component cha.

# Bước 2: Làm file `ParentControl.tsx`

Mục đích: Quản lý trạng thái đèn và độ sáng, sau đó truyền dữ liệu xuống component con.

Bước 2.1: Import thư viện

- `useState`: quản lý trạng thái đèn và độ sáng.
- `View`, `Text`, `StyleSheet`, `SafeAreaView`: xây dựng giao diện.
- `LightControl`: gọi component con.

Bước 2.2: Khai báo tháng sinh

```
const Thang_sinh = 9;
```

Biến này quy định mỗi lần nhấn tăng hoặc giảm, độ sáng thay đổi 9%.

Bước 2.3: Khởi tạo state

```
const [isOn, setIsOn] = useState(true);
const [brightness, setBrightness] = useState(50);
```

- `isOn`: quản lý đèn đang bật hay tắt.
- `brightness`: quản lý độ sáng, ban đầu là 50%.

Bước 2.4: Viết các hàm xử lý

- `handleToggle`: đảo trạng thái bật/tắt bằng `setIsOn`.
- `handleIncrease`: nếu đèn bật, tăng độ sáng thêm 9%; dùng `Math.min(100, ...)` để không vượt quá 100%.
- `handleDecrease`: nếu đèn bật, giảm độ sáng 9%; dùng `Math.max(0, ...)` để không thấp hơn 0%.

Cả hai hàm tăng và giảm đều kiểm tra `if (!isOn) return;` để không điều chỉnh khi đèn tắt.

Bước 2.5: Xây dựng giao diện component cha

Hiển thị:

- Tiêu đề hệ thống.
- Họ tên sinh viên và ngày sinh.
- Khu vực `===== COMPONENT CHA =====`.
- Trạng thái đèn, đổi chữ xanh khi bật và đỏ khi tắt.
- Độ sáng hiện tại.

Bước 2.6: Truyền dữ liệu xuống component con

Dùng `<LightControl />` và truyền 5 props:

- `isOn`: trạng thái đèn.
- `brightness`: độ sáng.
- `onToggle`: hàm bật/tắt.
- `onIncrease`: hàm tăng độ sáng.
- `onDecrease`: hàm giảm độ sáng.

Cuối cùng, viết `StyleSheet.create()` để định dạng giao diện và `export default ParentControl`.

# Bước 3: Làm file `LightControl.tsx`

Mục đích: Hiển thị dữ liệu nhận được và cung cấp các nút điều khiển cho người dùng.

Bước 3.1: Import thư viện

Import `React`, `View`, `Text`, `StyleSheet` và `TouchableOpacity`.

Bước 3.2: Khai báo kiểu `Props`

Khai báo 5 thuộc tính giống với dữ liệu component cha truyền xuống, gồm 2 dữ liệu (`isOn`, `brightness`) và 3 callback (`onToggle`, `onIncrease`, `onDecrease`).

Bước 3.3: Nhận props

Trong hàm `LightControl`, lấy 5 thuộc tính từ `Props` để sử dụng trực tiếp, không cần tạo `useState` mới.

Bước 3.4: Hiển thị dữ liệu

Tạo khu vực `===== COMPONENT CON =====`, hiển thị:

- Trạng thái nhận được, chữ xanh khi bật và đỏ khi tắt.
- Độ sáng nhận được.
- Hình bóng đèn minh họa bằng `View`: vàng khi bật, xám khi tắt.

Bước 3.5: Tạo 3 nút chức năng

- Nút bật/tắt gọi `onToggle`.
- Nút tăng độ sáng gọi `onIncrease`.
- Nút giảm độ sáng gọi `onDecrease`.

Dùng `disabled={!isOn || brightness === 100}` cho nút tăng và `disabled={!isOn || brightness === 0}` cho nút giảm.

Khi đèn tắt, hiển thị thêm thông báo không thể điều chỉnh độ sáng.

Bước 3.6: Hoàn thiện giao diện

Dùng `StyleSheet.create()` để định dạng khu vực component con, bóng đèn và các nút; cuối file thêm `export default LightControl`.

# Bước 4: Chạy và kiểm tra

Kiểm tra bật/tắt đèn, tăng/giảm 9%, giới hạn độ sáng từ 0 đến 100 và việc không thể điều chỉnh độ sáng khi đèn tắt.

Tóm lại: `App.tsx` dùng để hiển thị cha → `ParentControl.tsx` quản lý state và truyền props → `LightControl.tsx` hiển thị dữ liệu, gọi callback để cha cập nhật state.