import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { Order } from '../../database/types';
import { fetchAllOrders, updateOrderStatus } from '../../database/projectDb';

const orderStatuses: Order['status'][] = [
  'PENDING',
  'CONFIRMED',
  'SHIPPING',
  'COMPLETED',
  'CANCELLED',
];

const statusLabels: Record<Order['status'], string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

const AdminOrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await fetchAllOrders());
    } catch (error) {
      console.error('Không thể tải đơn hàng trong trang quản trị:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const refreshOrders = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  };

  const changeOrderStatus = (order: Order) => {
    Alert.alert(
      `Cập nhật đơn #${order.id}`,
      'Chọn trạng thái đơn hàng mới:',
      [
        ...orderStatuses.map((status) => ({
          text: statusLabels[status],
          onPress: async () => {
            const success = await updateOrderStatus(order.id, status);
            if (!success) {
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng.');
              return;
            }
            await loadOrders();
          },
        })),
        { text: 'Đóng', style: 'cancel' as const },
      ]
    );
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
          <Text style={styles.username}>
            Tài khoản: {item.customerUsername || `user #${item.userId}`}
          </Text>
        </View>
        <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>Sản phẩm đã đặt</Text>
      {item.items?.map((orderItem) => (
        <View key={orderItem.id} style={styles.productRow}>
          <Text style={styles.productName} numberOfLines={2}>
            {orderItem.productName}
          </Text>
          <Text style={styles.productQuantity}>× {orderItem.quantity}</Text>
          <Text style={styles.productPrice}>
            {(orderItem.price * orderItem.quantity).toLocaleString('vi-VN')} đ
          </Text>
        </View>
      ))}

      <Text style={styles.customerText}>Người nhận: {item.customerName}</Text>
      <Text style={styles.customerText}>Điện thoại: {item.customerPhone}</Text>
      <Text style={styles.customerText}>Địa chỉ: {item.customerAddress}</Text>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString('vi-VN')}
        </Text>
        <Text style={styles.total}>
          Tổng: {item.totalAmount.toLocaleString('vi-VN')} đ
        </Text>
      </View>

      <TouchableOpacity
        style={styles.statusButton}
        onPress={() => changeOrderStatus(item)}
        accessibilityRole="button"
        accessibilityLabel={`Cập nhật trạng thái đơn ${item.id}`}
      >
        <Text style={styles.statusButtonText}>Cập nhật trạng thái</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.heading}>
        <Text style={styles.title}>Quản lý hàng</Text>
        <Text style={styles.subtitle}>{orders.length} đơn hàng</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshOrders} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có đơn hàng nào được đặt.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  heading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 12, paddingBottom: 24, flexGrow: 1 },
  emptyText: { paddingVertical: 36, color: '#64748b', textAlign: 'center' },
  orderCard: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  orderId: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  username: { color: '#64748b', fontSize: 12, marginTop: 3 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  status_PENDING: { backgroundColor: '#d97706' },
  status_CONFIRMED: { backgroundColor: '#2563eb' },
  status_SHIPPING: { backgroundColor: '#7c3aed' },
  status_COMPLETED: { backgroundColor: '#059669' },
  status_CANCELLED: { backgroundColor: '#dc2626' },
  divider: { height: 1, marginVertical: 12, backgroundColor: '#e2e8f0' },
  sectionLabel: { color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3, gap: 5 },
  productName: { flex: 1, minWidth: 0, color: '#334155', fontSize: 12 },
  productQuantity: { color: '#64748b', fontSize: 12 },
  productPrice: { minWidth: 80, color: '#334155', fontSize: 12, textAlign: 'right' },
  customerText: { color: '#475569', fontSize: 12, marginTop: 5 },
  footer: { marginTop: 10, gap: 4 },
  date: { color: '#94a3b8', fontSize: 11 },
  total: { color: '#be123c', fontSize: 16, fontWeight: '800', textAlign: 'right' },
  statusButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#ede9fe',
    borderRadius: 10,
  },
  statusButtonText: { color: '#6d28d9', fontSize: 13, fontWeight: '700' },
});

export default AdminOrdersScreen;
