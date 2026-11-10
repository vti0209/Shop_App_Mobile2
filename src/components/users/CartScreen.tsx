import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import locations from '../../data/locations.json';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import LocationSelectModal from './LocationSelectModal';

interface CartScreenProps {
  route?: { params?: { userId?: number } };
}

const AVAILABLE_VOUCHERS = [
  { code: 'VANW10', label: 'VANW10 (Giảm 10%)', desc: 'Giảm 10% tối đa 100.000 đ' },
  { code: 'FREESHIP', label: 'FREESHIP (0 đ)', desc: 'Miễn phí vận chuyển' },
  { code: 'GIAM20K', label: 'GIAM20K (-20.000 đ)', desc: 'Giảm trực tiếp 20.000 đ' },
];

export const CartScreen: React.FC<CartScreenProps> = ({ route }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { items, setQuantity, removeFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const effectiveUserId = route?.params?.userId ?? currentUser?.id;

  // 1. CHECKOUT FORM WITH SEPARATED LOCATION FIELDS
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [notes, setNotes] = useState('');

  // 2. PAYMENT & SHIPPING DEFAULTS & OFFERS
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Thẻ tín dụng/Ghi nợ' | 'Ví điện tử'>('COD');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DATA PREFILL LOGIC: Lấy từ Default Delivery Information trong Profile
  useEffect(() => {
    if (!effectiveUserId) return;
    getUserById(effectiveUserId)
      .then((user) => {
        if (!user) return;
        // Điền trước từ thông tin giao hàng mặc định (hoặc fallback thông tin tài khoản)
        setCustomerName(user.deliveryFullName || user.fullName || '');
        setCustomerPhone(user.deliveryPhone || user.phone || '');
        setStreetAddress(user.deliveryStreetAddress || '');

        if (user.deliveryProvince) {
          setSelectedProvince(user.deliveryProvince);
        }
        if (user.deliveryDistrict) {
          setSelectedDistrict(user.deliveryDistrict);
        }
        if (user.deliveryWard) {
          setSelectedWard(user.deliveryWard);
        }

        // Tương thích ngược: nếu chưa có trường riêng nhưng có deliveryLocation dạng chuỗi phân cách
        if (!user.deliveryProvince && user.deliveryLocation) {
          const parts = user.deliveryLocation.split(',').map((p) => p.trim());
          if (parts[0]) setSelectedProvince(parts[0]);
          if (parts[1]) setSelectedDistrict(parts[1]);
          if (parts[2]) setSelectedWard(parts[2]);
        }
      })
      .catch((error: unknown) => {
        console.error('Không thể tải thông tin thanh toán:', error);
      });
  }, [effectiveUserId]);

  // Danh sách Tỉnh/Thành phố
  const provinceOptions = useMemo(() => locations.map((item) => item.name), []);

  // Danh sách Quận/Huyện theo Tỉnh đã chọn
  const districtOptions = useMemo(() => {
    if (!selectedProvince) return [];
    const provinceObj = locations.find((item) => item.name === selectedProvince);
    return provinceObj ? provinceObj.districts.map((d) => d.name) : [];
  }, [selectedProvince]);

  // Danh sách Phường/Xã theo Quận đã chọn
  const wardOptions = useMemo(() => {
    if (!selectedProvince || !selectedDistrict) return [];
    const provinceObj = locations.find((item) => item.name === selectedProvince);
    const districtObj = provinceObj?.districts.find((d) => d.name === selectedDistrict);
    return districtObj ? districtObj.wards : [];
  }, [selectedProvince, selectedDistrict]);

  // Thay đổi Tỉnh/Thành phố -> Reset Quận/Huyện và Phường/Xã
  const handleSelectProvince = (province: string) => {
    setSelectedProvince(province);
    setSelectedDistrict('');
    setSelectedWard('');
  };

  // Thay đổi Quận/Huyện -> Reset Phường/Xã
  const handleSelectDistrict = (district: string) => {
    setSelectedDistrict(district);
    setSelectedWard('');
  };

  // Thay đổi Phường/Xã
  const handleSelectWard = (ward: string) => {
    setSelectedWard(ward);
  };

  // TÍNH TOÁN TIỀN VÀ KHUYẾN MÃI
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discount = 0;
  if (appliedPromo === 'VANW10') {
    discount = Math.min(Math.round(subtotal * 0.1), 100000);
  } else if (appliedPromo === 'GIAM20K') {
    discount = Math.min(20000, subtotal);
  }

  const shippingFee = 0; // Standard Shipping luôn miễn phí tối ưu
  const total = Math.max(0, subtotal - discount + shippingFee);

  // VALIDATION LOGIC
  const cleanPhone = customerPhone.replace(/[\s.-]/g, '');
  const isPhoneValid = /^(0|\+84)[35789]\d{8}$/.test(cleanPhone);
  const isNameValid = customerName.trim().length >= 2 && !/^\d+$/.test(customerName.trim());
  const isProvinceValid = selectedProvince.trim().length > 0;
  const isDistrictValid = selectedDistrict.trim().length > 0;
  const isWardValid = selectedWard.trim().length > 0;
  const isStreetValid = streetAddress.trim().length >= 3;

  const isFormValid =
    isNameValid &&
    isPhoneValid &&
    isProvinceValid &&
    isDistrictValid &&
    isWardValid &&
    isStreetValid;

  // ÁP DỤNG MÃ ƯU ĐÃI
  const handleApplyPromoCode = (codeToApply?: string) => {
    const code = (codeToApply ?? promoInput).trim().toUpperCase();
    if (!code) {
      setAppliedPromo('');
      setPromoMessage('');
      return;
    }
    if (code === 'VANW10') {
      setAppliedPromo('VANW10');
      setPromoInput('VANW10');
      setPromoMessage('Đã áp dụng giảm 10% (tối đa 100.000 đ)!');
    } else if (code === 'FREESHIP') {
      setAppliedPromo('FREESHIP');
      setPromoInput('FREESHIP');
      setPromoMessage('Đã áp dụng Miễn phí giao hàng tiêu chuẩn!');
    } else if (code === 'GIAM20K') {
      setAppliedPromo('GIAM20K');
      setPromoInput('GIAM20K');
      setPromoMessage('Đã áp dụng mã giảm giá 20.000 đ!');
    } else {
      setAppliedPromo('');
      setPromoMessage('Mã ưu đãi không hợp lệ.');
    }
  };

  // ĐẶT HÀNG (SUBMISSION)
  const handlePlaceOrder = async () => {
    if (!effectiveUserId) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để tiến hành đặt hàng.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (!isFormValid || items.length === 0) {
      Alert.alert('Chưa hoàn tất', 'Vui lòng điền đầy đủ và chính xác các thông tin có dấu * đỏ.');
      return;
    }

    const fullCustomerAddress = `${streetAddress.trim()}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`;

    setIsSubmitting(true);
    try {
      const success = await createOrder(
        effectiveUserId,
        {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: fullCustomerAddress,
          notes: notes.trim(),
          paymentMethod,
          shippingMethod: 'Standard Shipping',
          discountAmount: discount,
          totalAmount: total,
        },
        items
      );

      if (!success) {
        Alert.alert('Lỗi đặt hàng', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        return;
      }

      clearCart();
      Alert.alert(
        '🎉 Đặt hàng thành công!',
        `Đơn hàng của bạn trị giá ${total.toLocaleString('vi-VN')} đ đã được tiếp nhận. Bạn có thể theo dõi tiến độ trong Lịch sử mua hàng.`,
        [
          {
            text: 'Xem đơn hàng',
            onPress: () => navigation.navigate('OrderHistory', { userId: effectiveUserId }),
          },
          { text: 'Tiếp tục mua hàng' },
        ]
      );
    } catch (error) {
      console.error('Không thể hoàn tất đơn hàng:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* DANH SÁCH SẢN PHẨM TRONG GIỎ */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sản phẩm trong giỏ ({items.length})</Text>
          {items.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartEmoji}>🛒</Text>
              <Text style={styles.emptyCartText}>Giỏ hàng đang trống.</Text>
            </View>
          ) : (
            items.map(({ product, quantity }) => (
              <View key={product.id} style={styles.itemRow}>
                <Image
                  source={getProductImageSource(product.img)}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {product.price.toLocaleString('vi-VN')} đ
                  </Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQuantity(product.id, quantity - 1)}
                      accessibilityLabel="Giảm số lượng"
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQuantity(product.id, quantity + 1)}
                      accessibilityLabel="Tăng số lượng"
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => removeFromCart(product.id)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.deleteBtnText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 1. CHECKOUT FORM WITH SEPARATED LOCATION FIELDS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
            <Text style={styles.sectionHint}>Tự động điền từ Hồ sơ</Text>
          </View>

          {/* Họ và tên */}
          <Text style={styles.inputLabel}>
            Họ và tên người nhận<Text style={styles.requiredStar}> *</Text>
          </Text>
          <TextInput
            style={[styles.input, !isNameValid && customerName.length > 0 && styles.inputError]}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Nhập họ và tên đầy đủ"
            placeholderTextColor="#94a3b8"
            autoCapitalize="words"
          />
          {!isNameValid && customerName.length > 0 && (
            <Text style={styles.errorText}>Họ và tên phải có ít nhất 2 ký tự hợp lệ.</Text>
          )}

          {/* Số điện thoại */}
          <Text style={styles.inputLabel}>
            Số điện thoại nhận hàng<Text style={styles.requiredStar}> *</Text>
          </Text>
          <TextInput
            style={[styles.input, !isPhoneValid && customerPhone.length > 0 && styles.inputError]}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="Ví dụ: 0912345678"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
          {!isPhoneValid && customerPhone.length > 0 && (
            <Text style={styles.errorText}>Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số).</Text>
          )}

          {/* Tỉnh / Thành phố */}
          <LocationSelectModal
            label="Tỉnh / Thành phố"
            required
            value={selectedProvince}
            placeholder="Chọn Tỉnh / Thành phố"
            options={provinceOptions}
            onSelect={handleSelectProvince}
            title="Chọn Tỉnh / Thành phố"
          />

          {/* Quận / Huyện (Disabled until Province chosen) */}
          <LocationSelectModal
            label="Quận / Huyện"
            required
            value={selectedDistrict}
            placeholder={selectedProvince ? 'Chọn Quận / Huyện' : 'Vui lòng chọn Tỉnh/Thành phố trước'}
            options={districtOptions}
            disabled={!selectedProvince}
            disabledHint="Bạn cần chọn Tỉnh / Thành phố trước khi chọn Quận / Huyện."
            onSelect={handleSelectDistrict}
            title={`Quận / Huyện tại ${selectedProvince}`}
          />

          {/* Phường / Xã (Disabled until District chosen) */}
          <LocationSelectModal
            label="Phường / Xã / Thị trấn"
            required
            value={selectedWard}
            placeholder={selectedDistrict ? 'Chọn Phường / Xã' : 'Vui lòng chọn Quận/Huyện trước'}
            options={wardOptions}
            disabled={!selectedDistrict}
            disabledHint="Bạn cần chọn Quận / Huyện trước khi chọn Phường / Xã."
            onSelect={handleSelectWard}
            title={`Phường / Xã tại ${selectedDistrict}`}
          />

          {/* Số nhà, tên đường */}
          <Text style={styles.inputLabel}>
            Địa chỉ cụ thể (Số nhà, tên đường)<Text style={styles.requiredStar}> *</Text>
          </Text>
          <TextInput
            style={[styles.input, !isStreetValid && streetAddress.length > 0 && styles.inputError]}
            value={streetAddress}
            onChangeText={setStreetAddress}
            placeholder="Ví dụ: Số 123 Đường Cầu Giấy, Tòa nhà A..."
            placeholderTextColor="#94a3b8"
          />

          {/* Ghi chú */}
          <Text style={styles.inputLabel}>Ghi chú giao hàng (Không bắt buộc)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Lưu ý giao hàng (Ví dụ: gọi trước 15 phút, giao giờ hành chính...)"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* 2. PHƯƠNG THỨC THANH TOÁN (DEFAULT COD + COLLAPSIBLE) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <TouchableOpacity
              onPress={() => setShowPaymentOptions((prev) => !prev)}
              style={styles.changeActionBtn}
            >
              <Text style={styles.changeActionText}>
                {showPaymentOptions ? 'Thu gọn ▲' : 'Thay đổi ▼'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hiển thị phương thức đã chọn */}
          <View style={styles.activePaymentBadge}>
            <View style={styles.radioDotOuter}>
              <View style={styles.radioDotInner} />
            </View>
            <View style={styles.paymentInfoCol}>
              <Text style={styles.paymentMethodTitle}>
                {paymentMethod === 'COD'
                  ? 'Thanh toán khi nhận hàng (COD)'
                  : paymentMethod}
              </Text>
              <Text style={styles.paymentMethodDesc}>
                {paymentMethod === 'COD'
                  ? 'Mặc định · Thanh toán tiền mặt khi kiểm tra hàng'
                  : paymentMethod === 'Thẻ tín dụng/Ghi nợ'
                  ? 'Visa, MasterCard, JCB an toàn qua cổng bảo mật'
                  : 'MoMo, ZaloPay, VNPay quét mã nhanh chóng'}
              </Text>
            </View>
          </View>

          {/* Danh sách collapsible cho các phương thức khác */}
          {showPaymentOptions && (
            <View style={styles.collapsiblePayments}>
              {(['COD', 'Thẻ tín dụng/Ghi nợ', 'Ví điện tử'] as const).map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <TouchableOpacity
                    key={method}
                    style={[styles.paymentSelectRow, isSelected && styles.paymentSelectRowActive]}
                    onPress={() => {
                      setPaymentMethod(method);
                      setShowPaymentOptions(false);
                    }}
                  >
                    <View style={styles.radioDotOuter}>
                      {isSelected && <View style={styles.radioDotInner} />}
                    </View>
                    <View style={styles.paymentOptionDetails}>
                      <Text style={[styles.paymentOptionName, isSelected && styles.paymentOptionNameActive]}>
                        {method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : method}
                      </Text>
                      <Text style={styles.paymentOptionSub}>
                        {method === 'COD'
                          ? 'Thanh toán tiền mặt tận nơi khi nhận hàng'
                          : method === 'Thẻ tín dụng/Ghi nợ'
                          ? 'Hỗ trợ thẻ nội địa & quốc tế'
                          : 'Liên kết ví MoMo, ZaloPay, ShopeePay'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 2. HÌNH THỨC VẬN CHUYỂN (DEFAULT STANDARD SHIPPING) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hình thức vận chuyển</Text>
          <View style={styles.shippingMethodCard}>
            <View style={styles.radioDotOuter}>
              <View style={styles.radioDotInner} />
            </View>
            <View style={styles.shippingInfoCol}>
              <Text style={styles.shippingTitle}>Giao hàng tiêu chuẩn (Standard Shipping)</Text>
              <Text style={styles.shippingDesc}>Tối ưu chi phí · Giao từ 2–3 ngày làm việc</Text>
            </View>
            <Text style={styles.shippingBadgeFree}>Miễn phí</Text>
          </View>
        </View>

        {/* 2. ƯU ĐÃI & KHUYẾN MÃI (OFFERS SECTION) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ưu đãi & Khuyến mãi</Text>
          <View style={styles.promoInputRow}>
            <TextInput
              style={styles.promoField}
              value={promoInput}
              onChangeText={setPromoInput}
              placeholder="Nhập mã ưu đãi (VANW10, FREESHIP...)"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => handleApplyPromoCode()}
              accessibilityRole="button"
            >
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          {/* Quick voucher chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voucherChipsRow}>
            {AVAILABLE_VOUCHERS.map((voucher) => (
              <TouchableOpacity
                key={voucher.code}
                style={[
                  styles.voucherChip,
                  appliedPromo === voucher.code && styles.voucherChipActive,
                ]}
                onPress={() => handleApplyPromoCode(voucher.code)}
              >
                <Text
                  style={[
                    styles.voucherChipText,
                    appliedPromo === voucher.code && styles.voucherChipTextActive,
                  ]}
                >
                  🏷️ {voucher.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {promoMessage ? (
            <Text
              style={[
                styles.promoFeedbackText,
                appliedPromo ? styles.promoSuccessText : styles.promoErrorText,
              ]}
            >
              {appliedPromo ? '✓ ' : '✕ '}
              {promoMessage}
            </Text>
          ) : null}
        </View>

        {/* CHI TIẾT THANH TOÁN (PRICE BREAKDOWN) */}
        <View style={[styles.sectionCard, styles.breakdownCard]}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.breakdownLine}>
            <Text style={styles.breakdownLabel}>Tạm tính ({items.length} món)</Text>
            <Text style={styles.breakdownValue}>{subtotal.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.breakdownLine}>
            <Text style={styles.breakdownLabel}>Phí vận chuyển</Text>
            <Text style={styles.freeText}>0 đ (Miễn phí)</Text>
          </View>
          {discount > 0 && (
            <View style={styles.breakdownLine}>
              <Text style={styles.discountLabel}>Khuyến mãi giảm giá</Text>
              <Text style={styles.discountValue}>−{discount.toLocaleString('vi-VN')} đ</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.breakdownLine}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} đ</Text>
          </View>
        </View>
      </ScrollView>

      {/* 2. SUBMISSION: STICKY "PLACE ORDER" BUTTON */}
      <View style={styles.stickyFooter}>
        {!isFormValid && items.length > 0 && (
          <Text style={styles.stickyValidationNotice}>
            ⚠️ Vui lòng điền đầy đủ Họ tên, SĐT và chọn đủ Tỉnh, Huyện, Xã.
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!isFormValid || items.length === 0 || isSubmitting) && styles.disabledPlaceOrder,
          ]}
          onPress={handlePlaceOrder}
          disabled={!isFormValid || items.length === 0 || isSubmitting}
          accessibilityRole="button"
          accessibilityLabel={`Đặt hàng tổng tiền ${total.toLocaleString('vi-VN')} đồng`}
        >
          <Text style={styles.placeOrderText}>
            {isSubmitting
              ? 'Đang xử lý đặt hàng...'
              : `Đặt hàng · ${total.toLocaleString('vi-VN')} đ`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 24,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  sectionHint: {
    fontSize: 12,
    color: '#6d28d9',
    fontWeight: '600',
  },
  emptyCartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyCartEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyCartText: {
    color: '#64748b',
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  itemPrice: {
    fontSize: 13,
    color: '#be123c',
    fontWeight: '700',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '700',
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  deleteBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 4,
  },
  requiredStar: {
    color: '#dc2626',
    fontWeight: '700',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: -6,
    marginBottom: 10,
  },
  notesInput: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  changeActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeActionText: {
    color: '#6d28d9',
    fontSize: 13,
    fontWeight: '600',
  },
  activePaymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f3ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  radioDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6d28d9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6d28d9',
  },
  paymentInfoCol: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4c1d95',
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: '#6d28d9',
    marginTop: 2,
  },
  collapsiblePayments: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 6,
  },
  paymentSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  paymentSelectRowActive: {
    backgroundColor: '#f8fafc',
  },
  paymentOptionDetails: {
    flex: 1,
  },
  paymentOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentOptionNameActive: {
    color: '#6d28d9',
  },
  paymentOptionSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  shippingMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  shippingInfoCol: {
    flex: 1,
  },
  shippingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  shippingDesc: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 2,
  },
  shippingBadgeFree: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  promoField: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  applyBtn: {
    backgroundColor: '#6d28d9',
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  voucherChipsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  voucherChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  voucherChipActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
  },
  voucherChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  voucherChipTextActive: {
    color: '#6d28d9',
  },
  promoFeedbackText: {
    fontSize: 12,
    marginTop: 6,
  },
  promoSuccessText: {
    color: '#15803d',
    fontWeight: '600',
  },
  promoErrorText: {
    color: '#dc2626',
  },
  breakdownCard: {
    marginBottom: 80,
  },
  breakdownLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  freeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  discountLabel: {
    fontSize: 14,
    color: '#16a34a',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#be123c',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  stickyValidationNotice: {
    fontSize: 11,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  placeOrderButton: {
    minHeight: 48,
    backgroundColor: '#6d28d9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledPlaceOrder: {
    backgroundColor: '#94a3b8',
    opacity: 0.65,
  },
  placeOrderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartScreen;
