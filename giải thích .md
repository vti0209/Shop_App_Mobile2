# Tóm tắt phần đã thực hiện

## Đăng ký và đăng nhập

- Ứng dụng mở đầu tại màn hình đăng nhập; chưa đăng nhập thì chưa vào được trang sản phẩm hoặc trang quản trị.
- Tạo mới màn hình đăng nhập tại `src/components/LoginScreen.tsx`.
  - Nhập tên đăng nhập và mật khẩu.
  - Xác thực tài khoản trong cùng database SQLite mà trang quản trị và cửa hàng dùng.
  - Điều hướng theo quyền: tài khoản `user` vào trang chủ cửa hàng; tài khoản `admin` vào Admin Dashboard.
  - Có liên kết chuyển sang màn hình đăng ký.
- Tạo mới màn hình đăng ký tại `src/components/RegisterScreen.tsx`.
  - Nhập tên đăng nhập, mật khẩu và xác nhận mật khẩu.
  - Kiểm tra tên đăng nhập tối thiểu 3 ký tự, mật khẩu tối thiểu 6 ký tự và hai mật khẩu phải khớp.
  - Tạo tài khoản với quyền `user` trong database dùng chung; khi thành công, quay về đăng nhập và điền sẵn tên tài khoản.
- Thêm điều hướng đăng nhập, đăng ký, khu vực khách hàng, Admin Dashboard và đăng xuất tại `src/components/AppNavigatorProduct.tsx`. Đăng xuất xóa lịch sử màn hình đã đăng nhập.
- Sau đăng nhập, khách hàng có thanh điều hướng dưới gồm các tab **Sản phẩm**, **Danh mục** và **Tài khoản** (`src/components/CustomerTabNavigator.tsx`). Danh mục mở danh sách sản phẩm tương ứng; Tài khoản có nút đăng xuất.

## Các chức năng sản phẩm

- Tạo `src/components/CustomerHomeScreen.tsx` làm trang sản phẩm dành cho khách hàng, không hiển thị các thao tác quản trị sản phẩm.
- Trang chủ hiển thị sản phẩm dạng lưới hai cột co giãn, với card thống nhất kích thước ảnh, tên và giá; chọn ảnh hoặc sản phẩm để mở trang chi tiết.
- Thêm tìm kiếm theo tên sản phẩm/danh mục và nút **Lọc** để hiện bộ chọn danh mục.
- Trang chi tiết và trang sản phẩm theo loại dùng chung dữ liệu với database dự án.
- Đồng bộ tên mẫu theo ảnh trong `src/assets/images`: kem dưỡng Yuja Niacin, các loại sữa Enfamil/TH/Meiji, gia vị Aji-Quick, dầu hào Ajinomoto, KingsUp, xà phòng Lifebuoy, bánh xếp Aji Gyoza và bộ gia vị Chinsu.
- Cập nhật dữ liệu mẫu cho cả database dự án và database SQLite cũ; dữ liệu mẫu cũ được đổi sang tên/loại mới khi khớp tên seed cũ, không ghi đè các sản phẩm người dùng đã tự đổi tên.
- Giữ lại màn hình quản lý sản phẩm cũ và các màn hình Admin hiện có. Sửa Admin Dashboard để nút quản lý mở đúng các màn hình con.
- Chỉnh bố cục các trang đăng nhập/đăng ký, danh sách sản phẩm và quản trị để nội dung co giãn trên màn hình hẹp; danh mục tiếp tục cuộn ngang.
- Đồng bộ placeholder trong các biểu mẫu và cải thiện khoảng cách nút.
- Đã gỡ khai báo TypeScript `src/types/react-native-vector-icons.d.ts` và cấu hình nhúng font khỏi `android/app/build.gradle`.

## Kiểm tra

- `npx tsc --noEmit`: đạt sau các thay đổi màn khách hàng và emoji.
- ESLint các tệp liên quan: đạt, không có lỗi hoặc cảnh báo.
- Problems trên các tệp đã chỉnh: không có lỗi.
