// Trang chủ khách hàng chỉ hiển thị sản phẩm; không có các thao tác quản trị.
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../AppNavigatorProduct';
import { fetchCategories, fetchProducts, initProjectDatabase } from '../../database/projectDb';
import type { Category, Product } from '../../database/types';
import { getProductImageSource } from '../../utils/imageHelper';
import { useCart } from './CartContext';

type CustomerNavigation = NavigationProp<RootStackParamList>;
const PRODUCTS_PER_PAGE = 6;
const priceRanges = [
  { label: '0–dưới 200.000đ', min: 0, max: 200_000 },
  { label: '200.000–dưới 500.000đ', min: 200_000, max: 500_000 },
  { label: '500.000–1.000.000đ', min: 500_000, max: 1_000_001 },
  { label: 'Trên 1.000.000đ', min: 1_000_001, max: Number.POSITIVE_INFINITY },
];

const CustomerHomeScreen = () => {
  const navigation = useNavigation<CustomerNavigation>();
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showPriceFilter, setShowPriceFilter] = useState(false);
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
        const categoryName = categories.find(
          (category) => category.id === product.categoryId
        )?.name;
        const selectedPriceRange =
          selectedPriceRangeIndex === null ? null : priceRanges[selectedPriceRangeIndex];
        const matchesPriceRange =
          selectedPriceRange === null ||
          (product.price >= selectedPriceRange.min && product.price < selectedPriceRange.max);
        const matchesSearch =
          !normalizedKeyword ||
          `${product.name} ${categoryName ?? ''}`
            .toLocaleLowerCase('vi')
            .includes(normalizedKeyword);
        return matchesPriceRange && matchesSearch;
      });
    },
    [categories, products, searchKeyword, selectedPriceRangeIndex]
  );
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE));
  const pageProducts = visibleProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPriceRangeIndex, searchKeyword]);

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
            showPriceFilter && styles.filterButtonActive,
          ]}
          onPress={() => setShowPriceFilter((visible) => !visible)}
          accessibilityRole="button"
          accessibilityLabel="Lọc theo khoảng giá"
          accessibilityState={{ expanded: showPriceFilter }}
        >
          <Text
            style={[
              styles.filterButtonText,
              showPriceFilter && styles.filterButtonTextActive,
            ]}
            numberOfLines={1}
          >
            Lọc
          </Text>
        </TouchableOpacity>
      </View>
      {/* Bước 4: Chào mừng người dùng và cho phép lọc sản phẩm theo khoảng giá. */}
      <View style={styles.banner}>
        <Image source={require('../../assets/images/banner.png')} style={styles.bannerImage} />
        <Text style={styles.bannerTitle} numberOfLines={2}>
          Xin chào! 
        </Text>
        <Text style={styles.bannerDescription}>Hãy trải nghiệm mua sắm tuyệt vời cùng chúng tôi nhé ❤️</Text>
      </View>

      {showPriceFilter && (
        <View style={styles.filterPanel}>
          <View style={styles.filterLabelRow}>
            <Text style={styles.filterLabel}>
              Khoảng giá: {selectedPriceRangeIndex === null
                ? 'Tất cả'
                : priceRanges[selectedPriceRangeIndex].label}
            </Text>
            {selectedPriceRangeIndex !== null && (
              <TouchableOpacity
                onPress={() => setSelectedPriceRangeIndex(null)}
                accessibilityRole="button"
                accessibilityLabel="Bỏ lọc giá"
              >
                <Text style={styles.clearPriceFilter}>Bỏ lọc</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.priceRangeList}
          >
            {priceRanges.map((range, index) => {
              const isSelected = selectedPriceRangeIndex === index;
              return (
                <TouchableOpacity
                  key={range.label}
                  style={[styles.priceRangeButton, isSelected && styles.priceRangeButtonSelected]}
                  onPress={() => setSelectedPriceRangeIndex(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Lọc giá ${range.label}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.priceRangeText, isSelected && styles.priceRangeTextSelected]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    height: 96,
    borderRadius: 14,
  },
  bannerCaption: {
    color: '#ddd6fe',
    fontSize: 5,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 12,
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
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 4,
  },
  clearPriceFilter: {
    color: '#6d28d9',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  priceRangeList: {
    alignItems: 'center',
    paddingVertical: 5,
    gap: 8,
  },
  priceRangeButton: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 11,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 18,
  },
  priceRangeButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  priceRangeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  priceRangeTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
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
