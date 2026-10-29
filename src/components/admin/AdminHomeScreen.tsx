// src/components/admin/AdminHomeScreen.tsx
// CHỨC NĂNG 13 (PHIẾU CHẤM ĐIỂM): Trang chủ quản trị
// Gồm các nút chức năng: Quản lý user, Quản lý loại sản phẩm, Quản lý sản phẩm

import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { initProjectDatabase, getDashboardStats } from '../../database/projectDb';
import AdminUserScreen from './AdminUserScreen';
import AdminCategoryScreen from './AdminCategoryScreen';
import AdminProductScreen from './AdminProductScreen';

export type AdminViewType = 'HOME' | 'USERS' | 'CATEGORIES' | 'PRODUCTS';

interface AdminHomeScreenProps {
  navigation?: any;
}

const AdminHomeScreen: React.FC<AdminHomeScreenProps> = ({ navigation }) => {
  const [activeView, setActiveView] = useState<AdminViewType>('HOME');
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

  const handleNavigate = (view: AdminViewType, screenName?: string) => {
    if (navigation && typeof navigation.navigate === 'function' && screenName) {
      navigation.navigate(screenName);
    } else {
      setActiveView(view);
    }
  };

  const handleBack = () => {
    setActiveView('HOME');
    loadStats();
  };

  // Điều hướng màn hình con
  if (activeView === 'USERS') {
    return <AdminUserScreen onBack={handleBack} />;
  }

  if (activeView === 'CATEGORIES') {
    return <AdminCategoryScreen onBack={handleBack} />;
  }

  if (activeView === 'PRODUCTS') {
    return <AdminProductScreen onBack={handleBack} />;
  }

  // Giao diện chính Trang chủ quản trị
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Tiêu đề trang */}
        <Text style={styles.title}>TRANG CHỦ QUẢN TRỊ</Text>
        <Text style={styles.subtitle}>Tài khoản: admin (Quản trị viên)</Text>

        {/* Khung tóm tắt thống kê gọn gàng */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Tổng quan hệ thống</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalCategories}</Text>
              <Text style={styles.statLabel}>Loại sản phẩm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Sản phẩm</Text>
            </View>
          </View>
        </View>

        {/* CÁC NÚT CHỨC NĂNG CHÍNH THEO ĐÚNG PHIẾU CHẤM */}
        <Text style={styles.menuTitle}>Chức năng quản trị</Text>

        {/* Nút 1: Quản lý user */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnUser]}
          onPress={() => handleNavigate('USERS', 'AdminUserScreen')}
        >
          <Text style={styles.menuButtonTitle}>Quản lý user</Text>
          <Text style={styles.menuButtonDesc}>
            Xem danh sách, phân quyền và quản lý tài khoản người dùng ({stats.totalUsers})
          </Text>
        </TouchableOpacity>

        {/* Nút 2: Quản lý loại sản phẩm */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnCategory]}
          onPress={() => handleNavigate('CATEGORIES', 'AdminCategoryScreen')}
        >
          <Text style={styles.menuButtonTitle}>Quản lý loại sản phẩm</Text>
          <Text style={styles.menuButtonDesc}>
            Xem, thêm mới, chỉnh sửa và xóa danh mục sản phẩm ({stats.totalCategories})
          </Text>
        </TouchableOpacity>

        {/* Nút 3: Quản lý sản phẩm */}
        <TouchableOpacity
          style={[styles.menuButton, styles.btnProduct]}
          onPress={() => handleNavigate('PRODUCTS', 'AdminProductScreen')}
        >
          <Text style={styles.menuButtonTitle}>Quản lý sản phẩm</Text>
          <Text style={styles.menuButtonDesc}>
            Xem danh sách kho, thêm mới, sửa giá và xóa sản phẩm ({stats.totalProducts})
          </Text>
        </TouchableOpacity>

        {/* Nút làm mới dữ liệu */}
        <TouchableOpacity style={styles.btnRefresh} onPress={loadStats}>
          <Text style={styles.btnRefreshText}>Làm mới dữ liệu</Text>
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
    justifyContent: 'space-around',
  },
  statItem: {
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
