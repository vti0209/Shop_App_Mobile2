import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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

// 5 trạng thái cốt lõi theo đúng yêu cầu đề bài
export type CoreOrderStatus =
  | 'CHỜ XÁC NHẬN'
  | 'ĐÃ XÁC NHẬN'
  | 'ĐANG GIAO'
  | 'ĐÃ GIAO'
  | 'ĐÃ HỦY';

export const STATUS_LABELS: Record<Order['status'], CoreOrderStatus> = {
  PENDING: 'CHỜ XÁC NHẬN',
  CONFIRMED: 'ĐÃ XÁC NHẬN',
  SHIPPING: 'ĐANG GIAO',
  COMPLETED: 'ĐÃ GIAO',
  CANCELLED: 'ĐÃ HỦY',
};

export interface StatusMeta {
  status: Order['status'];
  label: CoreOrderStatus;
  stepIndex: number; // 0, 1, 2, 3 (-1 for cancelled)
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  actionText: string;
  description: string;
}

export const STATUS_CONFIG: Record<Order['status'], StatusMeta> = {
  PENDING: {
    status: 'PENDING',
    label: 'CHỜ XÁC NHẬN',
    stepIndex: 0,
    icon: '⏳',
    color: '#d97706',
    bgColor: '#fef3c7',
    borderColor: '#fde68a',
    actionText: 'Giữ ở Chờ xác nhận',
    description: 'Đơn mới tạo từ khách hàng, cần kiểm duyệt thông tin.',
  },
  CONFIRMED: {
    status: 'CONFIRMED',
    label: 'ĐÃ XÁC NHẬN',
    stepIndex: 1,
    icon: '📦',
    color: '#2563eb',
    bgColor: '#dbeafe',
    borderColor: '#bfdbfe',
    actionText: 'Chuyển sang: ĐÃ XÁC NHẬN',
    description: 'Xác nhận đơn hợp lệ và chuẩn bị đóng gói sản phẩm.',
  },
  SHIPPING: {
    status: 'SHIPPING',
    label: 'ĐANG GIAO',
    stepIndex: 2,
    icon: '🚚',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    borderColor: '#ddd6fe',
    actionText: 'Chuyển sang: ĐANG GIAO',
    description: 'Đã bàn giao kiện hàng cho đơn vị vận chuyển giao tận nơi.',
  },
  COMPLETED: {
    status: 'COMPLETED',
    label: 'ĐÃ GIAO',
    stepIndex: 3,
    icon: '✔️',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#a7f3d0',
    actionText: 'Chuyển sang: ĐÃ GIAO (Hoàn tất)',
    description: 'Khách hàng đã nhận hàng và hoàn tất đơn hàng thành công.',
  },
  CANCELLED: {
    status: 'CANCELLED',
    label: 'ĐÃ HỦY',
    stepIndex: -1,
    icon: '❌',
    color: '#dc2626',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
    actionText: 'Hủy đơn hàng: ĐÃ HỦY',
    description: 'Hủy đơn hàng này. Trạng thái sẽ bị đóng băng vĩnh viễn.',
  },
};

/**
 * QUY TẮC CHUYỂN TRẠNG THÁI MỘT CHIỀU (Strict One-Way State Workflow):
 * 1. Không cho phép đi lùi: Đang 'ĐÃ XÁC NHẬN' hoặc 'ĐANG GIAO' thì TUYỆT ĐỐI KHÔNG thể chọn lại 'CHỜ XÁC NHẬN'.
 * 2. Khi là 'ĐÃ HỦY' hoặc 'ĐÃ GIAO': Đóng băng hoàn toàn (freeze state), Admin không thể đổi nữa.
 * 3. Trả về danh sách lựa chọn ĐỘNG tùy theo trạng thái hiện tại của đơn hàng.
 */
