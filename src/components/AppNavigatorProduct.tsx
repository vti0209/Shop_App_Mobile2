import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Sanpham3Sqlite from './Sanpham3Sqlite';
import ProductDetailScreen from './ProductDetailScreen';
import ProductsByCategoryScreen from './ProductsByCategoryScreen';
import { Product } from './database';

// ✅ Mở rộng type cho tất cả các màn hình
export type RootStackParamList = {
  Sanpham3Sqlite: undefined;
  ProductDetail: { product: Product };
  ProductsByCategory: { categoryId: number; categoryName?: string };
};

// Gán type này cho Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigatorProduct() {
  return (
    <Stack.Navigator>
      {/* Màn hình cũ */}
      <Stack.Screen
        name="Sanpham3Sqlite"
        component={Sanpham3Sqlite}
        options={{ title: 'Tất cả sản phẩm' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Chi tiết sản phẩm' }}
      />

      {/* Màn hình mới */}
      <Stack.Screen
        name="ProductsByCategory"
        component={ProductsByCategoryScreen}
        options={({ route }) => ({
          title: route.params.categoryName || 'Sản phẩm theo loại',
        })}
      />
    </Stack.Navigator>
  );
}
