// src/utils/imageHelper.ts
// Ánh xạ hình ảnh từ thư mục assets/images hoặc từ URI thiết bị (ImagePicker)

export const getProductImageSource = (img: string | undefined | null) => {
  if (!img) {
    return require('../assets/images/sanpham1.png');
  }

  // Nếu là đường dẫn ảnh từ thư viện máy ảnh (file://, content://, https://, http://)
  if (
    img.startsWith('file://') ||
    img.startsWith('content://') ||
    img.startsWith('http://') ||
    img.startsWith('https://')
  ) {
    return { uri: img };
  }

  switch (img) {
    case 'sanpham1.png':
      return require('../assets/images/sanpham1.png');
    case 'sanpham2.png':
      return require('../assets/images/sanpham2.png');
    case 'sanpham3.png':
      return require('../assets/images/sanpham3.png');
    case 'sanpham4.png':
      return require('../assets/images/sanpham4.png');
    case 'sanpham5.png':
      return require('../assets/images/sanpham5.png');
    case 'sanpham6.png':
      return require('../assets/images/sanpham6.png');
    case 'sanpham7.png':
      return require('../assets/images/sanpham7.png');
    case 'sanpham8.png':
      return require('../assets/images/sanpham8.png');
    case 'sanpham9.png':
      return require('../assets/images/sanpham9.png');
    case 'sanpham10.png':
      return require('../assets/images/sanpham10.png');
    case 'banner.png':
      return require('../assets/images/banner.png');
    case 'Logo.png':
      return require('../assets/images/Logo.png');
    default:
      return require('../assets/images/sanpham1.png');
  }
};