export const getDynamicAllowedStatuses = (currentStatus: Order['status']): StatusMeta[] => {
  switch (currentStatus) {
    case 'PENDING':
      // Từ 'CHỜ XÁC NHẬN': Có thể tiến tới 'ĐÃ XÁC NHẬN' hoặc hủy sang 'ĐÃ HỦY'
      return [STATUS_CONFIG.CONFIRMED, STATUS_CONFIG.CANCELLED];

    case 'CONFIRMED':
      // Từ 'ĐÃ XÁC NHẬN': Có thể tiến tới 'ĐANG GIAO' hoặc hủy sang 'ĐÃ HỦY'.
      // QUY TẮC 1: Hoàn toàn ẩn/chặn lựa chọn 'CHỜ XÁC NHẬN'.
      return [STATUS_CONFIG.SHIPPING, STATUS_CONFIG.CANCELLED];

    case 'SHIPPING':
      // Từ 'ĐANG GIAO': Có thể tiến tới 'ĐÃ GIAO' hoặc hủy sang 'ĐÃ HỦY' (giao thất bại/hoàn hàng).
      // QUY TẮC 1: Hoàn toàn ẩn/chặn lựa chọn 'CHỜ XÁC NHẬN' và 'ĐÃ XÁC NHẬN'.
      return [STATUS_CONFIG.COMPLETED, STATUS_CONFIG.CANCELLED];

    case 'COMPLETED':
      // 'ĐÃ GIAO': Trạng thái hoàn tất cuối cùng -> Đóng băng, không còn lựa chọn chuyển đổi.
      return [];

    case 'CANCELLED':
      // QUY TẮC 2: Một khi đã là 'ĐÃ HỦY' -> Đóng băng hoàn toàn, Admin không thể sửa nữa.
      return [];

    default:
      return [];
  }
};

const AdminOrdersScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | Order['status']>('ALL');

  // State cho Modal UI cập nhật trạng thái động
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const fetched = await fetchAllOrders();
      setOrders(fetched);
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

  // Lọc danh sách đơn hàng theo tab trạng thái
  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'ALL') return orders;
    return orders.filter((o) => o.status === selectedFilter);
  }, [orders, selectedFilter]);

  // Các lựa chọn động cho đơn hàng đang mở trong Modal
  const dynamicChoices = useMemo(() => {
    if (!selectedOrder) return [];
    return getDynamicAllowedStatuses(selectedOrder.status);
  }, [selectedOrder]);

  const handleOpenStatusModal = (order: Order) => {
    // Nếu đơn đã ĐÃ HỦY hoặc ĐÃ GIAO -> Đóng băng, không mở modal chỉnh sửa
    if (order.status === 'CANCELLED') {
      Alert.alert(
        'Trạng thái đã khóa',
        'Đơn hàng này đang ở trạng thái [ĐÃ HỦY] và đã bị đóng băng. Không thể thay đổi trạng thái nữa.'
      );
      return;
    }
    if (order.status === 'COMPLETED') {
      Alert.alert(
        'Đơn hàng đã hoàn tất',
        'Đơn hàng này đã ở trạng thái [ĐÃ GIAO]. Quy trình một chiều đã hoàn tất, không thể thay đổi nữa.'
      );
      return;
    }

    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    if (isUpdating) return;
    setSelectedOrder(null);
  };

  // Thực hiện chuyển đổi trạng thái đơn hàng
  const handleExecuteStatusUpdate = async (newStatus: Order['status']) => {
    if (!selectedOrder) return;

    const targetMeta = STATUS_CONFIG[newStatus];

    // Cảnh báo xác nhận đặc biệt khi chuyển sang ĐÃ HỦY
    if (newStatus === 'CANCELLED') {
      Alert.alert(
        'Xác nhận hủy đơn hàng',
        `Bạn có chắc chắn muốn chuyển đơn hàng #${selectedOrder.id} sang [ĐÃ HỦY]?\n\nLưu ý: Sau khi hủy, trạng thái sẽ bị đóng băng vĩnh viễn và không thể khôi phục lại.`,
        [
          { text: 'Hủy thao tác', style: 'cancel' },
          {
            text: 'Xác nhận hủy đơn',
            style: 'destructive',
            onPress: () => processStatusUpdate(selectedOrder.id, newStatus),
          },
        ]
      );
      return;
    }

    // Xác nhận cho các trạng thái tiến tới
    Alert.alert(
      'Xác nhận cập nhật',
      `Chuyển trạng thái đơn #${selectedOrder.id} sang [${targetMeta.label}]? Thao tác này là quy trình một chiều và không thể quay lại trạng thái trước.`,
      [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: () => processStatusUpdate(selectedOrder.id, newStatus),
        },
      ]
    );
  };

  const processStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
    setIsUpdating(true);
    try {
      const success = await updateOrderStatus(orderId, newStatus);
      if (!success) {
        Alert.alert(
          'Lỗi cập nhật',
          'Không thể cập nhật trạng thái đơn hàng. Vui lòng kiểm tra lại quy tắc chuyển trạng thái.'
        );
        return;
      }

      Alert.alert('Thành công', `Đơn hàng #${orderId} đã được chuyển sang [${STATUS_CONFIG[newStatus].label}].`);
      setSelectedOrder(null);
      await loadOrders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra.';
      Alert.alert('Không thể chuyển trạng thái', message);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const meta = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const isCancelled = item.status === 'CANCELLED';
    const isCompleted = item.status === 'COMPLETED';
    const isFrozen = isCancelled || isCompleted;

    return (
      <View style={styles.orderCard}>
        {/* Header card: Mã đơn + Huy hiệu trạng thái */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdGroup}>
            <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
            <Text style={styles.username}>
              Tài khoản: {item.customerUsername || `User #${item.userId}`}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: meta.bgColor, borderColor: meta.borderColor },
            ]}
          >
            <Text style={[styles.statusText, { color: meta.color }]}>
              {meta.icon} {meta.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Danh sách sản phẩm */}
        <Text style={styles.sectionLabel}>Sản phẩm đã đặt ({item.items?.length || 0})</Text>
        {item.items?.map((orderItem) => (
          <View key={orderItem.id} style={styles.productRow}>
            <Text style={styles.productName} numberOfLines={2}>
              • {orderItem.productName}
            </Text>
            <Text style={styles.productQuantity}>× {orderItem.quantity}</Text>
            <Text style={styles.productPrice}>
              {(orderItem.price * orderItem.quantity).toLocaleString('vi-VN')} đ
            </Text>
          </View>
        ))}

        {/* Thông tin người nhận */}
        <View style={styles.customerBox}>
          <Text style={styles.customerText}>👤 Người nhận: <Text style={styles.boldText}>{item.customerName}</Text></Text>
          <Text style={styles.customerText}>📞 Số điện thoại: <Text style={styles.boldText}>{item.customerPhone}</Text></Text>
          <Text style={styles.customerText}>📍 Địa chỉ: {item.customerAddress}</Text>
          {item.notes ? (
            <Text style={styles.notesText}>📝 Ghi chú: {item.notes}</Text>
          ) : null}
        </View>

        {/* Ngày tạo + Tổng tiền */}
        <View style={styles.footerRow}>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.total}>
            Tổng: {item.totalAmount.toLocaleString('vi-VN')} đ
          </Text>
        </View>

        {/* Nút hành động trạng thái */}
        {isCancelled ? (
          // Quy tắc 2: Đã HỦY -> Đóng băng hoàn toàn, disable nút
          <View style={styles.frozenActionBox}>
            <Text style={styles.frozenActionText}>🔒 ĐÃ HỦY</Text>
          </View>
        ) : isCompleted ? (
          // Đã GIAO -> Đã hoàn tất, disable nút
          <View style={[styles.frozenActionBox, styles.completedActionBox]}>
            <Text style={styles.completedActionText}>Đơn hàng đã hoàn tất</Text>
          </View>
        ) : (
          // Có thể cập nhật -> Mở Modal UI chọn trạng thái động
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => handleOpenStatusModal(item)}
            accessibilityRole="button"
            accessibilityLabel={`Cập nhật trạng thái cho đơn hàng ${item.id}`}
          >
            <Text style={styles.statusButtonText}>⚡ Cập nhật trạng thái đơn hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Tiêu đề trang quản lý */}
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Quản lý đơn hàng</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}> Tổng số đơn hàng: {orders.length} đơn</Text>
          </View>
        </View>
      </View>

      {/* Thanh bộ lọc theo trạng thái */}
      <View style={styles.filterScroll}>
        {(['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'] as const).map(
          (filterKey) => {
            const isSelected = selectedFilter === filterKey;
            const label = filterKey === 'ALL' ? 'Tất cả' : STATUS_CONFIG[filterKey].label;
            return (
              <TouchableOpacity
                key={filterKey}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filterKey)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </View>

      {/* Danh sách đơn hàng */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshOrders} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào.</Text>
          </View>
        }
      />

      {/* ================= MODAL UI CẬP NHẬT TRẠNG THÁI ĐỘNG (RULE 3) ================= */}
      <Modal
        visible={Boolean(selectedOrder)}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={handleCloseModal}
          />

          {selectedOrder && (
            <View style={styles.modalSheet}>
              {/* Header Modal */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleGroup}>
                  <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>
                  <Text style={styles.modalSubtitle}>Đơn hàng #{selectedOrder.id}</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={handleCloseModal}
                  disabled={isUpdating}
                  accessibilityRole="button"
                  accessibilityLabel="Đóng modal"
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Thông tin đơn hàng tóm tắt */}
              <View style={styles.modalOrderBrief}>
                <Text style={styles.modalBriefCustomer}>
                  Khách hàng: <Text style={styles.boldText}>{selectedOrder.customerName}</Text> ({selectedOrder.customerPhone})
                </Text>
                <Text style={styles.modalBriefTotal}>
                  Tổng tiền: {selectedOrder.totalAmount.toLocaleString('vi-VN')} đ
                </Text>
              </View>

              {/* Trạng thái hiện tại */}
              <View style={styles.currentStatusSection}>
                <Text style={styles.currentStatusLabel}>Trạng thái hiện tại:</Text>
                <View
                  style={[
                    styles.currentStatusPill,
                    {
                      backgroundColor: STATUS_CONFIG[selectedOrder.status].bgColor,
                      borderColor: STATUS_CONFIG[selectedOrder.status].borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.currentStatusText,
                      { color: STATUS_CONFIG[selectedOrder.status].color },
                    ]}
                  >
                    {STATUS_CONFIG[selectedOrder.status].icon}{' '}
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </Text>
                </View>
              </View>

              {/* Visual 1-Way Stepper Workflow */}
              <View style={styles.workflowStepper}>
                <Text style={styles.workflowTitle}>Tiến trình một chiều (One-Way):</Text>
                <View style={styles.stepperRow}>
                  {(['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'] as const).map(
                    (stKey, index) => {
                      const curIndex = STATUS_CONFIG[selectedOrder.status].stepIndex;
                      const isPast = curIndex > index;
                      const isCurrent = curIndex === index;
                      const isCancelled = selectedOrder.status === 'CANCELLED';

                      return (
                        <React.Fragment key={stKey}>
                          <View
                            style={[
                              styles.stepNode,
                              isCurrent && styles.stepNodeActive,
                              isPast && styles.stepNodePast,
                              isCancelled && styles.stepNodeCancelled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.stepNodeText,
                                (isCurrent || isPast) && styles.stepNodeTextActive,
                              ]}
                            >
                              {index + 1}
                            </Text>
                          </View>
                          {index < 3 && (
                            <View
                              style={[
                                styles.stepLine,
                                isPast && styles.stepLineActive,
                              ]}
                            />
                          )}
                        </React.Fragment>
                      );
                    }
                  )}
                </View>
                <View style={styles.stepLabelsRow}>
                  <Text style={styles.stepLabelItem}>Chờ xác nhận</Text>
                  <Text style={styles.stepLabelItem}>Đã xác nhận</Text>
                  <Text style={styles.stepLabelItem}>Đang giao</Text>
                  <Text style={styles.stepLabelItem}>Đã giao</Text>
                </View>
              </View>

              {/* Danh sách lựa chọn ĐỘNG dựa trên trạng thái hiện tại (Rule 1, 2, 3) */}
              <View style={styles.choicesSection}>
                <Text style={styles.choicesHeading}>
                  Lựa chọn khả dụng tiếp theo ({dynamicChoices.length}):
                </Text>

                {dynamicChoices.length === 0 ? (
                  <View style={styles.frozenContainer}>
                    <Text style={styles.frozenEmoji}>🔒</Text>
                    <Text style={styles.frozenTitle}>Trạng thái đã đóng băng</Text>
                    <Text style={styles.frozenDesc}>
                      Đơn hàng đã ở trạng thái cuối cùng ([{STATUS_CONFIG[selectedOrder.status].label}]). Theo quy trình một chiều, trạng thái này không thể thay đổi tiếp.
                    </Text>
                  </View>
                ) : (
                  dynamicChoices.map((choice) => (
                    <TouchableOpacity
                      key={choice.status}
                      style={[
                        styles.choiceCard,
                        { borderColor: choice.borderColor, backgroundColor: choice.bgColor },
                      ]}
                      onPress={() => handleExecuteStatusUpdate(choice.status)}
                      disabled={isUpdating}
                      accessibilityRole="button"
                      accessibilityLabel={choice.actionText}
                    >
                      <View style={styles.choiceHeaderRow}>
                        <View style={styles.choiceIconCircle}>
                          <Text style={styles.choiceIconEmoji}>{choice.icon}</Text>
                        </View>
                        <View style={styles.choiceTextCol}>
                          <Text style={[styles.choiceLabel, { color: choice.color }]}>
                            {choice.actionText}
                          </Text>
                          <Text style={styles.choiceDescription}>
                            {choice.description}
                          </Text>
                        </View>
                        <Text style={[styles.choiceArrow, { color: choice.color }]}>➔</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Loading indicator */}
              {isUpdating && (
                <View style={styles.updatingOverlay}>
                  <ActivityIndicator size="small" color="#6d28d9" />
                  <Text style={styles.updatingText}>Đang cập nhật trạng thái...</Text>
                </View>
              )}

              {/* Nút đóng modal */}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCloseModal}
                disabled={isUpdating}
                accessibilityRole="button"
              >
                <Text style={styles.modalCancelButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: { color: '#0f172a', fontSize: 12, fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 10, marginTop: 2 },
  countBadge: {
    marginTop: 4,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  countBadgeText: { color: '#6d28d9', fontSize: 10, fontWeight: '700' },

  filterScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#6d28d9',
    borderColor: '#6d28d9',
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  list: { padding: 12, paddingBottom: 24, flexGrow: 1 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyEmoji: { fontSize: 44, marginBottom: 8 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center' },

  orderCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  orderIdGroup: { flex: 1 },
  orderId: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  username: { color: '#64748b', fontSize: 12, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '800' },

  divider: { height: 1, marginVertical: 10, backgroundColor: '#f1f5f9' },
  sectionLabel: { color: '#334155', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2, gap: 6 },
  productName: { flex: 1, minWidth: 0, color: '#334155', fontSize: 12 },
  productQuantity: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  productPrice: { minWidth: 80, color: '#334155', fontSize: 12, textAlign: 'right', fontWeight: '600' },

  customerBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  customerText: { color: '#475569', fontSize: 12, marginVertical: 1 },
  boldText: { fontWeight: '700', color: '#1e293b' },
  notesText: { color: '#d97706', fontSize: 12, marginTop: 2, fontStyle: 'italic' },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  date: { color: '#94a3b8', fontSize: 11 },
  total: { color: '#be123c', fontSize: 16, fontWeight: '800' },

  statusButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: '#ede9fe',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  statusButtonText: { color: '#6d28d9', fontSize: 13, fontWeight: '700' },

  frozenActionBox: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  frozenActionText: { color: '#dc2626', fontSize: 12, fontWeight: '700' },

  completedActionBox: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  completedActionText: { color: '#15803d', fontSize: 12, fontWeight: '700' },

  // ================= STYLES CHO MODAL =================
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  modalBackdropDismiss: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderTitleGroup: { flex: 1 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginTop: 1 },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { fontSize: 15, color: '#64748b', fontWeight: '700' },

  modalOrderBrief: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  modalBriefCustomer: { fontSize: 12, color: '#334155' },
  modalBriefTotal: { fontSize: 13, color: '#be123c', fontWeight: '700', marginTop: 3 },

  currentStatusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  currentStatusLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  currentStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  currentStatusText: { fontSize: 12, fontWeight: '800' },

  // Stepper Visual
  workflowStepper: {
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#fbfbfe',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  workflowTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 8 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  stepNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNodeActive: {
    backgroundColor: '#6d28d9',
    transform: [{ scale: 1.15 }],
  },
  stepNodePast: {
    backgroundColor: '#059669',
  },
  stepNodeCancelled: {
    backgroundColor: '#dc2626',
  },
  stepNodeText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  stepNodeTextActive: { color: '#ffffff' },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#059669',
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  stepLabelItem: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
    width: 60,
  },

  // Choices section
  choicesSection: {
    marginTop: 6,
    marginBottom: 10,
  },
  choicesHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  choiceCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  choiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    elevation: 1,
  },
  choiceIconEmoji: { fontSize: 18 },
  choiceTextCol: { flex: 1 },
  choiceLabel: { fontSize: 14, fontWeight: '800' },
  choiceDescription: { fontSize: 11, color: '#64748b', marginTop: 2 },
  choiceArrow: { fontSize: 16, fontWeight: '800', marginLeft: 8 },

  frozenContainer: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  frozenEmoji: { fontSize: 28, marginBottom: 4 },
  frozenTitle: { fontSize: 14, fontWeight: '700', color: '#334155' },
  frozenDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },

  updatingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  updatingText: { fontSize: 12, color: '#6d28d9', fontWeight: '600' },

  modalCancelButton: {
    minHeight: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});

export default AdminOrdersScreen;
