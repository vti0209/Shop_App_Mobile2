import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Sanpham3Sqlite from './Sanpham3Sqlite';
import CustomerTabNavigator from './CustomerTabNavigator';
import ProductDetailScreen from './ProductDetailScreen';
import ProductsByCategoryScreen from './ProductsByCategoryScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import AdminHomeScreen from './admin/AdminHomeScreen';
import type { Product } from '../database/types';

// Khai báo kiểu tham số cho các màn hình trong luồng xác thực và cửa hàng.
export type RootStackParamList = {
  Sanpham3Sqlite: undefined;
  CustomerTabs: { username?: string } | undefined;
  AdminHome: undefined;
  ProductDetail: { product: Product };
  ProductsByCategory: { categoryId: number; categoryName?: string };
  Login: { username?: string } | undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Nút đăng xuất xóa lịch sử màn hình đã đăng nhập để không quay lại bằng nút Back.
const LogoutHeaderButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable
      onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
      style={styles.logoutButton}
      accessibilityRole="button"
      accessibilityLabel="Đăng xuất"
    >
      <Text style={styles.logoutButtonText}>Đăng xuất</Text>
    </Pressable>
  );
};

export default function AppNavigatorProduct() {
  return (
    <Stack.Navigator initialRouteName="CustomerTabs">
      {/* Ứng dụng bắt đầu ở homeuser screen; chưa đăng nhập vẫn vào được cửa hàng. */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Đăng nhập' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Đăng ký' }}
      />

      {/* Khách có thể mua sắm trước khi đăng nhập; tài khoản được xử lý trong tab riêng. */}
      <Stack.Screen
        name="CustomerTabs"
        component={CustomerTabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{
          title: 'Admin Dashboard',
          headerRight: LogoutHeaderButton,
        }}
      />

      {/* Giữ nguyên màn hình quản lý sản phẩm cũ để không xóa chức năng hiện có. */}
      <Stack.Screen
        name="Sanpham3Sqlite"
        component={Sanpham3Sqlite}
        options={{ title: 'Quản lý sản phẩm' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Chi tiết sản phẩm' }}
      />

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

const styles = StyleSheet.create({
  logoutButton: {
    paddingVertical: 8,
    paddingLeft: 12,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
