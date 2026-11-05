import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { createOrder, getUserById } from '../../database/projectDb';
import type { RootStackParamList } from '../AppNavigatorProduct';
import { getProductImageSource } from '../../utils/imageHelper';
import { useCart } from './CartContext';

interface CartScreenProps {
  route: { params?: { userId?: number } };
}

const CartScreen = ({ route }: CartScreenProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { items, setQuantity, removeFromCart, clearCart } = useCart();
  const userId = route.params?.userId;
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getUserById(userId).then((user) => {
      if (!user) return;
      setCustomerName(user.fullName || '');
      setCustomerPhone(user.phone || '');
    }).catch((error: unknown) => {
      console.error('Không thể tải thông tin thanh toán:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin tài khoản để thanh toán.');
    });
  }, [userId]);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!userId) {
      Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để đặt hàng.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Hãy thêm sản phẩm trước khi đặt hàng.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    setIsSubmitting(true);
    const success = await createOrder(
      userId,
      {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        totalAmount: total,
      },
      items
    );
    setIsSubmitting(false);

    if (!success) {
      Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
      return;
    }

    clearCart();
    setCustomerAddress('');
    Alert.alert('Đặt hàng thành công', 'Đơn hàng đã được ghi nhận.', [
      { text: 'Xem lịch sử', onPress: () => navigation.navigate('OrderHistory', { userId }) },
      { text: 'Tiếp tục mua sắm' },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng đang trống.</Text>
      ) : (
        items.map(({ product, quantity }) => (
          <View key={product.id} style={styles.itemCard}>
            <Image source={getProductImageSource(product.img)} style={styles.image} />
            <View style={styles.itemInfo}>
              <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.price}>{product.price.toLocaleString('vi-VN')} đ</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(product.id, quantity - 1)}
                  accessibilityLabel="Giảm số lượng"
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(product.id, quantity + 1)}
                  accessibilityLabel="Tăng số lượng"
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCart(product.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Xóa ${product.name} khỏi giỏ`}
                >
                  <Text style={styles.removeText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={styles.checkoutCard}>
        <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Họ và tên"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={customerPhone}
          onChangeText={setCustomerPhone}
          placeholder="Số điện thoại"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, styles.addressInput]}
          value={customerAddress}
          onChangeText={setCustomerAddress}
          placeholder="Địa chỉ nhận hàng"
          placeholderTextColor="#94a3b8"
          multiline
        />
        <Text style={styles.total}>Tổng cộng: {total.toLocaleString('vi-VN')} đ</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, (isSubmitting || items.length === 0) && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={isSubmitting || items.length === 0}
          accessibilityRole="button"
        >
          <Text style={styles.checkoutText}>
            {isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 14, paddingBottom: 28 },
  emptyText: { paddingVertical: 28, textAlign: 'center', color: '#64748b' },
  itemCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  image: { width: 76, height: 76, marginRight: 12, resizeMode: 'contain' },
  itemInfo: { flex: 1, minWidth: 0 },
  name: { color: '#1e293b', fontWeight: '700' },
  price: { color: '#be123c', fontWeight: '700', marginTop: 4 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  quantityButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ede9fe',
    borderRadius: 8,
  },
  quantityButtonText: { color: '#6d28d9', fontSize: 18, fontWeight: '700' },
  quantity: { minWidth: 20, color: '#0f172a', textAlign: 'center', fontWeight: '700' },
  removeButton: { marginLeft: 'auto', padding: 6 },
  removeText: { color: '#dc2626', fontWeight: '600' },
  checkoutCard: {
    padding: 14,
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: { marginBottom: 10, color: '#0f172a', fontSize: 16, fontWeight: '700' },
  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    marginBottom: 10,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 9,
  },
  addressInput: { minHeight: 72, paddingTop: 10, textAlignVertical: 'top' },
  total: { marginVertical: 8, color: '#be123c', fontSize: 17, fontWeight: '700' },
  checkoutButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 10,
  },
  disabledButton: { opacity: 0.5 },
  checkoutText: { color: '#fff', fontWeight: '700' },
});

export default CartScreen;
