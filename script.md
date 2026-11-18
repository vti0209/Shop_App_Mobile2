# Kịch bản MC demo ứng dụng Tạp hóa xanh
# MC Demo Script for the xanh Grocery App

> **Thứ tự demo / Demo sequence:** Khách chưa đăng nhập → Khách hàng đăng nhập → Admin.  
> Guest browsing → Signed-in customer → Admin.
>
> Mỗi câu tiếng Việt được theo ngay bên dưới bởi câu tiếng Anh tương ứng.  
> Each Vietnamese sentence is immediately followed by its English translation.

## Chuẩn bị trước khi trình bày / Before the presentation

- **VI:** Mở ứng dụng và kiểm tra dữ liệu sản phẩm đã tải.
- **EN:** Open the app and make sure the product data has loaded.
- **VI:** Tài khoản khách demo: `khachhang1` / `123456`.
- **EN:** Demo customer account: `khachhang1` / `123456`.
- **VI:** Tài khoản Admin demo: `admin` / `123456`.
- **EN:** Demo Admin account: `admin` / `123456`.
- **VI:** Tài khoản khách mẫu đã có thông tin giao hàng để demo checkout nhanh.
- **EN:** The sample customer account already has delivery details for a quick checkout demo.
- **VI:** Nên đặt một đơn hàng mới trong lúc demo để dễ tìm đơn đó ở màn hình Admin.
- **EN:** Place a new order during the demo so it is easy to find on the Admin screen.
- **VI:** Ứng dụng khởi tạo dữ liệu mẫu trong SQLite trên thiết bị nên dữ liệu có thể khác nếu đã được chỉnh sửa trước đó.
- **EN:** The app initializes sample data in SQLite on the device, so it may look different if the data was changed earlier.

---

# PHẦN 1 — LUỒNG KHÁCH CHƯA ĐĂNG NHẬP
# PART 1 — GUEST BROWSING WITHOUT SIGNING IN

## Bước 1 / Step 1 — Mở ứng dụng / Open the app

**Thao tác:** Chạm mở ứng dụng, chờ trang chủ tải xong và chưa đăng nhập.  
**Action:** Tap the app icon, wait for the home screen to load, and do not sign in.

**MC nói / MC says:**

**VI:** “Đầu tiên, khi mở ứng dụng, chúng ta sẽ vào thẳng giao diện cửa hàng mà không cần đăng nhập trước.”  
**EN:** “First, when we open the app, we go straight to the store without needing to sign in.”

**VI:** “Nhờ vậy, khách vẫn có thể xem và tìm hiểu sản phẩm trước khi quyết định tạo tài khoản hoặc đăng nhập.”  
**EN:** “This lets customers browse and explore products before deciding whether to create an account or sign in.”

## Bước 2 / Step 2 — Quan sát trang chủ / Explore the home screen

**Thao tác:** Giới thiệu banner, ô tìm kiếm, nút **Lọc**, danh sách sản phẩm và thanh tab phía dưới.  
**Action:** Point out the banner, search field, **Filter** button, product list, and bottom tab bar.

**MC nói / MC says:**

**VI:** “Đây là trang chủ của ứng dụng.”  
**EN:** “This is the app’s home screen.”

**VI:** “Phía trên là khu vực tìm kiếm và lọc sản phẩm, bên dưới là banner giới thiệu cùng danh sách hàng hóa.”  
**EN:** “At the top are product search and filters, followed by a promotional banner and the product list.”

**VI:** “Sản phẩm được hiển thị theo dạng lưới, mỗi hàng có ba sản phẩm và mỗi trang tối đa sáu sản phẩm.”  
**EN:** “Products are displayed in a grid of three per row, with up to six products on each page.”

**VI:** “Thanh điều hướng phía dưới gồm Home, Category, Cart và Account.”  
**EN:** “The bottom navigation includes Home, Category, Cart, and Account.”

**VI:** “Bây giờ em sẽ thử các chức năng mua sắm cơ bản khi chưa đăng nhập.”  
**EN:** “I’ll now demonstrate some basic shopping features while signed out.”

## Bước 3 / Step 3 — Tìm kiếm sản phẩm / Search for a product

