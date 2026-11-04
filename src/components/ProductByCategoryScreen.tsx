import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './AppNavigatorProduct';
import { Product, Category, fetchCategories, fetchProductsByCategory } from './database';
import CategorySelector from './CategorySelector';
import { getProductImageSource } from '../utils/imageHelper';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductsByCategory'>;
type RouteProps = RouteProp<RootStackParamList, 'ProductsByCategory'>;

export default function ProductsByCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const { categoryId, categoryName } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
      // Đồng bộ tiêu đề ban đầu nếu có
      const currentCat = cats.find((c) => c.id === selectedCategoryId);
      if (currentCat) {
        navigation.setOptions({ title: currentCat.name });
      }
    });
  }, []);

  // Tải sản phẩm theo loại đang chọn
  useEffect(() => {
    fetchProductsByCategory(selectedCategoryId).then(setProducts);
  }, [selectedCategoryId]);

  // Đồng bộ tiêu đề trên thanh điều hướng mỗi khi đổi loại
  const handleSelectCategory = (id: number) => {
    setSelectedCategoryId(id);
    const found = categories.find((c) => c.id === id);
    if (found) {
      navigation.setOptions({ title: found.name });
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={getProductImageSource(item.img)} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.price}>{item.price.toLocaleString('vi-VN')} đ</Text>
      </View>
      <Text style={styles.arrowIcon}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.filterTitle}>Chọn loại sản phẩm:</Text>
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
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có sản phẩm nào thuộc loại này</Text>
          </View>
        }
      />
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
  },
  headerRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover',
    backgroundColor: '#f1f5f9',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e11d48',
  },
  arrowIcon: {
    fontSize: 22,
    color: '#94a3b8',
    paddingHorizontal: 6,
  },
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
