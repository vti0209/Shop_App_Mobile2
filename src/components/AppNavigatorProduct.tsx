import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomerTabNavigator from './users/CustomerTabNavigator';
import ProductDetailScreen from './users/ProductDetailScreen';
import ProductsByCategoryScreen from './users/ProductByCategoryScreen';
import OrderHistoryScreen from './users/OrderHistoryScreen';
import { CartProvider } from './users/CartContext';
import { AuthProvider, useAuth } from './users/AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import AdminTabNavigator from './admin/AdminTabNavigator';
import NotificationBell from './users/NotificationBell';
import type { Product } from '../database/types';

// Khai báo kiểu tham số cho các màn hình trong luồng xác thực và cửa hàng.
export type RootStackParamList = {
  CustomerTabs: { username?: string; userId?: number } | undefined;
  AdminHome: { username?: string; fullName?: string; userId?: number } | undefined;
  ProductDetail: { product: Product };
  ProductsByCategory: { categoryId: number; categoryName?: string };
  OrderHistory: { userId: number };
  Login: { username?: string } | undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Nút đăng xuất xóa lịch sử màn hình đã đăng nhập để không quay lại bằng nút Back.
const LogoutHeaderButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  return (
    <Pressable
      onPress={() => {
        logout();
        navigation.reset({ index: 0, routes: [{ name: 'CustomerTabs' }] });
      }}
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
    <AuthProvider>
      <CartProvider>
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
            component={AdminTabNavigator}
            options={({ route }) => ({
              title: route.params?.fullName || route.params?.username || 'Trang chủ quản trị',
              headerRight: LogoutHeaderButton,
            })}
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
          <Stack.Screen
            name="OrderHistory"
            component={OrderHistoryScreen}
            options={({ route }) => ({
              title: 'Lịch sử mua hàng',
              headerRight: () => <NotificationBell userId={route.params.userId} />,
            })}
          />
        </Stack.Navigator>
      </CartProvider>
    </AuthProvider>
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
