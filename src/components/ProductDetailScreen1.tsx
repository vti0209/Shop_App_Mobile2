// Trang chi tiết sản phẩm 1
import React, { useEffect, useState } from 'react';
import { Text, Image, StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { fetchCategories, Category } from './database';
import { RootStackParamList } from './AppNavigatorProduct';
import { getProductImageSource } from '../utils/imageHelper';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen1 = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(product.categoryId);

  useEffect(() => {
    const load = async () => {
      const cats = await fetchCategories();
      setCategories(cats);
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.imageCard}>
        <Image
          source={getProductImageSource(product.img)}
          style={styles.image}
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toLocaleString('vi-VN')} đ</Text>
      </View>

      <View style={styles.categoryCard}>
        <Text style={styles.label}>Chọn loại sản phẩm:</Text>
        <View style={styles.categories}>
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.category, isSelected && styles.selectedCategory]}
                onPress={() => setSelectedCategoryId(category.id)}
              >
                <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  categoryCard: {
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
    marginBottom: 10,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  category: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
  },
  selectedCategory: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen1;