**Thao tác:** Chạm ô **Tìm sản phẩm**, nhập từ khóa rồi chạm **Tìm** hoặc nút tìm kiếm trên bàn phím.  
**Action:** Tap **Search products**, enter a keyword, then tap **Search** or the search button on the keyboard.

**MC nói / MC says:**

**VI:** “Em nhập tên sản phẩm cần tìm vào ô này và nhấn Tìm.”  
**EN:** “I enter the product name here and tap Search.”

**VI:** “Kết quả được lọc theo tên sản phẩm hoặc tên danh mục.”  
**EN:** “Results are filtered by product name or category name.”

**VI:** “Khi đổi từ khóa, danh sách tự quay lại trang đầu để tránh đứng ở trang không còn kết quả.”  
**EN:** “When the keyword changes, the list returns to the first page so we don’t stay on a page with no results.”

**Thao tác:** Xóa từ khóa hoặc tìm từ khóa khác để trở về danh sách muốn demo.  
**Action:** Clear the keyword or search for another one to restore the list you want to show.

## Bước 4 / Step 4 — Lọc sản phẩm theo giá / Filter products by price

**Thao tác:** Chạm **Lọc**, chọn một khoảng giá và giới thiệu nút **Bỏ lọc**.  
**Action:** Tap **Filter**, select a price range, and point out **Clear filter**.

**MC nói / MC says:**

**VI:** “Nếu muốn thu hẹp lựa chọn theo ngân sách, khách chạm nút Lọc và chọn khoảng giá phù hợp.”  
**EN:** “To narrow down the choices by budget, customers tap Filter and select a suitable price range.”

**VI:** “Danh sách và số lượng sản phẩm sẽ cập nhật theo khoảng giá đã chọn.”  
**EN:** “The product list and result count update to match the selected range.”

**VI:** “Chạm Bỏ lọc sẽ hiển thị lại sản phẩm ở mọi mức giá.”  
**EN:** “Tapping Clear filter shows products from all price ranges again.”

## Bước 5 / Step 5 — Mở chi tiết sản phẩm / Open product details

**Thao tác:** Chạm vào ảnh hoặc tên một sản phẩm.  
**Action:** Tap a product image or name.

**MC nói / MC says:**

**VI:** “Tiếp theo, em chạm vào một sản phẩm để mở trang chi tiết.”  
**EN:** “Next, I’ll tap a product to open its details page.”

**VI:** “Ở đây khách xem được hình ảnh, tên và giá bán.”  
**EN:** “Here, customers can see the image, name, and price.”

**VI:** “Khách cũng có thể xem danh mục của sản phẩm và chọn danh mục để khám phá thêm các mặt hàng cùng nhóm.”  
**EN:** “Customers can also see the product’s category and select it to explore more items in the same group.”

## Bước 6 / Step 6 — Thêm sản phẩm vào giỏ / Add a product to the cart

**Thao tác:** Chạm **Thêm vào giỏ hàng**, sau đó quay lại trang chủ hoặc mở tab **Cart**.  
**Action:** Tap **Add to cart**, then return to the home screen or open the **Cart** tab.

**MC nói / MC says:**

**VI:** “Em nhấn Thêm vào giỏ hàng.”  
**EN:** “I tap Add to cart.”

**VI:** “Sản phẩm được thêm vào giỏ dùng chung của ứng dụng và số lượng trên tab Cart được cập nhật.”  
**EN:** “The product is added to the app’s shared cart, and the count on the Cart tab updates.”

**VI:** “Khách cũng có thể thêm nhanh ngay trên thẻ sản phẩm ở trang chủ mà không cần mở trang chi tiết.”  
**EN:** “Customers can also add a product directly from its home-screen card without opening the details page.”

## Bước 7 / Step 7 — Xem sản phẩm theo danh mục / Browse products by category

**Thao tác:** Chạm tab **Category**, chọn danh mục và giới thiệu danh sách sản phẩm.  
**Action:** Tap the **Category** tab, choose a category, and show its product list.

**MC nói / MC says:**

