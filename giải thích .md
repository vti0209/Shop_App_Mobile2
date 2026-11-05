# Giải thích các chức năng và thay đổi trong ứng dụng

Tài liệu này ghi lại các màn hình, luồng xử lý, file được cập nhật và file được tạo mới cho ứng dụng bán hàng React Native. Database sử dụng SQLite thông qua `react-native-sqlite-storage`.

## 1. Luồng đăng nhập và điều hướng

### Các file điều hướng và xác thực

- `src/components/AppNavigatorProduct.tsx`
  - Khai báo kiểu tham số cho các màn hình trong `RootStackParamList`.
  - Kết nối màn hình đăng nhập, đăng ký, trang người dùng, trang quản trị, chi tiết sản phẩm, sản phẩm theo danh mục và lịch sử mua hàng.
  - Bọc navigator trong `CartProvider` để giỏ hàng được dùng chung giữa trang danh sách sản phẩm, chi tiết sản phẩm và tab giỏ hàng.
  - Hiển thị tên tài khoản ở header khi đăng nhập Admin; nút đăng xuất đưa người dùng ra khỏi khu vực đã đăng nhập.

- `src/components/LoginScreen.tsx`
  - Xác thực tên đăng nhập và mật khẩu qua SQLite.
  - Điều hướng theo quyền: Admin tới `AdminHome`, user tới `CustomerTabs`.
  - Truyền `userId` và tên tài khoản sang khu vực tương ứng để tải hồ sơ, giỏ hàng/đơn hàng và hiển thị thông tin tài khoản.

- `src/components/RegisterScreen.tsx` (màn hình đăng ký hiện có)
  - Màn hình đăng ký tài khoản user; kiểm tra dữ liệu bắt buộc, độ dài tên đăng nhập/mật khẩu và mật khẩu xác nhận.
  - Lưu tài khoản bằng hàm `addUser` trong `src/database/projectDb.ts`.

## 2. Khu vực người dùng

### Các file màn hình người dùng

- `src/components/users/CustomerTabNavigator.tsx`
  - Tạo các tab **Sản phẩm**, **Danh mục**, **Giỏ hàng** và **Tài khoản**.
  - Tab giỏ hàng hiển thị số lượng sản phẩm hiện có.
  - Tab tài khoản tải hồ sơ từ database; cho phép sửa tên đăng nhập, họ tên, số điện thoại và ảnh đại diện.
  - Ảnh đại diện mặc định dùng tên `logo.png`. Hàm ánh xạ ảnh xử lý tên này tới asset `src/assets/images/Logo.png`.
  - Cho phép chọn ảnh đại diện từ thư viện ảnh trên thiết bị; lưu đường dẫn ảnh vào hồ sơ.
  - Cung cấp nút xem lịch sử mua hàng và đăng xuất.

- `src/components/users/CustomerHomeScreen.tsx`
  - Tải sản phẩm và danh mục từ database; hỗ trợ tìm kiếm theo tên sản phẩm/danh mục và lọc theo danh mục.
  - Hiển thị sản phẩm thành lưới **3 card mỗi dòng**.
  - Phân trang, mỗi trang tối đa **6 sản phẩm**, có nút chuyển trang trước/sau và trạng thái trang hiện tại.
  - Khi thay đổi danh mục hoặc từ khóa tìm kiếm, quay về trang đầu để tránh trang hiện tại vượt quá số trang mới.
  - Mỗi card có nút thêm sản phẩm vào giỏ hàng.

- `src/components/users/ProductByCategoryScreen.tsx`
  - Hiển thị sản phẩm của danh mục được chọn và cho phép chuyển sang danh mục khác.
  - Cũng dùng lưới **3 card mỗi dòng**, tối đa **6 sản phẩm mỗi trang**.
  - Chuyển danh mục sẽ trở về trang đầu; mỗi card có nút thêm vào giỏ.

- `src/components/users/ProductDetailScreen.tsx`
  - Hiển thị ảnh, tên, giá và danh mục liên quan của sản phẩm.
  - Có nút **Thêm vào giỏ hàng**; thao tác này cập nhật giỏ dùng chung trong `CartContext`.

### File tạo mới

- `src/components/users/CartContext.tsx`
  - Quản lý trạng thái giỏ hàng trong phiên ứng dụng bằng React Context.
  - Cung cấp các thao tác thêm sản phẩm, tăng/giảm số lượng, xóa sản phẩm và làm trống giỏ hàng.
  - Nếu thêm sản phẩm đã có, số lượng của sản phẩm đó tăng lên.
  - Giỏ hiện lưu trong bộ nhớ của phiên chạy ứng dụng; chưa lưu giỏ đang mua vào SQLite để khôi phục sau khi đóng ứng dụng.

- `src/components/users/CartScreen.tsx`
  - Hiển thị các mặt hàng trong giỏ; cho phép chỉnh số lượng hoặc xóa mặt hàng.
  - Tính tổng tiền theo giá và số lượng.
  - Thu thập họ tên, số điện thoại và địa chỉ nhận hàng; tự điền tên/số điện thoại nếu hồ sơ đã có dữ liệu.
  - Yêu cầu đăng nhập và thông tin giao hàng hợp lệ trước khi đặt hàng.
  - Khi đặt hàng thành công, lưu đơn hàng/chi tiết đơn hàng vào SQLite, làm trống giỏ và cung cấp nút mở lịch sử mua hàng.

