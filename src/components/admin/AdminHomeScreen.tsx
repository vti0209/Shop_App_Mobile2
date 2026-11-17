// src/components/admin/AdminHomeScreen.tsx
// CHỨC NĂNG 13: Trang chủ quản trị - Thống kê và Quản lý đơn hàng & doanh thu

import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { initProjectDatabase, getDashboardStats } from '../../database/projectDb';
import type { AdminTabParamList } from './AdminTabNavigator';

const AdminHomeScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalProducts: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
  });

  const loadStats = useCallback(async () => {
    const data = await getDashboardStats();
    setStats(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      initProjectDatabase(() => {
        loadStats();
      });
    }, [loadStats])
  );

  // Giao diện chính Trang chủ quản trị
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <Image source={require('../../assets/images/banner.png')} style={styles.banner} />

        {/* Khung tóm tắt thống kê tổng quan */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Tổng quan hệ thống</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalCategories}</Text>
              <Text style={styles.statLabel}>Danh mục</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Sản phẩm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>
          </View>

          {/* Ô quản lý doanh thu thực tế (chỉ cộng khi giao thành công) */}
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <Text style={styles.revenueBadgeLabel}> Doanh thu</Text>
              <Text style={styles.revenueOrdersCount}>
                {stats.completedOrders}/{stats.totalOrders} đơn thành công
              </Text>
            </View>
            <Text style={styles.revenueAmount}>
              {stats.totalRevenue.toLocaleString('vi-VN')} đ
            </Text>
            <Text style={styles.revenueSubtext}>
              * Chỉ cộng khi đơn hàng được giao thành công. Các đơn đang xử lý ({stats.pendingRevenue.toLocaleString('vi-VN')}đ) chưa cộng vào.
            </Text>
          </View>
        </View>

        <Text style={styles.menuTitle}>Menu Quản Trị</Text>

        {/* Nút: Quản lý đơn hàng & Doanh thu */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnOrders]}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.menuButtonTitle}>
            Quản lý đơn & Doanh thu ({stats.totalOrders})
          </Text>
          <Text style={styles.menuButtonDesc}>
            Theo dõi trạng thái giao hàng, duyệt đơn và quản lý doanh thu của cửa hàng
          </Text>
        </TouchableOpacity>

        {/* Nút 1: Quản lý user */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnUser]}
          onPress={() => navigation.navigate('Users')}
        >
          <Text style={styles.menuButtonTitle}>Quản lý user ({stats.totalUsers})</Text>
          <Text style={styles.menuButtonDesc}>Xem danh sách tài khoản khách hàng và phân quyền</Text>
        </TouchableOpacity>

        {/* Nút 2: Quản lý danh mục */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnCategory]}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.menuButtonTitle}>Quản lý danh mục ({stats.totalCategories})</Text>
          <Text style={styles.menuButtonDesc}>Thêm mới, chỉnh sửa và quản lý các loại sản phẩm</Text>
        </TouchableOpacity>

        {/* Nút 3: Quản lý sản phẩm */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnProduct]}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.menuButtonTitle}>Quản lý sản phẩm ({stats.totalProducts})</Text>
          <Text style={styles.menuButtonDesc}>Kho sản phẩm, đơn giá và mô tả chi tiết</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  banner: {
    width: '100%',
    height: 150,
    marginBottom: 20,
    borderRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  menuButton: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  revenueCard: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  revenueBadgeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },
  revenueOrdersCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  revenueAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
    marginVertical: 4,
  },
  revenueSubtext: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  btnOrders: {
    backgroundColor: '#7c3aed',
  },
  btnUser: {
    backgroundColor: '#0d6efd',
  },
  btnCategory: {
    backgroundColor: '#198754',
  },
  btnProduct: {
    backgroundColor: '#0dcaf0',
  },
  menuButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  menuButtonDesc: {
    fontSize: 12,
    color: '#f0f0f0',
    lineHeight: 16,
  },
  btnRefresh: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
  },
  btnRefreshText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
});