**VI:** “Ngoài cách tìm theo từ khóa, khách có thể mở tab Category và chọn nhóm hàng muốn xem.”  
**EN:** “Instead of searching by keyword, customers can open the Category tab and choose a product group.”

**VI:** “Ứng dụng chỉ hiển thị các sản phẩm thuộc danh mục đó.”  
**EN:** “The app displays only products in that category.”

**VI:** “Tại đây khách vẫn có thể mở chi tiết, thêm hàng vào giỏ và chuyển qua lại giữa các danh mục.”  
**EN:** “Customers can still open product details, add items to the cart, and switch between categories.”

## Bước 8 / Step 8 — Xem giỏ khi chưa đăng nhập / Review the cart as a guest

**Thao tác:** Chạm tab **Cart**, giới thiệu số lượng, nút tăng giảm và xóa. Thử tiếp tục checkout nếu nút có thể bấm.  
**Action:** Tap **Cart**, show the quantities and the increment, decrement, and remove controls. Try to continue checkout if the button is enabled.

**MC nói / MC says:**

**VI:** “Trong giỏ hàng, khách có thể kiểm tra mặt hàng, đơn giá và số lượng.”  
**EN:** “In the cart, customers can review the items, prices, and quantities.”

**VI:** “Khách có thể tăng giảm số lượng hoặc xóa món không cần nữa, và tổng tiền được tính lại theo số lượng hiện tại.”  
**EN:** “Customers can change quantities or remove items, and the total is recalculated based on the current quantities.”

**VI:** “Khi muốn đi tiếp đến bước đặt hàng, ứng dụng yêu cầu khách đăng nhập.”  
**EN:** “When customers continue to checkout, the app asks them to sign in.”

**VI:** “Đăng nhập giúp đơn hàng được gắn với đúng tài khoản để khách có thể theo dõi lịch sử mua hàng.”  
**EN:** “Signing in links the order to the correct account so customers can track their purchase history.”

> **VI:** Nếu nút checkout bị vô hiệu hóa do giỏ trống hoặc thiếu thông tin, không cần cố bấm; hãy giải thích điều kiện đặt hàng rồi chuyển sang tab Account.  
> **EN:** If checkout is disabled because the cart is empty or information is missing, do not force it; explain the checkout requirements and move to the Account tab.

---

# PHẦN 2 — LUỒNG KHÁCH HÀNG ĐĂNG NHẬP
# PART 2 — SIGNED-IN CUSTOMER FLOW

## Bước 9 / Step 9 — Mở màn hình đăng nhập / Open the sign-in screen

**Thao tác:** Chạm tab **Account**, sau đó chạm **Đăng nhập ngay**.  
**Action:** Tap the **Account** tab, then tap **Sign in now**.

**MC nói / MC says:**

**VI:** “Sau khi trải nghiệm với tư cách khách, em chuyển sang luồng khách hàng.”  
**EN:** “After browsing as a guest, I’ll move on to the customer flow.”

**VI:** “Em mở tab Account rồi chọn Đăng nhập ngay để vào màn hình xác thực.”  
**EN:** “I open the Account tab and tap Sign in now to reach the login screen.”

## Bước 10 / Step 10 — Đăng nhập tài khoản khách / Sign in as a customer

**Thao tác:** Nhập `khachhang1` và `123456`, sau đó chạm **Đăng nhập**.  
**Action:** Enter `khachhang1` and `123456`, then tap **Sign in**.

**MC nói / MC says:**

**VI:** “Em sử dụng tài khoản khách hàng mẫu đã được chuẩn bị.”  
**EN:** “I’m using the prepared sample customer account.”

**VI:** “Ứng dụng kiểm tra tên đăng nhập và mật khẩu trong cơ sở dữ liệu.”  
**EN:** “The app checks the username and password against its database.”

**VI:** “Nếu thông tin không chính xác, ứng dụng sẽ báo lỗi; với tài khoản hợp lệ, khách được đưa trở lại khu vực cửa hàng.”  
**EN:** “If the credentials are incorrect, the app displays an error; with a valid account, the customer returns to the store.”

**VI:** “Sau khi đăng nhập, các chức năng yêu cầu tài khoản cũng được mở.”  
**EN:** “After signing in, features that require an account are also available.”

