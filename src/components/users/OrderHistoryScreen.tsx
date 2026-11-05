import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Order } from '../../database/types';
import { fetchOrdersByUser } from '../../database/projectDb';
import type { RootStackParamList } from '../AppNavigatorProduct';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderHistory'>;

const OrderHistoryScreen = ({ route }: Props) => {
  const { userId } = route.params;
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrdersByUser(userId).then(setOrders).catch((error: unknown) => {
      console.error('Không thể tải lịch sử mua hàng:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử mua hàng.');
    });
  }, [userId]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
      ) : orders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>Đơn hàng #{order.id}</Text>
            <Text style={styles.status}>{order.status}</Text>
          </View>
          <Text style={styles.date}>{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
          {order.items?.map((item) => (
            <Text key={item.id} style={styles.itemText}>
              {item.productName} × {item.quantity}
            </Text>
          ))}
          <Text style={styles.address}>Giao đến: {order.customerAddress}</Text>
          <Text style={styles.total}>{order.totalAmount.toLocaleString('vi-VN')} đ</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 14, paddingBottom: 28 },
  emptyText: { paddingVertical: 28, textAlign: 'center', color: '#64748b' },
  orderCard: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  orderNumber: { color: '#0f172a', fontWeight: '700' },
  status: { color: '#6d28d9', fontWeight: '700' },
  date: { marginTop: 4, marginBottom: 8, color: '#64748b', fontSize: 12 },
  itemText: { marginTop: 3, color: '#334155' },
  address: { marginTop: 8, color: '#64748b', fontSize: 12 },
  total: { marginTop: 8, color: '#be123c', fontSize: 16, fontWeight: '700', textAlign: 'right' },
});

export default OrderHistoryScreen;
