import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Order } from '../../database/types';
import { fetchOrdersByUser, updateOrderStatus } from '../../database/projectDb';
import type { RootStackParamList } from '../AppNavigatorProduct';
import { useAuth } from './AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderHistory'>;

const statusDisplay: Record<
  Order['status'],
  { label: string; color: string; bgColor: string }
> = {
  PENDING: { label: 'Chờ xác nhận', color: '#b45309', bgColor: '#fef3c7' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#1d4ed8', bgColor: '#dbeafe' },
  SHIPPING: { label: 'Đang giao hàng', color: '#6d28d9', bgColor: '#ede9fe' },
  COMPLETED: { label: 'Đã giao', color: '#047857', bgColor: '#d1fae5' },
  CANCELLED: { label: 'Đã hủy', color: '#b91c1c', bgColor: '#fee2e2' },
};

export const OrderHistoryScreen = ({ route }: Props) => {
  const { currentUser } = useAuth();
  const effectiveUserId = route.params?.userId ?? currentUser?.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      const fetched = await fetchOrdersByUser(effectiveUserId);
      setOrders(fetched);
    } catch (error) {
      console.error('Không thể tải lịch sử mua hàng:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử mua hàng lúc này.');
    }
  }, [effectiveUserId]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  };

  // 4. ORDER CANCELLATION LOGIC (PENDING VS CONFIRMED)
  const handleCancelOrder = (order: Order) => {
    if (order.status !== 'PENDING') {
      Alert.alert(
        'Không thể hủy',
        'Đơn hàng này đã được xác nhận hoặc đang trong quá trình vận chuyển, không thể hủy.'
      );
      return;
    }

    Alert.alert(
      'Xác nhận hủy đơn hàng',
      `Bạn có chắc chắn muốn hủy đơn hàng #${order.id}? Thao tác này không thể hoàn tác.`,
      [
        { text: 'Giữ lại đơn', style: 'cancel' },
        {
          text: 'Hủy đơn hàng',
          style: 'destructive',
          onPress: async () => {
            setCancellingOrderId(order.id);
            try {
              const success = await updateOrderStatus(order.id, 'CANCELLED');
              if (!success) {
                Alert.alert('Lỗi', 'Không thể hủy đơn hàng. Vui lòng thử lại.');
                return;
              }
              Alert.alert('Đã hủy đơn hàng', `Đơn hàng #${order.id} đã được hủy thành công.`);
              await loadOrders();
            } catch (err) {
              console.error('Lỗi khi hủy đơn hàng:', err);
              Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi yêu cầu hủy đơn.');
            } finally {
              setCancellingOrderId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.headerInfo}>
        <Text style={styles.screenTitle}>Lịch sử mua hàng</Text>
        <Text style={styles.screenSubtitle}>
          {orders.length} đơn hàng đã đặt
        </Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptyText}>
            Các đơn hàng bạn đặt sẽ được lưu trữ và cập nhật trạng thái tại đây.
          </Text>
        </View>
      ) : (
        orders.map((order) => {
          const statusMeta = statusDisplay[order.status] || {
            label: order.status,
            color: '#475569',
            bgColor: '#f1f5f9',
          };
          const isPending = order.status === 'PENDING';
          const isCancelled = order.status === 'CANCELLED';
          const isLocked = !isPending && !isCancelled;

          return (
            <View key={order.id} style={styles.orderCard}>
              {/* Header: Mã đơn + Trạng thái */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderIdText}>Đơn hàng #{order.id}</Text>
                  <Text style={styles.orderDateText}>
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>

                <View style={[styles.statusPill, { backgroundColor: statusMeta.bgColor }]}>
                  <Text style={[styles.statusPillText, { color: statusMeta.color }]}>
                    {statusMeta.label}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Danh sách sản phẩm trong đơn */}
              <View style={styles.itemsSection}>
                {order.items?.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <Text style={styles.itemQtyPrice}>
                      {item.quantity} × {item.price.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                ))}
              </View>

              {/* Địa chỉ giao hàng & ghi chú */}
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>Địa chỉ:</Text>
                <Text style={styles.addressText}>
                  {order.customerName} ({order.customerPhone})
                </Text>
                <Text style={styles.addressSubText}>{order.customerAddress}</Text>
                {order.notes ? (
                  <Text style={styles.notesText}>Ghi chú: {order.notes}</Text>
                ) : null}
              </View>

              {/* Tổng tiền & Phương thức */}
              <View style={styles.pricingRow}>
                <Text style={styles.paymentMethodTag}>
                  💳 {order.paymentMethod || 'COD'}
                </Text>
                <View style={styles.totalCol}>
                  <Text style={styles.totalCaption}>Tổng thanh toán:</Text>
                  <Text style={styles.totalAmount}>
                    {order.totalAmount.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => setSelectedOrder(order)}
                accessibilityRole="button"
                accessibilityLabel={`Xem chi tiết đơn hàng ${order.id}`}
              >
                <Text style={styles.detailsButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>

              {/* 4. ORDER CANCELLATION LOGIC */}
              {isPending ? (
                // Nếu là "Pending": Hiển thị nút "Hủy đơn hàng" nổi bật
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    cancellingOrderId === order.id && styles.cancellingButton,
                  ]}
                  onPress={() => handleCancelOrder(order)}
                  disabled={cancellingOrderId === order.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Hủy đơn hàng ${order.id}`}
                >
                  <Text style={styles.cancelButtonText}>
                    {cancellingOrderId === order.id ? 'Đang xử lý...' : '🗑️ Hủy'}
                  </Text>
                </TouchableOpacity>
              ) : isLocked ? (
                // Nếu là "Confirmed", "Shipping" hoặc "Completed": Khóa/ẩn nút hủy, hiển thị thông báo chặn hủy
                <View style={styles.lockedNotice}>
                  <Text style={styles.lockedNoticeText}>
                    🔒 Đơn hàng đã được xác nhận/xử lý . Không thể hủy đơn.
                  </Text>
                </View>
              ) : (
                // Đã hủy
                <View style={styles.cancelledNotice}>
                  <Text style={styles.cancelledNoticeText}>
                    ❌ Đơn hàng này đã được hủy.
                  </Text>
                </View>
              )}
            </View>
          );
        })
      )}

      <Modal
        visible={selectedOrder !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedOrder(null)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            {selectedOrder ? (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                    <Text style={styles.modalSubtitle}>Mã đơn hàng #{selectedOrder.id}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setSelectedOrder(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Đóng chi tiết đơn hàng"
                  >
                    <Text style={styles.modalCloseText}>Đóng</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  contentContainerStyle={styles.detailsContent}
                  showsVerticalScrollIndicator={false}
                >
                  {(() => {
                    const selectedStatus = statusDisplay[selectedOrder.status] || {
                      label: selectedOrder.status,
                      color: '#475569',
                      bgColor: '#f1f5f9',
                    };
                    const subtotal =
                      selectedOrder.items?.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      ) ?? 0;
                    const discount = selectedOrder.discountAmount ?? 0;

                    return (
                      <>
                        <View style={styles.detailsStatusRow}>
                          <Text style={styles.detailsLabel}>Trạng thái</Text>
                          <View
                            style={[
                              styles.statusPill,
                              { backgroundColor: selectedStatus.bgColor },
                            ]}
                          >
                            <Text
                              style={[styles.statusPillText, { color: selectedStatus.color }]}
                            >
                              {selectedStatus.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.detailsSectionTitle}>Thông tin nhận hàng</Text>
                        <View style={styles.detailsSection}>
                          <DetailRow label="Người nhận" value={selectedOrder.customerName} />
                          <DetailRow label="Số điện thoại" value={selectedOrder.customerPhone} />
                          <DetailRow
                            label="Địa chỉ"
                            value={selectedOrder.customerAddress}
                          />
                          <DetailRow
                            label="Tài khoản"
                            value={selectedOrder.customerUsername || `ID ${selectedOrder.userId}`}
                          />
                          <DetailRow
                            label="Ngày đặt"
                            value={new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                          />
                          <DetailRow
                            label="Vận chuyển"
                            value={selectedOrder.shippingMethod || 'Standard Shipping'}
                          />
                          <DetailRow
                            label="Thanh toán"
                            value={selectedOrder.paymentMethod || 'COD'}
                          />
                          <DetailRow
                            label="Ghi chú"
                            value={selectedOrder.notes?.trim() || 'Không có ghi chú'}
                          />
                        </View>

                        <Text style={styles.detailsSectionTitle}>
                          Sản phẩm ({selectedOrder.items?.length ?? 0})
                        </Text>
                        <View style={styles.detailsSection}>
                          {selectedOrder.items?.length ? (
                            selectedOrder.items.map((item) => (
                              <View key={item.id} style={styles.detailsItem}>
                                <Text style={styles.detailsItemName}>{item.productName}</Text>
                                <Text style={styles.detailsItemMeta}>
                                  Mã SP: {item.productId} · {item.quantity} ×{' '}
                                  {item.price.toLocaleString('vi-VN')} đ
                                </Text>
                                <Text style={styles.detailsItemTotal}>
                                  {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.detailsEmptyText}>
                              Không có thông tin sản phẩm.
                            </Text>
                          )}
                        </View>

                        <Text style={styles.detailsSectionTitle}>Thanh toán</Text>
                        <View style={styles.detailsSection}>
                          <DetailRow
                            label="Tạm tính"
                            value={`${subtotal.toLocaleString('vi-VN')} đ`}
                          />
                          <DetailRow
                            label="Giảm giá"
                            value={`-${discount.toLocaleString('vi-VN')} đ`}
                          />
                          <View style={styles.detailsTotalRow}>
                            <Text style={styles.detailsTotalLabel}>Tổng thanh toán</Text>
                            <Text style={styles.detailsTotalValue}>
                              {selectedOrder.totalAmount.toLocaleString('vi-VN')} đ
                            </Text>
                          </View>
                        </View>
                      </>
                    );
                  })()}
                </ScrollView>
              </>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailsRow}>
    <Text style={styles.detailsLabel}>{label}</Text>
    <Text style={styles.detailsValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 14,
    paddingBottom: 32,
  },
  headerInfo: {
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  orderDateText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  itemsSection: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    marginRight: 8,
  },
  itemQtyPrice: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  addressBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  addressSubText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  notesText: {
    fontSize: 12,
    color: '#d97706',
    marginTop: 4,
    fontStyle: 'italic',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodTag: {
    fontSize: 12,
    color: '#475569',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  totalCol: {
    alignItems: 'flex-end',
  },
  totalCaption: {
    fontSize: 11,
    color: '#64748b',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#be123c',
  },
  detailsButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#c4b5fd',
    backgroundColor: '#f5f3ff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailsButtonText: {
    color: '#6d28d9',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  detailsModal: {
    maxHeight: '90%',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  modalCloseText: {
    fontSize: 14,
    color: '#6d28d9',
    fontWeight: '700',
  },
  detailsContent: {
    padding: 16,
    paddingBottom: 24,
  },
  detailsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detailsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 8,
  },
  detailsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  detailsLabel: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    marginRight: 12,
  },
  detailsValue: {
    flex: 1.5,
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'right',
  },
  detailsItem: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  detailsItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  detailsItemMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  detailsItemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'right',
    marginTop: 4,
  },
  detailsEmptyText: {
    fontSize: 12,
    color: '#64748b',
    paddingVertical: 10,
  },
  detailsTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailsTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  detailsTotalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#be123c',
  },
  cancelButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancellingButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
  lockedNotice: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  lockedNoticeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  cancelledNotice: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  cancelledNoticeText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
});

export default OrderHistoryScreen;