## Bước 11 / Step 11 — Trở lại giỏ hàng / Return to the cart

**Thao tác:** Chạm tab **Cart**, kiểm tra sản phẩm đã thêm và tăng hoặc giảm số lượng.  
**Action:** Tap **Cart**, check the product you added, and increase or decrease its quantity.

**MC nói / MC says:**

**VI:** “Sau khi đăng nhập, em quay lại giỏ hàng.”  
**EN:** “After signing in, I return to the cart.”

**VI:** “Những sản phẩm đã thêm trong phiên vẫn còn ở đây.”  
**EN:** “Products added during this session are still here.”

**VI:** “Em có thể điều chỉnh số lượng hoặc xóa sản phẩm, và tổng tiền sẽ được cập nhật ngay.”  
**EN:** “I can adjust quantities or remove a product, and the total updates immediately.”

## Bước 12 / Step 12 — Kiểm tra thông tin nhận hàng / Review delivery information

**Thao tác:** Cuộn đến **Thông tin nhận hàng**. Giới thiệu thông tin đã điền sẵn hoặc chọn lần lượt tỉnh/thành, quận/huyện, phường/xã.  
**Action:** Scroll to **Delivery information**. Show the prefilled details, or select a province/city, district, and ward in order.

**MC nói / MC says:**

**VI:** “Tiếp theo là thông tin người nhận.”  
**EN:** “Next is the recipient information.”

**VI:** “Nếu khách đã lưu hồ sơ giao hàng, ứng dụng sẽ điền trước họ tên, số điện thoại và địa chỉ.”  
**EN:** “If the customer has saved delivery details, the app pre-fills their name, phone number, and address.”

**VI:** “Địa chỉ được chọn theo từng cấp: tỉnh hoặc thành phố trước, rồi đến quận huyện và phường xã.”  
**EN:** “The address is selected level by level: first the province or city, then the district, and finally the ward.”

**VI:** “Danh sách địa chỉ có ô tìm kiếm.”  
**EN:** “The address lists include a search field.”

**VI:** “Cuối cùng, khách nhập địa chỉ cụ thể như số nhà và tên đường.”  
**EN:** “Finally, the customer enters a street address such as a house number and street name.”

**VI:** “Họ tên, số điện thoại và địa chỉ đều được kiểm tra trước khi đặt hàng.”  
**EN:** “The name, phone number, and address are validated before the order can be placed.”

## Bước 13 / Step 13 — Thanh toán và ưu đãi / Payment and promotions

**Thao tác:** Mở **Phương thức thanh toán**, giới thiệu các lựa chọn, áp dụng **VANW10** và chỉ vào phần chi tiết thanh toán.  
**Action:** Open **Payment method**, show the options, apply **VANW10**, and point out the payment summary.

**MC nói / MC says:**

**VI:** “Ở phần thanh toán, ứng dụng cho chọn thanh toán khi nhận hàng, thẻ tín dụng hoặc ghi nợ, và ví điện tử.”  
**EN:** “For payment, the app offers cash on delivery, credit or debit card, and e-wallet.”

**VI:** “Hình thức giao hàng hiện là giao tiêu chuẩn miễn phí.”  
**EN:** “The current shipping option is free standard delivery.”

**VI:** “Mã VANW10 giảm mười phần trăm, tối đa một trăm nghìn đồng; ngoài ra còn có mã GIAM20K và FREESHIP.”  
**EN:** “The VANW10 code takes ten percent off, up to one hundred thousand Vietnamese dong; GIAM20K and FREESHIP are also available.”

**VI:** “Sau khi áp dụng mã, phần chi tiết cập nhật tiền hàng, giảm giá và tổng thanh toán.”  
**EN:** “After a code is applied, the summary updates the subtotal, discount, and final amount.”

**MC nói thêm nếu cần / Optional clarification:**

**VI:** “Các lựa chọn thẻ và ví hiện chỉ được lưu cho đơn hàng, chưa kết nối cổng thanh toán thật.”  
**EN:** “Card and e-wallet selections are currently saved with the order but are not connected to a real payment gateway.”

