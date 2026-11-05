// Trang chủ khách hàng chỉ hiển thị sản phẩm; không có các thao tác quản trị.
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from './AppNavigatorProduct';
import CategorySelector from './CategorySelector';
import { fetchCategories, fetchProducts, initProjectDatabase } from '../database/projectDb';
import type { Category, Product } from '../database/types';
import { getProductImageSource } from '../utils/imageHelper';

type CustomerNavigation = NavigationProp<RootStackParamList>;
const allProductsCategory: Category = { id: 0, name: 'Tất cả' };

const CustomerHomeScreen = () => {
  const navigation = useNavigation<CustomerNavigation>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

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

  // Bước 3: Mở trang chi tiết khi người dùng chọn sản phẩm.
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      accessibilityRole="button"
      accessibilityLabel={`Xem chi tiết ${item.name}`}
    >
      <Image source={getProductImageSource(item.img)} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
    </TouchableOpacity>
  );

  const selectedCategoryName =
    selectorCategories.find((category) => category.id === selectedCategoryId)?.name ??
    'Tất cả';

  return (
    <View style={styles.screen}>
      {/* Bước 4: Chào mừng người dùng và cho phép lọc sản phẩm theo danh mục. */}
      <View style={styles.banner}>
        <Text style={styles.bannerCaption}>Tạp hóa Vanw Tiet</Text>
        <Text style={styles.bannerTitle} numberOfLines={2}>
          Xin chào!
        </Text>
        <Text style={styles.bannerDescription}>Khám phá sản phẩm bên dưới</Text>
      </View>

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
        data={visibleProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có sản phẩm để hiển thị.</Text>
        }
      />
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
    padding: 18,
    marginTop: 14,
    marginBottom: 18,
    backgroundColor: '#7c3aed',
    borderRadius: 14,
  },
  bannerCaption: {
    color: '#ddd6fe',
    fontSize: 13,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    flexShrink: 1,
  },
  bannerDescription: {
    color: '#ede9fe',
    fontSize: 13,
    marginTop: 4,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 14,
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
    fontSize: 9,
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
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '700',
  },
  productCount: {
    color: '#64748b',
    fontSize: 12,
  },
  productList: {
    paddingBottom: 24,
  },
  productRow: {
    gap: 10,
  },
  productCard: {
    flex: 1,
    minWidth: 0,
    padding: 9,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 132,
    marginBottom: 10,
    resizeMode: 'contain',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  productName: {
    minHeight: 38,
    color: '#1e293b',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  productPrice: {
    color: '#be123c',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyText: {
    width: '100%',
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 36,
  },
});

export default CustomerHomeScreen;