- `src/components/users/OrderHistoryScreen.tsx`
  - Tải lịch sử đơn hàng theo `userId`.
  - Hiển thị mã đơn, trạng thái, thời gian đặt, các sản phẩm/số lượng, địa chỉ giao hàng và tổng tiền.

## 3. Khu vực Admin

### Các file màn hình Admin

- `src/components/admin/AdminTabNavigator.tsx`
  - Giữ nguyên các tab quản trị có sẵn: **Tổng quan**, **User**, **Danh mục** và **Sản phẩm**.
  - Bổ sung tab **Hàng** để Admin xem các đơn user đã đặt.

- `src/components/admin/AdminUserScreen.tsx`
  - Hiển thị danh sách user cùng họ tên và thông tin vai trò hiện tại.
  - Hỗ trợ sửa tên đăng nhập, họ tên, số điện thoại, ảnh đại diện và mật khẩu; mật khẩu để trống khi sửa thì được giữ nguyên.
  - Hỗ trợ thêm user mới (luôn được tạo với quyền `user`) và xóa user.
  - Không có nút/luồng cấp hoặc bỏ quyền Admin trong màn này. Ứng dụng chỉ sử dụng tài khoản Admin gốc được khởi tạo trong database; tài khoản này không xuất hiện trong danh sách quản lý user và không thể bị xóa từ màn hình.

- `src/components/admin/AdminHomeScreen.tsx` (dashboard hiện có)
  - Dashboard hiển thị thống kê số user, danh mục và sản phẩm.
  - Có nút mở các màn quản lý tương ứng.

- `src/components/admin/AdminOrdersScreen.tsx` (màn hình mới)
  - Liệt kê tất cả đơn hàng từ mọi user, bao gồm tên tài khoản, sản phẩm/số lượng, thông tin người nhận, địa chỉ, thời gian và tổng tiền.
  - Cho phép Admin cập nhật trạng thái đơn (chờ xác nhận, đã xác nhận, đang giao, hoàn tất hoặc đã hủy).
  - Tải lại danh sách khi mở tab và hỗ trợ kéo xuống để làm mới.

- `src/components/admin/AdminCategoryScreen.tsx` (màn hình hiện có) quản lý danh mục: xem, thêm, sửa và xóa; có biểu mẫu để gắn sản phẩm với danh mục.
- `src/components/admin/AdminProductScreen.tsx` (màn hình hiện có) quản lý sản phẩm: xem, thêm, sửa, xóa và chọn ảnh sản phẩm.

## 4. Database và kiểu dữ liệu

### File được cập nhật

- `src/database/types.ts`
  - Bổ sung trường `avatar` trong kiểu `User`.
  - Khai báo kiểu `CartItem` dùng chung cho dữ liệu giỏ hàng.
  - Duy trì kiểu dữ liệu cho sản phẩm, đơn hàng và chi tiết đơn hàng.

- `src/database/projectDb.ts`
  - Khởi tạo các bảng user, danh mục, sản phẩm, đơn hàng và chi tiết đơn hàng; tạo tài khoản Admin mặc định `admin` nếu tài khoản này chưa tồn tại. Tài khoản mới do Admin thêm được gán quyền `user`.
  - Bổ sung cột `avatar` cho bảng user. Khi ứng dụng chạy trên database cũ, kiểm tra schema và thêm cột nếu còn thiếu.
  - Cung cấp các thao tác đọc/cập nhật hồ sơ user và thêm/cập nhật/xóa user.
  - Tạo đơn hàng và các dòng chi tiết trong cùng transaction; tải lịch sử đơn hàng cùng chi tiết theo user.
  - Cung cấp truy vấn danh sách toàn bộ đơn hàng kèm user/chi tiết đơn và cập nhật trạng thái cho màn quản lý Admin.
  - Giữ các thao tác danh mục và sản phẩm phục vụ màn hình quản trị/cửa hàng.

## 5. Hình ảnh

- `src/utils/imageHelper.ts` (helper hiện có) ánh xạ tên ảnh trong database sang ảnh có sẵn tại `src/assets/images`; xử lý cả ảnh cục bộ và URI từ thư viện ảnh.
- Asset logo hiện có là `src/assets/images/Logo.png` (chữ L viết hoa). Tên mặc định `logo.png` được chuẩn hóa để ánh xạ tới file này.
- `src/assets/images/avatar.jpg` là file có sẵn trong workspace; ảnh mặc định của tài khoản hiện vẫn là logo.

## 6. Kiểm tra

- `npx tsc --noEmit`: đạt sau các thay đổi.
- ESLint cho các file TypeScript liên quan: đạt.
- `git diff --check`: đạt.
- Jest hiện không chạy được do cấu hình test không chuyển đổi module ESM của `@react-navigation/native`; lỗi xảy ra khi nạp `App.tsx`, trước khi chạy test.