**VI:** “Phí giao hàng cũng đang được đặt miễn phí để phục vụ demo.”  
**EN:** “Shipping is also set to free for this demo.”

## Bước 14 / Step 14 — Xem lại đơn / Review the order

**Thao tác:** Cuộn xuống cuối trang và chạm **Xem lại thông tin**.  
**Action:** Scroll to the bottom and tap **Review order**.

**MC nói / MC says:**

**VI:** “Khi giỏ có sản phẩm và thông tin bắt buộc hợp lệ, nút Xem lại thông tin sẽ sẵn sàng.”  
**EN:** “When the cart has products and the required information is valid, the Review order button becomes available.”

**VI:** “Em nhấn vào đây để kiểm tra lần cuối sản phẩm, số lượng, người nhận, địa chỉ, phương thức thanh toán, ưu đãi và tổng tiền.”  
**EN:** “I tap it to review the products, quantities, recipient, address, payment method, promotion, and total one last time.”

## Bước 15 / Step 15 — Xác nhận đặt hàng / Place the order

**Thao tác:** Trong cửa sổ xem lại, chạm **Đặt hàng** và chờ thông báo thành công.  
**Action:** In the review window, tap **Place order** and wait for the success message.

**MC nói / MC says:**

**VI:** “Sau khi kiểm tra xong, em xác nhận đặt hàng.”  
**EN:** “After reviewing the details, I confirm the order.”

**VI:** “Ứng dụng lưu đơn hàng cùng các sản phẩm trong đơn vào SQLite với trạng thái ban đầu là Chờ xác nhận.”  
**EN:** “The app saves the order and its products to SQLite with an initial status of Pending confirmation.”

**VI:** “Khi đặt hàng thành công, giỏ hàng được làm trống.”  
**EN:** “Once the order is placed successfully, the cart is cleared.”

**VI:** “Từ thông báo này, khách có thể đi thẳng đến lịch sử đơn hàng.”  
**EN:** “From this message, the customer can go straight to their order history.”

## Bước 16 / Step 16 — Xem lịch sử đơn / View order history

**Thao tác:** Chọn **Xem đơn hàng** trong thông báo thành công, hoặc vào Account và chọn **Xem đơn hàng đã đặt**.  
**Action:** Tap **View order** in the success message, or open Account and select **View placed orders**.

**MC nói / MC says:**

**VI:** “Trong lịch sử mua hàng, khách xem được mã đơn, thời gian đặt, trạng thái, sản phẩm, số lượng, địa chỉ nhận và tổng tiền.”  
**EN:** “In order history, customers can see the order number, date, status, products, quantities, delivery address, and total.”

**VI:** “Khi mở chi tiết, ứng dụng hiển thị đầy đủ hơn thông tin nhận hàng và thanh toán.”  
**EN:** “Opening an order shows more complete recipient and payment information.”

**VI:** “Đơn mới đang ở trạng thái Chờ xác nhận.”  
**EN:** “The new order is currently Pending confirmation.”

**VI:** “Khi còn ở trạng thái này, khách có thể yêu cầu hủy đơn.”  
**EN:** “While it is in this state, the customer can request to cancel the order.”

**VI:** “Sau khi đơn được xác nhận hoặc chuyển sang quá trình giao, khách không thể tự hủy trên màn hình này.”  
**EN:** “Once the order is confirmed or moves into delivery, the customer can no longer cancel it from this screen.”

## Bước 17 / Step 17 — Xem thông báo / View notifications

**Thao tác:** Chạm biểu tượng chuông trên thanh tiêu đề và xem thông báo về đơn vừa tạo.  
**Action:** Tap the bell icon in the header and view the notification for the new order.

**MC nói / MC says:**

**VI:** “Biểu tượng chuông cho biết số thông báo chưa đọc.”  
**EN:** “The bell icon shows the number of unread notifications.”

**VI:** “Khách có thể xem thông báo đơn hàng đã được ghi nhận và các cập nhật trạng thái sau này.”  
**EN:** “Customers can see that their order was received and check future status updates.”

