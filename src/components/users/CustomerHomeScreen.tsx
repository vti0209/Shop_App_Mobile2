// Trang chủ khách hàng chỉ hiển thị sản phẩm; không có các thao tác quản trị.
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../AppNavigatorProduct';
import CategorySelector from './CategorySelector';
import { fetchCategories, fetchProducts, initProjectDatabase } from '../../database/projectDb';
import type { Category, Product } from '../../database/types';
import { getProductImageSource } from '../../utils/imageHelper';
import { useCart } from './CartContext';

type CustomerNavigation = NavigationProp<RootStackParamList>;
const allProductsCategory: Category = { id: 0, name: 'Tất cả' };
const PRODUCTS_PER_PAGE = 6;

const CustomerHomeScreen = () => {
  const navigation = useNavigation<CustomerNavigation>();
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Bước 1: Khởi tạo cùng database với đăng nhập và tải danh mục, sản phẩm.
  useEffect(() => {
    initProjectDatabase(() => {
      Promise.all([fetchCategories(), fetchProducts()]).then(([loadedCategories, loadedProducts]) => {
        setCategories(loadedCategories);
        setProducts(loadedProducts);
      });
    });
  }, []);

  // Bước 2: Lọc danh sách hiện có; lựa chọn "Tất cả" hiển thị toàn bộ sản phẩm.
  const visibleProducts = useMemo(
    () => {
      const normalizedKeyword = searchKeyword.trim().toLocaleLowerCase('vi');
      return products.filter((product) => {
        const matchesCategory =
          selectedCategoryId === 0 || product.categoryId === selectedCategoryId;
        const categoryName = categories.find(
          (category) => category.id === product.categoryId
        )?.name;
        const matchesSearch =
          !normalizedKeyword ||
          `${product.name} ${categoryName ?? ''}`
            .toLocaleLowerCase('vi')
            .includes(normalizedKeyword);
        return matchesCategory && matchesSearch;
      });
    },
    [categories, products, searchKeyword, selectedCategoryId]
  );
  const selectorCategories = useMemo(
    () => [allProductsCategory, ...categories],
    [categories]
  );
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE));
  const pageProducts = visibleProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchKeyword]);

  // Bước 3: Mở trang chi tiết khi người dùng chọn sản phẩm.
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        accessibilityRole="button"
        accessibilityLabel={`Xem chi tiết ${item.name}`}
      >
        <Image source={getProductImageSource(item.img)} style={styles.productImage} />
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => {
          addToCart(item);
          Alert.alert('Đã thêm vào giỏ', `${item.name} đã được thêm vào giỏ hàng.`);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Thêm ${item.name} vào giỏ hàng`}
      >
        <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
      </TouchableOpacity>
    </View>
  );

  const selectedCategoryName =
    selectorCategories.find((category) => category.id === selectedCategoryId)?.name ??
    'Tất cả';

  return (
    <View style={styles.screen}>
      <View style={styles.searchFilterRow}>
        <TextInput
          style={styles.searchInput}
          value={searchInput}
          onChangeText={setSearchInput}
          onSubmitEditing={() => setSearchKeyword(searchInput)}
          placeholder="Tìm sản phẩm"
          placeholderTextColor="#94a3b8"
          returnKeyType="search"
          accessibilityLabel="Tìm sản phẩm"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchKeyword(searchInput)}
          accessibilityRole="button"
          accessibilityLabel="Tìm kiếm"
        >
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showCategoryFilter && styles.filterButtonActive,
          ]}
          onPress={() => setShowCategoryFilter((visible) => !visible)}
          accessibilityRole="button"
          accessibilityLabel="Lọc theo danh mục"
          accessibilityState={{ expanded: showCategoryFilter }}
        >
          <Text
            style={[
              styles.filterButtonText,
              showCategoryFilter && styles.filterButtonTextActive,
            ]}
            numberOfLines={1}
          >
            Lọc
          </Text>
        </TouchableOpacity>
      </View>
      {/* Bước 4: Chào mừng người dùng và cho phép lọc sản phẩm theo danh mục. */}
      <View style={styles.banner}>
        <Image source={require('../../assets/images/banner.png')} style={styles.bannerImage} />
        <Text style={styles.bannerTitle} numberOfLines={2}>
          Xin chào!
        </Text>
        <Text style={styles.bannerDescription}>Hãy trải nghiệm mua sắm tuyệt vời cùng chúng tôi nhé ❤️</Text>
      </View>

      {showCategoryFilter && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Danh mục: {selectedCategoryName}</Text>
          <CategorySelector
            categories={selectorCategories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </View>
      )}

      <View style={styles.productsHeading}>
        <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
        <Text style={styles.productCount}>{visibleProducts.length} sản phẩm</Text>
      </View>
      <FlatList
        data={pageProducts}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        extraData={currentPage}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có sản phẩm để hiển thị.</Text>
        }
      />
      {visibleProducts.length > 0 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
            onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            accessibilityRole="button"
            accessibilityLabel="Trang trước"
          >
            <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>
              ‹ Trước
            </Text>
          </TouchableOpacity>
          <View style={styles.pageIndicator}>
            <Text style={styles.pageNumber}>{currentPage}</Text>
            <Text style={styles.pageDivider}>/</Text>
            <Text style={styles.pageTotal}>{totalPages}</Text>
          </View>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
            onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            accessibilityRole="button"
            accessibilityLabel="Trang sau"
          >
            <Text style={[styles.pageButtonText, currentPage === totalPages && styles.pageButtonTextDisabled]}>
              Sau ›
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  banner: {
    padding: 10,
    marginTop: 2,
    marginBottom: 2,
    backgroundColor: '#003d7a',
    borderRadius: 14,
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 14,
  },
  bannerCaption: {
    color: '#ddd6fe',
    fontSize: 10,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    flexShrink: 1,
  },
  bannerDescription: {
    color: '#ede9fe',
    fontSize: 12,
    marginTop: 2,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    fontSize: 12,
  },
  searchButton: {
    minWidth: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  filterButton: {
    minWidth: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
  },
  filterButtonActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#7c3aed',
  },
  filterButtonText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
  },
  filterButtonTextActive: {
    color: '#6d28d9',
  },
  filterPanel: {
    marginBottom: 4,
  },
  filterLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  productsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  productCount: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  productList: {
    paddingBottom: 12,
  },
  productRow: {
    gap: 4,
  },
  productCard: {
    flex: 1,
    minWidth: 0,
    padding: 7,
    marginBottom: 5,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 13,
    elevation: 2,
  },
  addToCartButton: {
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#009760',
    borderRadius: 9,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
  productImage: {
    width: '100%',
    height: 86,
    marginBottom: 7,
    resizeMode: 'contain',
    backgroundColor: '#f1f5f9',
    borderRadius: 9,
  },
  productName: {
    minHeight: 34,
    color: '#1e293b',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
  },
  productPrice: {
    color: '#be123c',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 4,
    marginBottom: 4,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 14,
  },
  pageButton: {
    minWidth: 88,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
  },
  pageButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
  pageButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  pageButtonTextDisabled: {
    color: '#94a3b8',
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pageNumber: {
    color: '#6d28d9',
    fontSize: 14,
    fontWeight: '800',
  },
  pageDivider: {
    color: '#94a3b8',
    fontSize: 10,
  },
  pageTotal: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyText: {
    width: '100%',
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 36,
  },
});

export default CustomerHomeScreen;
