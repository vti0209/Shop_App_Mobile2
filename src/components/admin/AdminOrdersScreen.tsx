import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  const [activeSection, setActiveSection] = useState<'ORDERS' | 'REVENUE'>('ORDERS');

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

  // 1. CHỈ CÁC ĐƠN ĐÃ GIAO (COMPLETED) MỚI ĐƯỢC CỘNG VÀO DOANH THU THỰC TẾ
  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'COMPLETED');
  }, [orders]);

  const totalCompletedRevenue = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [completedOrders]);

  // 2. CÁC ĐƠN ĐANG TRONG QUÁ TRÌNH (PENDING, CONFIRMED, SHIPPING) - CHƯA GIAO NÊN CHƯA CỘNG VÀO SỐ DƯ
  const inProgressOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'SHIPPING'
    );
  }, [orders]);

  const inProgressRevenue = useMemo(() => {
    return inProgressOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [inProgressOrders]);

  // 3. CÁC ĐƠN ĐÃ HỦY (CANCELLED) - KHÔNG ĐƯỢC TÍNH VÀO DOANH THU
  const cancelledOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'CANCELLED');
  }, [orders]);

  const cancelledRevenue = useMemo(() => {
    return cancelledOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [cancelledOrders]);

  // Phân loại doanh thu thực tế theo phương thức thanh toán
  const revenueByMethod = useMemo(() => {
    const result: Record<string, number> = {
      COD: 0,
      'Chuyển khoản ngân hàng': 0,
      'Ví điện tử': 0,
    };
    completedOrders.forEach((order) => {
      const method = order.paymentMethod || 'COD';
      if (method.includes('ngân hàng') || method.includes('Ngân hàng')) {
        result['Chuyển khoản ngân hàng'] += order.totalAmount || 0;
      } else if (method.includes('ví') || method.includes('Ví')) {
        result['Ví điện tử'] += order.totalAmount || 0;
      } else {
        result['COD'] += order.totalAmount || 0;
      }
    });
    return result;
  }, [completedOrders]);

  // Trích xuất mã thanh toán nếu có trong ghi chú
  const extractPaymentCode = (notes?: string) => {
    if (!notes) return null;
    const match = notes.match(/\[Mã TT:\s*([^\]]+)\]/);
    return match ? match[1].trim() : null;
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
        `Bạn có chắc chắn muốn chuyển đơn hàng #${selectedOrder.id} sang [ĐÃ HỦY]?\n\nLưu ý: Sau khi hủy, đơn hàng này sẽ không được tính vào Doanh thu cửa hàng và trạng thái bị đóng băng vĩnh viễn.`,
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

    // Cảnh báo xác nhận khi hoàn tất giao hàng (cộng doanh thu)
    if (newStatus === 'COMPLETED') {
      Alert.alert(
        'Xác nhận hoàn tất giao hàng',
        `Chuyển đơn hàng #${selectedOrder.id} sang [ĐÃ GIAO]?\n\nSau khi hoàn tất, số tiền ${(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} đ sẽ được chính thức cộng vào Doanh thu thực tế.`,
        [
          { text: 'Đóng', style: 'cancel' },
          {
            text: 'Xác nhận Đã Giao',
            onPress: () => processStatusUpdate(selectedOrder.id, newStatus),
          },
        ]
      );
      return;
    }

    // Xác nhận cho các trạng thái tiến tới khác
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

      if (newStatus === 'COMPLETED') {
        Alert.alert(
          '🎉 Giao hàng thành công!',
          `Đơn hàng #${orderId} đã được chuyển sang [ĐÃ GIAO].\nSố tiền ${(selectedOrder?.totalAmount || 0).toLocaleString('vi-VN')} đ đã được cộng vào Doanh thu thực tế của cửa hàng.`
        );
      } else if (newStatus === 'CANCELLED') {
        Alert.alert(
          'Đã hủy đơn hàng',
          `Đơn hàng #${orderId} đã được chuyển sang [ĐÃ HỦY]. Đơn hàng này không được ghi nhận vào doanh thu.`
        );
      } else {
        Alert.alert(
          'Thành công',
          `Đơn hàng #${orderId} đã được chuyển sang [${STATUS_CONFIG[newStatus].label}].`
        );
      }

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
    const paymentCode = extractPaymentCode(item.notes);

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

        {/* Thanh phương thức thanh toán + Mã TT + Trạng thái doanh thu */}
        <View style={styles.paymentMethodRow}>
          <View style={styles.paymentMethodPill}>
            <Text style={styles.paymentMethodPillText}>
              💳 {item.paymentMethod || 'COD'}
            </Text>
          </View>
          {paymentCode && (
            <View style={styles.paymentCodePill}>
              <Text style={styles.paymentCodePillText}>Mã TT: {paymentCode}</Text>
            </View>
          )}
          <View
            style={[
              styles.revenueStatusTag,
              isCompleted
                ? styles.revenueTagCompleted
                : isCancelled
                ? styles.revenueTagCancelled
                : styles.revenueTagPending,
            ]}
          >
            <Text
              style={[
                styles.revenueStatusTagText,
                isCompleted
                  ? styles.revenueTagCompletedText
                  : isCancelled
                  ? styles.revenueTagCancelledText
                  : styles.revenueTagPendingText,
              ]}
            >
              {isCompleted
                ? '✓ Đã tính doanh thu'
                : isCancelled
                ? '✕ Không tính doanh thu'
                : ' Chưa giao (Chưa tính)'}
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
          <View style={styles.totalBlock}>
            <Text style={styles.totalCaption}>Tổng tiền đơn:</Text>
            <Text style={styles.total}>
              {item.totalAmount.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>

        {/* Nút hành động trạng thái */}
        {isCancelled ? (
          <View style={styles.frozenActionBox}>
            <Text style={styles.frozenActionText}>🔒 ĐÃ HỦY (Đã đóng băng)</Text>
          </View>
        ) : isCompleted ? (
          <View style={[styles.frozenActionBox, styles.completedActionBox]}>
            <Text style={styles.completedActionText}> ĐÃ GIAO (Đã cộng vào doanh thu)</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => handleOpenStatusModal(item)}
            accessibilityRole="button"
            accessibilityLabel={`Cập nhật trạng thái cho đơn hàng ${item.id}`}
          >
            <Text style={styles.statusButtonText}> Cập nhật trạng thái đơn hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Tiêu đề trang quản lý */}
      <View style={styles.heading}>
        <View style={styles.headingTitleGroup}>
          <Text style={styles.title}>ĐƠN HÀNG & DOANH THU</Text>
          <Text style={styles.subtitle}>
            {orders.length} đơn · Doanh thu: {totalCompletedRevenue.toLocaleString('vi-VN')} đ
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshIconButton}
          onPress={refreshOrders}
          accessibilityLabel="Làm mới danh sách"
        >
          <Text style={styles.refreshIconText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Tab chuyển đổi: [📦 Quản lý đơn hàng] | [💰 Quản lý doanh thu] */}
      <View style={styles.segmentBar}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSection === 'ORDERS' && styles.segmentBtnActive]}
          onPress={() => setActiveSection('ORDERS')}
        >
          <Text
            style={[
              styles.segmentBtnText,
              activeSection === 'ORDERS' && styles.segmentBtnTextActive,
            ]}
          >
            📦 Đơn hàng ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeSection === 'REVENUE' && styles.segmentBtnActive]}
          onPress={() => setActiveSection('REVENUE')}
        >
          <Text
            style={[
              styles.segmentBtnText,
              activeSection === 'REVENUE' && styles.segmentBtnTextActive,
            ]}
          >
            💰 Doanh thu
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= NỘI DUNG SECTION 1: QUẢN LÝ ĐƠN HÀNG ================= */}
      {activeSection === 'ORDERS' ? (
        <>
          {/* Thanh tóm tắt nhanh doanh thu */}
          <View style={styles.revenueNoticeBar}>
            <Text style={styles.revenueNoticeBarText}>
              Doanh thu: <Text style={styles.boldText}>{totalCompletedRevenue.toLocaleString('vi-VN')} đ</Text> ({completedOrders.length} đơn hoàn tất)
            </Text>
          </View>

          {/* Thanh bộ lọc theo trạng thái */}
          <View style={styles.filterScroll}>
            {(['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'] as const).map(
              (filterKey) => {
                const isSelected = selectedFilter === filterKey;
                const label = filterKey === 'ALL' ? 'Tất cả' : STATUS_CONFIG[filterKey].label;
                const count =
                  filterKey === 'ALL'
                    ? orders.length
                    : orders.filter((o) => o.status === filterKey).length;
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
                      {label} ({count})
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
                <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào trong mục này.</Text>
              </View>
            }
          />
        </>
      ) : (
        /* ================= NỘI DUNG SECTION 2: QUẢN LÝ DOANH THU ================= */
        <ScrollView
          style={styles.revenueScroll}
          contentContainerStyle={styles.revenueContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refreshOrders} />
          }
        >
          {/* Thông báo nguyên tắc cộng doanh thu */}
          <View style={styles.revenueRuleNotice}>
            <Text style={styles.revenueRuleNoticeTitle}>Nguyên tắc tính doanh thu:</Text>
            <Text style={styles.revenueRuleNoticeText}>
              Chỉ các đơn hàng được giao thành công mới được cộng tiền vào số dư doanh thu thực tế. Các đơn đang xử lý hoặc bị hủy bị bỏ qua.
            </Text>
          </View>

          {/* Thẻ Hero: Tổng doanh thu thực tế */}
          <View style={styles.revenueHeroCard}>
            <View style={styles.revenueHeroHeader}>
              <Text style={styles.revenueHeroLabel}>Doanh thu thực tế</Text> 
              <View style={styles.revenueHeroBadge}>
                <Text style={styles.revenueHeroBadgeText}>Đã quyết toán</Text>
              </View>
            </View>
            <Text style={styles.revenueHeroAmount}>
              {totalCompletedRevenue.toLocaleString('vi-VN')} đ
            </Text>
            <Text style={styles.revenueHeroSub}>
              Đã ghi nhận từ {completedOrders.length} đơn hàng giao thành công
            </Text>
          </View>

          {/* 2 Thẻ phụ: Doanh thu chờ giao & Đơn hủy */}
          <View style={styles.revenueSubRow}>
            <View style={[styles.revenueSubCard, styles.revenuePendingCard]}>
              <Text style={styles.revenueSubLabel}>DT tạm tính</Text>
              <Text style={styles.revenuePendingAmount}>
                {inProgressRevenue.toLocaleString('vi-VN')} đ
              </Text>
              <Text style={styles.revenueSubDesc}>
                {inProgressOrders.length} đơn chưa giao (chưa cộng số dư)
              </Text>
            </View>

            <View style={[styles.revenueSubCard, styles.revenueCancelledCard]}>
              <Text style={styles.revenueSubLabel}>Đơn hàng bị hủy</Text>
              <Text style={styles.revenueCancelledAmount}>
                {cancelledRevenue.toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </View>

          {/* Phân loại theo phương thức thanh toán của đơn thành công */}
          <View style={styles.paymentMethodBreakdownCard}>
            <Text style={styles.breakdownSectionTitle}>
              Doanh thu theo phương thức thanh toán
            </Text>

            <View style={styles.methodStatLine}>
              <View style={styles.methodIconNameRow}>
                <Text style={styles.methodEmoji}>💵</Text>
                <Text style={styles.methodName}>COD</Text>
              </View>
              <Text style={styles.methodAmount}>
                {revenueByMethod['COD'].toLocaleString('vi-VN')} đ
              </Text>
            </View>

            <View style={styles.methodStatLine}>
              <View style={styles.methodIconNameRow}>
                <Text style={styles.methodEmoji}>🏦</Text>
                <Text style={styles.methodName}>Chuyển khoản</Text>
              </View>
              <Text style={styles.methodAmount}>
                {revenueByMethod['Chuyển khoản ngân hàng'].toLocaleString('vi-VN')} đ
              </Text>
            </View>

            <View style={styles.methodStatLine}>
              <View style={styles.methodIconNameRow}>
                <Text style={styles.methodEmoji}>📱</Text>
                <Text style={styles.methodName}>Ví điện tử</Text>
              </View>
              <Text style={styles.methodAmount}>
                {revenueByMethod['Ví điện tử'].toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </View>

          {/* Danh sách các đơn hàng đã giao thành công được cộng vào doanh thu */}
          <View style={styles.completedListSection}>
            <View style={styles.completedListHeader}>
              <Text style={styles.completedListTitle}>
                Đơn hàng đã cộng vào doanh thu ({completedOrders.length})
              </Text>
            </View>

            {completedOrders.length === 0 ? (
              <View style={styles.emptyCompletedBox}>
                <Text style={styles.emptyCompletedEmoji}>🛒</Text>
                <Text style={styles.emptyCompletedText}>
                  Chưa có đơn hàng nào được giao thành công.
                </Text>
                <Text style={styles.emptyCompletedSub}>
                  Hãy cập nhật trạng thái đơn hàng sang [ĐÃ GIAO] để ghi nhận doanh thu.
                </Text>
              </View>
            ) : (
              completedOrders.map((order) => {
                const pCode = extractPaymentCode(order.notes);
                return (
                  <View key={order.id} style={styles.completedOrderCard}>
                    <View style={styles.completedOrderTop}>
                      <View>
                        <Text style={styles.completedOrderId}>Đơn hàng #{order.id}</Text>
                        <Text style={styles.completedOrderCustomer}>
                           {order.customerName} ({order.customerPhone})
                        </Text>
                      </View>
                      <View style={styles.completedAmountBadge}>
                        <Text style={styles.completedAmountText}>
                          +{order.totalAmount.toLocaleString('vi-VN')} đ
                        </Text>
                      </View>
                    </View>

                    <View style={styles.completedOrderMetaRow}>
                      <Text style={styles.completedOrderMethod}>
                         {order.paymentMethod || 'COD'}
                      </Text>
                      {pCode && (
                        <Text style={styles.completedOrderCode}>Mã TT: {pCode}</Text>
                      )}
                      <Text style={styles.completedOrderDate}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <View style={styles.completedVerifiedRow}>
                      <Text style={styles.completedVerifiedText}>
                         Đã hoàn tất & Ghi nhận vào doanh thu
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Danh sách các đơn đang chờ giao (chưa cộng vào doanh thu) */}
          {inProgressOrders.length > 0 && (
            <View style={styles.pendingListSection}>
              <Text style={styles.pendingListTitle}>
                Đơn hàng đang xử lý / Chờ giao ({inProgressOrders.length})
              </Text>
              <Text style={styles.pendingListSub}>
                * Số dư doanh thu không thay đổi cho đến khi đơn hàng chuyển sang ĐÃ GIAO.
              </Text>

              {inProgressOrders.map((order) => (
                <View key={order.id} style={styles.pendingOrderRow}>
                  <View style={styles.pendingOrderInfo}>
                    <Text style={styles.pendingOrderId}>Đơn #{order.id} · {order.customerName}</Text>
                    <Text style={styles.pendingOrderStatus}>
                      Trạng thái: {STATUS_CONFIG[order.status].icon} {STATUS_CONFIG[order.status].label}
                    </Text>
                  </View>
                  <View style={styles.pendingOrderAmountCol}>
                    <Text style={styles.pendingOrderAmount}>
                      {order.totalAmount.toLocaleString('vi-VN')} đ
                    </Text>
                    <Text style={styles.pendingOrderHoldNotice}>Chưa cộng</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

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
  headingTitleGroup: { flex: 1 },
  title: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 12, marginTop: 2 },
  refreshIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIconText: { fontSize: 16 },

  segmentBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  segmentBtnActive: {
    backgroundColor: '#6d28d9',
    borderColor: '#6d28d9',
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  segmentBtnTextActive: {
    color: '#ffffff',
  },

  revenueNoticeBar: {
    backgroundColor: '#ecfdf5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#a7f3d0',
  },
  revenueNoticeBarText: {
    fontSize: 12,
    color: '#065f46',
  },

  paymentMethodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  paymentMethodPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paymentMethodPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  paymentCodePill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paymentCodePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  revenueStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  revenueStatusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  revenueTagCompleted: {
    backgroundColor: '#d1fae5',
  },
  revenueTagCompletedText: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: '700',
  },
  revenueTagCancelled: {
    backgroundColor: '#fee2e2',
  },
  revenueTagCancelledText: {
    color: '#991b1b',
    fontSize: 10,
    fontWeight: '700',
  },
  revenueTagPending: {
    backgroundColor: '#fef3c7',
  },
  revenueTagPendingText: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: '700',
  },

  totalBlock: {
    alignItems: 'flex-end',
  },
  totalCaption: {
    fontSize: 10,
    color: '#64748b',
  },

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

  // ================= STYLES CHO QUẢN LÝ DOANH THU =================
  revenueScroll: {
    flex: 1,
  },
  revenueContent: {
    padding: 16,
    paddingBottom: 32,
  },
  revenueRuleNotice: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  revenueRuleNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  revenueRuleNoticeText: {
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 18,
  },
  revenueHeroCard: {
    backgroundColor: '#065f46',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  revenueHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueHeroLabel: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  revenueHeroBadge: {
    backgroundColor: '#047857',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  revenueHeroBadgeText: {
    color: '#d1fae5',
    fontSize: 10,
    fontWeight: '700',
  },
  revenueHeroAmount: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 4,
  },
  revenueHeroSub: {
    color: '#d1fae5',
    fontSize: 12,
    marginTop: 2,
  },

  revenueSubRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  revenueSubCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  revenuePendingCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  revenueCancelledCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  revenueSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  revenuePendingAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#b45309',
  },
  revenueCancelledAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#b91c1c',
  },
  revenueSubDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 14,
  },

  paymentMethodBreakdownCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  breakdownSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  methodStatLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  methodIconNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodEmoji: {
    fontSize: 16,
  },
  methodName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  methodAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },

  completedListSection: {
    marginBottom: 18,
  },
  completedListHeader: {
    marginBottom: 10,
  },
  completedListTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptyCompletedBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyCompletedEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyCompletedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  emptyCompletedSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  completedOrderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  completedOrderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  completedOrderId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  completedOrderCustomer: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  completedAmountBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedAmountText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#065f46',
  },
  completedOrderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  completedOrderMethod: {
    fontSize: 11,
    color: '#475569',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedOrderCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedOrderDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 'auto',
  },
  completedVerifiedRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  completedVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  pendingListSection: {
    marginTop: 10,
  },
  pendingListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b45309',
  },
  pendingListSub: {
    fontSize: 11,
    color: '#78350f',
    marginTop: 2,
    marginBottom: 8,
  },
  pendingOrderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  pendingOrderInfo: {
    flex: 1,
  },
  pendingOrderId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  pendingOrderStatus: {
    fontSize: 11,
    color: '#d97706',
    marginTop: 2,
  },
  pendingOrderAmountCol: {
    alignItems: 'flex-end',
  },
  pendingOrderAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  pendingOrderHoldNotice: {
    fontSize: 10,
    color: '#b45309',
    fontWeight: '600',
  },
});

export default AdminOrdersScreen;