**VI:** “Khi mở danh sách, các thông báo hiện có được đánh dấu đã đọc.”  
**EN:** “Opening the list marks the existing notifications as read.”

## Bước 18 / Step 18 — Hồ sơ và đăng xuất / Profile and sign out

**Thao tác:** Mở tab **Me/Account**, giới thiệu hồ sơ, thông tin giao hàng, lịch sử và nút đăng xuất.  
**Action:** Open the **Me/Account** tab and show the profile, delivery information, order history, and sign-out button.

**MC nói / MC says:**

**VI:** “Trong hồ sơ, khách có thể cập nhật tên đăng nhập, email, ảnh đại diện và mật khẩu.”  
**EN:** “In the profile, customers can update their username, email, profile picture, and password.”

**VI:** “Thông tin giao hàng được lưu riêng để tự điền cho lần đặt tiếp theo.”  
**EN:** “Delivery information is saved separately so it can be prefilled during the next checkout.”

**VI:** “Khách cũng có thể mở lại lịch sử đơn hàng hoặc đăng xuất.”  
**EN:** “Customers can also revisit their order history or sign out.”

**Thao tác:** Chạm **Đăng xuất** và xác nhận nếu được hỏi.  
**Action:** Tap **Sign out** and confirm if prompted.

**MC nói / MC says:**

**VI:** “Em đăng xuất tài khoản khách hàng để chuyển sang khu vực quản trị.”  
**EN:** “I’ll sign out of the customer account before moving to the Admin area.”

---

# PHẦN 3 — LUỒNG ADMIN
# PART 3 — ADMIN FLOW

## Bước 19 / Step 19 — Đăng nhập Admin / Sign in as Admin

**Thao tác:** Từ màn hình Account, chạm **Đăng nhập ngay**, nhập `admin` / `123456`, rồi chạm **Đăng nhập**.  
**Action:** From the Account screen, tap **Sign in now**, enter `admin` / `123456`, then tap **Sign in**.

**MC nói / MC says:**

**VI:** “Bây giờ em đăng nhập bằng tài khoản Admin.”  
**EN:** “Now I’ll sign in with the Admin account.”

**VI:** “Ứng dụng nhận diện vai trò quản trị và tự chuyển sang khu vực Admin, tách biệt với giao diện mua sắm của khách hàng.”  
**EN:** “The app recognizes the administrator role and opens the Admin area, separate from the customer shopping interface.”

## Bước 20 / Step 20 — Xem Dashboard / View the dashboard

**Thao tác:** Tại tab **Home/Tổng quan**, giới thiệu số liệu người dùng, danh mục và sản phẩm.  
**Action:** On the **Home/Overview** tab, point out the user, category, and product counts.

**MC nói / MC says:**

**VI:** “Đây là màn hình Tổng quan của Admin.”  
**EN:** “This is the Admin Overview screen.”

**VI:** “Dashboard hiển thị số lượng người dùng, danh mục và sản phẩm để người quản trị nắm nhanh dữ liệu hiện có.”  
**EN:** “The dashboard shows the number of users, categories, and products, giving the administrator a quick summary of the current data.”

**VI:** “Thanh điều hướng bên dưới mở các khu vực quản lý người dùng, danh mục, sản phẩm và đơn hàng.”  
**EN:** “The bottom navigation opens user, category, product, and order management.”

## Bước 21 / Step 21 — Quản lý người dùng / Manage users

**Thao tác:** Chạm tab **Users**. Giới thiệu danh sách và có thể mở **Thêm** để xem biểu mẫu, rồi đóng lại mà không lưu.  
**Action:** Tap **Users**. Show the list and optionally open **Add** to show the form, then close it without saving.

**MC nói / MC says:**

**VI:** “Trong tab Users, Admin xem danh sách tài khoản khách hàng.”  
**EN:** “In the Users tab, Admin can view customer accounts.”

**VI:** “Admin có thể thêm tài khoản, sửa tên đăng nhập, họ tên, số điện thoại, ảnh đại diện hoặc mật khẩu, và xóa người dùng sau khi xác nhận.”  
**EN:** “Admin can add an account, edit its username, full name, phone number, profile picture, or password, and delete a user after confirmation.”

