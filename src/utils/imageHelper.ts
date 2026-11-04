// src/utils/imageHelper.ts
// Ánh xạ hình ảnh từ thư mục assets/images hoặc từ URI thiết bị (ImagePicker)

export const getProductImageSource = (img: string | undefined | null) => {
  if (!img) {
    return require('../assets/images/sanpham1.png');
  }

  // Nếu là đường dẫn ảnh từ thư viện thiết bị hoặc mạng
  if (
    img.startsWith('file://') ||
    img.startsWith('content://') ||
    img.startsWith('http://') ||
    img.startsWith('https://')
  ) {
    return { uri: img };
  }

  const name = img.toLowerCase().trim();

  switch (name) {
    case 'sanpham1.png':
    case 'hinh1.jpg':
      return require('../assets/images/sanpham1.png');
    case 'sanpham2.png':
    case 'hinh2.jpg':
      return require('../assets/images/sanpham2.png');
    case 'sanpham3.png':
    case 'hinh3.jpg':
      return require('../assets/images/sanpham3.png');
    case 'sanpham4.png':
    case 'hinh4.jpg':
      return require('../assets/images/sanpham4.png');
    case 'sanpham5.png':
    case 'hinh5.jpg':
      return require('../assets/images/sanpham5.png');
    case 'sanpham6.png':
    case 'hinh6.jpg':
      return require('../assets/images/sanpham6.png');
    case 'sanpham7.png':
    case 'hinh7.jpg':
      return require('../assets/images/sanpham7.png');
    case 'sanpham8.png':
    case 'hinh8.jpg':
      return require('../assets/images/sanpham8.png');
    case 'sanpham9.png':
    case 'hinh9.jpg':
      return require('../assets/images/sanpham9.png');
    case 'sanpham10.png':
    case 'hinh10.jpg':
      return require('../assets/images/sanpham10.png');
    case 'banner.png':
      return require('../assets/images/banner.png');
    case 'logo.png':
      return require('../assets/images/Logo.png');
    case 'logo1.png':
      return require('../assets/images/Logo1.png');
    default:
      return require('../assets/images/sanpham1.png');
  }
};
