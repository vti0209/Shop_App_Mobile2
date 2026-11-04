// BUỔI 13 - 03/11/2026 - ĐIỀU HƯỚNG SẢN PHẨM
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigatorProduct from './src/components/AppNavigatorProduct';

// Nếu muốn chạy bài mẫu Stack đơn giản (Home -> Detail):
// import AppNavigator from './src/components/AppNavigator';

// Nếu muốn chạy trang Quản trị Admin:
// import AdminHomeScreen from './src/components/admin/AdminHomeScreen';

function App() {
  return (
    <NavigationContainer>
      <AppNavigatorProduct />
    </NavigationContainer>
  );
}

export default App;