**VI:** “Tài khoản Admin gốc được bảo vệ và không xuất hiện trong danh sách để xóa.”  
**EN:** “The original Admin account is protected and does not appear in the list for deletion.”

**VI:** “Tài khoản được thêm từ màn hình này luôn có vai trò khách hàng; màn hình không cấp hoặc thu hồi quyền Admin.”  
**EN:** “Accounts added from this screen always have the customer role; this screen cannot grant or revoke Admin privileges.”

## Bước 22 / Step 22 — Quản lý danh mục / Manage categories

**Thao tác:** Chạm tab **Category**, giới thiệu danh sách, biểu mẫu tên/mô tả và các nút thêm, sửa, xóa.  
**Action:** Tap **Category** and show the list, name and description form, and add, edit, and delete controls.

**MC nói / MC says:**

**VI:** “Tiếp theo là quản lý danh mục.”  
**EN:** “Next is category management.”

**VI:** “Admin có thể xem các nhóm hàng, thêm danh mục, sửa tên hoặc mô tả và xóa danh mục.”  
**EN:** “Admin can view product groups, add a category, edit its name or description, and delete it.”

**VI:** “Các danh mục này được dùng để phân loại sản phẩm trong cửa hàng.”  
**EN:** “These categories are used to organize products in the store.”

## Bước 23 / Step 23 — Quản lý sản phẩm / Manage products

**Thao tác:** Chạm tab **Items/Sản phẩm**, giới thiệu biểu mẫu tên, giá, danh mục, chọn ảnh và danh sách sản phẩm.  
**Action:** Tap **Items/Products** and show the name, price, category, image selection form, and product list.

**MC nói / MC says:**

**VI:** “Trong phần quản lý sản phẩm, Admin xem danh sách hàng hóa kèm giá và danh mục.”  
**EN:** “In product management, Admin can view products along with their prices and categories.”

**VI:** “Khi thêm hoặc sửa sản phẩm, Admin nhập tên, giá, chọn danh mục và có thể chọn ảnh từ thư viện.”  
**EN:** “To add or edit a product, Admin enters a name and price, selects a category, and can choose an image from the photo library.”

**VI:** “Ứng dụng yêu cầu tên sản phẩm, giá lớn hơn không và một danh mục hợp lệ.”  
**EN:** “The app requires a product name, a price greater than zero, and a valid category.”

**VI:** “Admin cũng có thể xóa sản phẩm sau khi xác nhận.”  
**EN:** “Admin can also delete a product after confirmation.”

## Bước 24 / Step 24 — Tìm đơn vừa đặt / Find the new order

**Thao tác:** Chạm tab **Orders**, tìm đơn theo khách nhận, tài khoản hoặc mã đơn. Có thể dùng bộ lọc trạng thái.  
**Action:** Tap **Orders** and find the order by recipient, account, or order number. Use the status filter if needed.

**MC nói / MC says:**

**VI:** “Cuối cùng là quản lý đơn hàng.”  
**EN:** “Finally, this is order management.”

**VI:** “Tại đây Admin xem đơn của tất cả khách hàng, gồm tài khoản, sản phẩm, số lượng, người nhận, địa chỉ, thời gian và tổng tiền.”  
**EN:** “Here, Admin can view orders from all customers, including the account, products, quantities, recipient, address, date, and total.”

**VI:** “Admin có thể lọc danh sách theo trạng thái hoặc kéo xuống để làm mới.”  
**EN:** “Admin can filter the list by status or pull down to refresh.”

**VI:** “Em tìm đơn vừa tạo ở phần khách hàng; đơn này đang ở trạng thái Chờ xác nhận.”  
**EN:** “I’ll find the order we just placed in the customer flow; it is currently Pending confirmation.”

## Bước 25 / Step 25 — Cập nhật trạng thái đơn / Update the order status

**Thao tác:** Chạm **Cập nhật trạng thái đơn hàng**, chọn **Đã xác nhận** và xác nhận thao tác. Nếu còn thời gian, tiếp tục chuyển sang **Đang giao**, rồi **Đã giao**.  
**Action:** Tap **Update order status**, select **Confirmed**, and confirm. If time allows, continue to **Shipping**, then **Delivered**.

