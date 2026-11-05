import React, { useEffect, useState } from 'react';
import { Alert, View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigatorProduct';
import { fetchCategories, fetchProductsByCategory } from '../../database/projectDb';
import type { Category, Product } from '../../database/types';
import CategorySelector from './CategorySelector';
import { getProductImageSource } from '../../utils/imageHelper';
import { useCart } from './CartContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductsByCategory'>;
type RouteProps = RouteProp<RootStackParamList, 'ProductsByCategory'>;
const PRODUCTS_PER_PAGE = 6;

export default function ProductsByCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { addToCart } = useCart();

  const { categoryId } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
  const pageProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
    });
  }, []);

  // Tải sản phẩm theo loại đang chọn
  useEffect(() => {
    fetchProductsByCategory(selectedCategoryId).then(setProducts);
  }, [selectedCategoryId]);

  // Đồng bộ tiêu đề trên thanh điều hướng mỗi khi đổi loại
  const handleSelectCategory = (id: number) => {
    setSelectedCategoryId(id);
    setCurrentPage(1);
    const found = categories.find((c) => c.id === id);
    if (found) {
      navigation.setOptions({ title: found.name });
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.cardContent}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image source={getProductImageSource(item.img)} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>{item.price.toLocaleString('vi-VN')} đ</Text>
        </View>
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
    <View style={styles.container}>
      <Text style={styles.filterTitle}>Chọn danh mục:</Text>
      <View style={styles.selectorWrapper}>
        <CategorySelector
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={handleSelectCategory}
        />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          Danh sách sản phẩm ({products.length})
        </Text>
      </View>

      <FlatList
        data={pageProducts}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        extraData={currentPage}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có sản phẩm nào thuộc loại này</Text>
          </View>
        }
      />
      {products.length > 0 && (
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f8fafc',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  selectorWrapper: {
    marginBottom: 8,
    minWidth: 0,
  },
  headerRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    flexShrink: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  productRow: {
    gap: 8,
  },
  card: {
    flex: 1,
    minWidth: 0,
    padding: 7,
    marginBottom: 9,
    backgroundColor: '#ffffff',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  cardContent: {
    alignItems: 'stretch',
  },
  addToCartButton: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#009760',
    borderRadius: 8,
  },
  addToCartText: { color: '#fff', fontSize: 9.5, fontWeight: '700' },
  image: {
    width: '100%',
    height: 78,
    borderRadius: 8,
    marginBottom: 6,
    resizeMode: 'contain',
    backgroundColor: '#f1f5f9',
  },
  info: {
    minWidth: 0,
    justifyContent: 'center',
  },
  name: {
    minHeight: 30,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  price: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#e11d48',
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 20,
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
  pageButtonDisabled: { backgroundColor: '#f1f5f9' },
  pageButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  pageButtonTextDisabled: { color: '#94a3b8' },
  pageIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pageNumber: { color: '#6d28d9', fontSize: 16, fontWeight: '800' },
  pageDivider: { color: '#94a3b8', fontSize: 13 },
  pageTotal: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
