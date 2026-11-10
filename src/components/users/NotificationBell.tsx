import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  fetchOrderNotifications,
  fetchUnreadNotificationCount,
  markOrderNotificationsRead,
} from '../../database/projectDb';
import type { OrderNotification } from '../../database/types';
import { useAuth } from './AuthContext';

export interface NotificationBellProps {
  userId?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId: propUserId,
}) => {
  const { currentUser } = useAuth();
  let routeUserId: number | undefined;

  try {
    const route = useRoute();
    const params = route.params as { userId?: number } | undefined;
    if (params && typeof params.userId === 'number') {
      routeUserId = params.userId;
    }
  } catch {
    // Không nằm trong navigation context hoặc route không có params
  }

  const effectiveUserId = propUserId ?? currentUser?.id ?? routeUserId;

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      const count = await fetchUnreadNotificationCount(effectiveUserId);
      setUnreadCount(count);
    } catch (error) {
      console.warn('Lỗi khi tải số thông báo chưa đọc:', error);
    }
  }, [effectiveUserId]);

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, 3000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshCount();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [refreshCount]);

  const openNotifications = async () => {
    if (!effectiveUserId) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để xem thông báo cập nhật đơn hàng.');
      return;
    }
    try {
      const loaded = await fetchOrderNotifications(effectiveUserId);
      await markOrderNotificationsRead(effectiveUserId);
      setNotifications(loaded.map((item) => ({ ...item, isRead: 1 })));
      setUnreadCount(0);
      setIsOpen(true);
    } catch (error) {
      console.error('Không thể tải thông báo đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo lúc này.');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.bellButton}
        onPress={openNotifications}
        accessibilityRole="button"
        accessibilityLabel={`Thông báo, ${unreadCount} tin mới`}
      >
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.dismissArea}
            onPress={() => setIsOpen(false)}
            accessibilityLabel="Đóng thông báo"
          />
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.panelTitle}>Thông báo đơn hàng</Text>
                <View style={styles.titleBadge}>
                  <Text style={styles.titleBadgeText}>Đơn hàng</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                accessibilityRole="button"
                style={styles.closeBtn}
              >
                <Text style={styles.closeText}>Đóng</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={[
                styles.listContent,
                notifications.length === 0 && styles.emptyList,
              ]}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyText}>
                    Bạn chưa có thông báo cập nhật đơn hàng nào.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.notificationCard,
                    item.isRead === 0 && styles.unreadCard,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <Text style={styles.notiTypeIcon}>🛍️</Text>
                  </View>
                  <View style={styles.notiContent}>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.date}>
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  bellIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: '#dc2626',
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  dismissArea: {
    flex: 1,
  },
  panel: {
    maxHeight: '75%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  titleBadge: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  titleBadgeText: {
    fontSize: 11,
    color: '#6d28d9',
    fontWeight: '600',
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    color: '#6d28d9',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  unreadCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notiTypeIcon: {
    fontSize: 18,
  },
  notiContent: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    fontWeight: '500',
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
});

export default NotificationBell;