**MC nói / MC says:**

**VI:** “Admin có thể cập nhật tiến trình xử lý đơn.”  
**EN:** “Admin can update the order’s progress.”

**VI:** “Quy trình chỉ đi một chiều: đơn Chờ xác nhận có thể chuyển sang Đã xác nhận hoặc Đã hủy.”  
**EN:** “The workflow only moves forward: a Pending order can be Confirmed or Cancelled.”

**VI:** “Đơn Đã xác nhận có thể chuyển sang Đang giao hoặc Đã hủy.”  
**EN:** “A Confirmed order can move to Shipping or be Cancelled.”

**VI:** “Đơn Đang giao có thể chuyển sang Đã giao hoặc Đã hủy.”  
**EN:** “A Shipping order can move to Delivered or be Cancelled.”

**VI:** “Mỗi lần đổi trạng thái đều cần xác nhận và không thể chuyển lùi về trạng thái cũ.”  
**EN:** “Each status change requires confirmation, and an order cannot return to a previous status.”

**VI:** “Đơn Đã giao hoặc Đã hủy là trạng thái cuối và được khóa, không chỉnh sửa tiếp.”  
**EN:** “Delivered and Cancelled are final statuses, and the order is locked from further changes.”

> **VI:** Nếu muốn demo ngắn, chỉ cần chuyển đơn từ Chờ xác nhận sang Đã xác nhận.  
> **EN:** For a shorter demo, just move the order from Pending confirmation to Confirmed.

## Bước 26 / Step 26 — Kết thúc demo / Close the demo

**Thao tác:** Để màn hình đơn hàng hoặc Dashboard hiển thị.  
**Action:** Leave the app on the Orders screen or the dashboard.

**MC nói / MC says:**

**VI:** “Như vậy, em đã trình bày hành trình của khách chưa đăng nhập, khách hàng đăng nhập và Admin.”  
**EN:** “This concludes the guest, signed-in customer, and Admin journeys.”

**VI:** “Khách có thể xem và chọn sản phẩm; khách hàng có thể đặt đơn và theo dõi lịch sử; Admin có thể quản lý dữ liệu và cập nhật trạng thái đơn.”  
**EN:** “Guests can browse and select products; customers can place orders and track their history; and Admin can manage data and update order statuses.”

**VI:** “Ứng dụng hiện sử dụng SQLite cục bộ trên thiết bị.”  
**EN:** “The app currently uses local SQLite storage on the device.”

**VI:** “Thanh toán điện tử thực tế, đồng bộ máy chủ và khôi phục giỏ hàng sau khi đóng ứng dụng chưa được tích hợp trong phiên bản demo này.”  
**EN:** “Real electronic payments, server synchronization, and restoring the cart after closing the app are not included in this demo version.”

**VI:** “Em xin kết thúc phần trình bày, cảm ơn thầy cô và các bạn đã theo dõi.”  
**EN:** “This concludes my presentation. Thank you, everyone, for listening.”

---

## Thẻ nhắc nhanh / Quick reminder

1. **VI:** Khách chưa đăng nhập: Home → tìm kiếm/lọc giá → chi tiết → thêm giỏ → Category → Cart → giải thích cần đăng nhập để đặt hàng.  
   **EN:** Guest: Home → search/filter by price → product details → add to cart → Category → Cart → explain that sign-in is required to place an order.
2. **VI:** Khách hàng: Account → đăng nhập `khachhang1` / `123456` → Cart → thông tin nhận hàng → mã ưu đãi → xem lại → đặt hàng → lịch sử/thông báo → hồ sơ → đăng xuất.  
   **EN:** Customer: Account → sign in with `khachhang1` / `123456` → Cart → delivery details → promotion code → review → place order → history/notifications → profile → sign out.
3. **VI:** Admin: đăng nhập `admin` / `123456` → Dashboard → Users → Category → Items → Orders → cập nhật đơn.  
   **EN:** Admin: sign in with `admin` / `123456` → Dashboard → Users → Category → Items → Orders → update the order.
