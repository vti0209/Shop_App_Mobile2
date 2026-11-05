// src/components/admin/AdminHomeScreen.tsx
// CHỨC NĂNG 13 (PHIẾU CHẤM ĐIỂM): Trang chủ quản trị
// Gồm các nút chức năng: Quản lý user, Quản lý danh mục, Quản lý sản phẩm

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { initProjectDatabase, getDashboardStats } from '../../database/projectDb';
import type { AdminTabParamList } from './AdminTabNavigator';

const AdminHomeScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<AdminTabParamList>>();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalProducts: 0,
  });

  const loadStats = useCallback(async () => {
    const data = await getDashboardStats();
    setStats(data);
  }, []);

  useEffect(() => {
    initProjectDatabase(() => {
      loadStats();
    });
  }, [loadStats]);

  // Giao diện chính Trang chủ quản trị
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tiêu đề trang */}
        <Text style={styles.title}>Admin</Text>

        {/* Khung tóm tắt thống kê gọn gàng */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Tổng quan</Text>
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
          </View>
        </View>

        <Text style={styles.menuTitle}>Menu</Text>

        {/* Nút 1: Quản lý user */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnUser]}
          onPress={() => navigation.navigate('Users')}
        >
          <Text style={styles.menuButtonTitle}>Quản lý user ({stats.totalUsers})</Text>
        </TouchableOpacity>

        {/* Nút 2: Quản lý danh mục */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnCategory]}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.menuButtonTitle}>Quản lý danh mục ({stats.totalCategories})</Text>
        </TouchableOpacity>

        {/* Nút 3: Quản lý sản phẩm */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnProduct]}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.menuButtonTitle}>Quản lý sản phẩm ({stats.totalProducts})</Text>
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
    fontSize: 12,
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
