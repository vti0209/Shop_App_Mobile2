
# 📱 Đây là Đồ án cuối kỳ môn Lập trình Di động 2_PNV & DNC

Kho lưu trữ này chứa mã nguồn cho bài tập thực hành môn **Lập trình Di động 2**. Dự án được phát triển theo từng giai đoạn và tính năng theo yêu cầu của phiếu chấm điểm môn học.
*Được thực hiện bởi Hồ Văn Tiết_24PNV02_Class 24PNV1A_- Môn Lập trình Di động 2.*

---

## 📌 Tổng quan Dự án & Tiêu chí chấm điểm

Dự án này bao gồm hai phân hệ chính: **Phân hệ Người dùng (User)** và **Phân hệ Quản trị viên (Admin)**, với tổng số điểm tối đa là **10 điểm**.

### A. Chức năng của Người dùng (4.0 điểm)
* [ ] **1. Trang chủ người dùng:** Giao diện hiển thị các sản phẩm có sẵn khi khởi tạo database *(0.25đ)*
* [ ] **2. Banner & Menu điều hướng:** Gồm các mục Home, Danh mục sản phẩm *(0.25đ)*
* [ ] **3. Xem sản phẩm theo từng danh mục:** Sử dụng `CategorySelector.tsx` *(0.5đ)*
* [ ] **4. Chi tiết sản phẩm:** Hiển thị khi click vào sản phẩm ở trang chủ *(0.25đ)*
* [ ] **5. Bottom Tab (Người dùng):** Gồm 3 nút: Home, Sign up, Login *(0.25đ)*
* [ ] **6. Đăng ký thành công:** Tính năng đăng ký tài khoản *(0.5đ)*
* [ ] **7. Điều hướng đăng nhập/đăng ký:** Đăng nhập ở Bottom Tab thành công điều hướng đến trang chủ người dùng *(0.5đ)*
* [ ] **8. Hiển thị thông tin người dùng:** Hiển thị thông tin người đã đăng nhập và nút đăng xuất qua `Header.tsx` *(0.5đ)*
* [ ] **9. Tìm kiếm sản phẩm:** Tìm kiếm theo tên/danh mục *(0.5đ)*
* [ ] **10. Lọc sản phẩm:** Lọc sản phẩm theo khoảng giá *(0.5đ)*

### B. Chức năng của Admin (4.0 điểm)
* [ ] **11. Khởi tạo database:** Hỗ trợ sẵn 1 tài khoản admin có sẵn *(0.25đ)*
* [ ] **12. Đăng nhập Admin:** Bao gồm hiển thị thông tin user đã đăng nhập, đăng xuất (`Header.tsx`); đăng nhập thành công điều hướng đến trang chủ quản trị *(0.5đ)*
* [ ] **13. Trang chủ quản trị:** Gồm các nút chức năng: Quản lý user, Quản lý loại sản phẩm, Quản lý sản phẩm *(0.25đ)*
* [ ] **14. Admin Bottom Tab:** Gồm: Home của user, Home của admin, Signup, Login *(0.5đ)*
* [ ] **15. Quản trị User:** Xem, cập nhật vai trò, xóa user *(0.5đ)*
* [ ] **16. Quản trị Loại sản phẩm:** Xem, thêm, sửa, xóa loại sản phẩm, và thêm sản phẩm cho loại tương ứng *(1.0đ)*
* [ ] **17. Quản trị Sản phẩm:** Xem, thêm, sửa, xóa sản phẩm *(1.0đ)*

### C. Chức năng Khác (2.0 điểm)
* [ ] **18. Chức năng khác của người dùng:** 
  * Xem và cập nhật giỏ hàng *(0.5đ)*
  * Checkout đơn hàng và Đặt hàng *(0.5đ)*
  * Xem lịch sử mua hàng *(0.25đ)*
  * Cập nhật thông tin người dùng *(0.25đ)*
* [ ] **19. Chức năng khác của Admin:** 
  * Quản trị đơn hàng (xem danh sách, cập nhật tình trạng đơn hàng) *(0.5đ)*

---

## 🚀 Tiến độ thực hiện (Development Roadmap)

Repo này sẽ được cập nhật liên tục theo từng bước hoàn thiện các tính năng trên:
* **Giai đoạn 1:** Khởi tạo dự án, thiết lập CSDL và các trang giao diện cơ bản (Trang chủ, Header, Bottom Tab).
* **Giai đoạn 2:** Xây dựng hệ thống xác thực (Đăng nhập / Đăng ký) phân quyền Người dùng & Admin.
* **Giai đoạn 3:** Phát triển các tính năng dành cho người dùng (Xem danh mục, chi tiết, tìm kiếm, lọc giá, giỏ hàng & đặt hàng).
* **Giai đoạn 4:** Phát triển các tính năng quản trị của Admin (Quản lý user, danh mục, sản phẩm, và duyệt đơn hàng).

---

## 🛠 Hướng dẫn cài đặt & Chạy dự án

*(Phần này sẽ được cập nhật chi tiết các lệnh cài đặt, cấu hình biến môi trường và chạy ứng dụng khi bạn bắt đầu code)*

```bash
# Clone repository về máy
git clone <url-repo-cua-ban>

# Di chuyển vào thư mục dự án
cd <ten-thu-muc>

# Cài đặt các package/thư viện
npm install

# Chạy ứng dụng
npm start / npx expo start

```

---
## Cảm ơn đã ghé thăm <3

