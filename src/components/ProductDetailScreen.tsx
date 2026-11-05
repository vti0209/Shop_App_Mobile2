// Trang chi tiết sản phẩm
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchCategories } from '../database/projectDb';
import type { Category } from '../database/types';
import CategorySelector from './CategorySelector';
import { RootStackParamList } from './AppNavigatorProduct';
import { getProductImageSource } from '../utils/imageHelper';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductsByCategory'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { product } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const load = async () => {
      const cats = await fetchCategories();
      setCategories(cats);
    };
    load();
  }, []);

  const handleSelectCategory = (id: number) => {
    const selected = categories.find((c) => c.id === id);
    if (selected) {
      navigation.navigate('ProductsByCategory', {
        categoryId: selected.id,
        categoryName: selected.name,
      });
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Khung hiển thị ảnh sản phẩm */}
      <View style={styles.imageCard}>
        <Image
          source={getProductImageSource(product.img)}
          style={styles.image}
        />
      </View>

      {/* Thông tin sản phẩm */}
      <View style={styles.infoCard}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toLocaleString('vi-VN')} đ</Text>
      </View>

      {/* Danh mục sản phẩm liên quan */}
      <View style={styles.categorySection}>
        <Text style={styles.label}>Xem các sản phẩm khác theo loại:</Text>
        <CategorySelector
          categories={categories}
          selectedId={product.categoryId}
          onSelect={handleSelectCategory}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  imageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'contain',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e11d48',
  },
  categorySection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
});

export default ProductDetailScreen;
