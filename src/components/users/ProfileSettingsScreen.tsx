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
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  getUserById,
  getUserByUsername,
  updateAccountInfo,
  updateDefaultDeliveryInfo,
} from '../../database/projectDb';
import type { User } from '../../database/types';
import type { RootStackParamList } from '../AppNavigatorProduct';
import { getProductImageSource } from '../../utils/imageHelper';
import locations from '../../data/locations.json';
import { useAuth } from './AuthContext';
import LocationSelectModal from './LocationSelectModal';

interface ProfileSettingsScreenProps {
  route?: { params?: { username?: string; userId?: number } };
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({ route }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { currentUser, setCurrentUser, logout: authLogout } = useAuth();

  const paramUserId = route?.params?.userId;
  const paramUsername = route?.params?.username;
  const effectiveUserId = paramUserId ?? currentUser?.id;

  const [user, setUser] = useState<User | null>(null);

  // ================= 1. ACCOUNT INFORMATION STATE =================
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('logo.png');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // ================= 2. DEFAULT DELIVERY INFORMATION STATE =================
  const [deliveryFullName, setDeliveryFullName] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryProvince, setDeliveryProvince] = useState('');
  const [deliveryDistrict, setDeliveryDistrict] = useState('');
  const [deliveryWard, setDeliveryWard] = useState('');
  const [deliveryStreetAddress, setDeliveryStreetAddress] = useState('');
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      let loaded: User | null = null;
      if (effectiveUserId) {
        loaded = await getUserById(effectiveUserId);
      } else if (paramUsername) {
        loaded = await getUserByUsername(paramUsername);
      }
      if (loaded) {
        setUser(loaded);
        // Fill Account Info
        setUsername(loaded.username || '');
        setEmail(loaded.email || '');
        setAvatar(loaded.avatar || 'logo.png');

        // Fill Delivery Info Presets
        setDeliveryFullName(loaded.deliveryFullName || loaded.fullName || '');
        setDeliveryPhone(loaded.deliveryPhone || loaded.phone || '');
        setDeliveryProvince(loaded.deliveryProvince || '');
        setDeliveryDistrict(loaded.deliveryDistrict || '');
        setDeliveryWard(loaded.deliveryWard || '');
        setDeliveryStreetAddress(loaded.deliveryStreetAddress || '');

        // Fallback backward compatibility
        if (!loaded.deliveryProvince && loaded.deliveryLocation) {
          const parts = loaded.deliveryLocation.split(',').map((p) => p.trim());
          if (parts[0]) setDeliveryProvince(parts[0]);
          if (parts[1]) setDeliveryDistrict(parts[1]);
          if (parts[2]) setDeliveryWard(parts[2]);
        }
      }
    };
    loadUser();
  }, [effectiveUserId, paramUsername]);

  // Locations derived
  const provinceOptions = useMemo(() => locations.map((item) => item.name), []);

  const districtOptions = useMemo(() => {
    if (!deliveryProvince) return [];
    const prov = locations.find((item) => item.name === deliveryProvince);
    return prov ? prov.districts.map((d) => d.name) : [];
  }, [deliveryProvince]);

  const wardOptions = useMemo(() => {
    if (!deliveryProvince || !deliveryDistrict) return [];
    const prov = locations.find((item) => item.name === deliveryProvince);
    const dist = prov?.districts.find((d) => d.name === deliveryDistrict);
    return dist ? dist.wards : [];
  }, [deliveryProvince, deliveryDistrict]);

  const handleSelectProvince = (prov: string) => {
    setDeliveryProvince(prov);
    setDeliveryDistrict('');
    setDeliveryWard('');
  };

  const handleSelectDistrict = (dist: string) => {
    setDeliveryDistrict(dist);
    setDeliveryWard('');
  };

  const handlePickAvatar = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Lỗi', response.errorMessage || 'Không thể mở thư viện ảnh.');
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) setAvatar(uri);
    });
  };

  // ================= SAVE 1: ACCOUNT INFORMATION =================
  const handleSaveAccountInfo = async () => {
    if (!user) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để thực hiện thay đổi.');
      return;
    }
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      Alert.alert('Thiếu thông tin', 'Tên đăng nhập không được để trống.');
      return;
    }

    const cleanEmail = email.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email (ví dụ: name@example.com).');
      return;
    }

    if (showPasswordSection) {
      if (!currentPassword) {
        Alert.alert('Thiếu mật khẩu', 'Vui lòng nhập mật khẩu hiện tại.');
        return;
      }
      if (currentPassword !== user.password) {
        Alert.alert('Sai mật khẩu', 'Mật khẩu hiện tại không chính xác.');
        return;
      }
      if (newPassword.length < 6) {
        Alert.alert('Mật khẩu yếu', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Mật khẩu không khớp', 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp.');
        return;
      }
    }

    setIsSavingAccount(true);
    try {
      const success = await updateAccountInfo(user.id, {
        username: cleanUsername,
        email: cleanEmail,
        avatar,
        newPassword: showPasswordSection ? newPassword : undefined,
      });

      if (!success) {
        Alert.alert('Lỗi', 'Không thể cập nhật thông tin tài khoản. Tên đăng nhập có thể đã tồn tại.');
        return;
      }

      const updatedUser: User = {
        ...user,
        username: cleanUsername,
        email: cleanEmail,
        avatar,
        password: showPasswordSection ? newPassword : user.password,
      };
      setUser(updatedUser);
      setCurrentUser(updatedUser);
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert('✅ Thành công', 'Thông tin tài khoản đã được lưu thành công.');
    } catch (err) {
      console.error('Lỗi khi lưu thông tin tài khoản:', err);
      Alert.alert('Lỗi', 'Không thể lưu thông tin tài khoản.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  // ================= SAVE 2: DEFAULT DELIVERY INFORMATION =================
  const handleSaveDeliveryInfo = async () => {
    if (!user) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để lưu địa chỉ.');
      return;
    }

    const cleanFullName = deliveryFullName.trim();
    const cleanPhone = deliveryPhone.trim();

    if (!cleanFullName) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên người nhận hàng.');
      return;
    }

    if (!/^(0|\+84)[35789]\d{8}$/.test(cleanPhone.replace(/[\s.-]/g, ''))) {
      Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại Việt Nam hợp lệ.');
      return;
    }

    if (!deliveryProvince || !deliveryDistrict || !deliveryWard) {
      Alert.alert('Chưa chọn đủ địa chỉ', 'Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã.');
      return;
    }

    if (!deliveryStreetAddress.trim()) {
      Alert.alert('Thiếu địa chỉ cụ thể', 'Vui lòng nhập số nhà, tên đường nhận hàng.');
      return;
    }

    setIsSavingDelivery(true);
    try {
      const success = await updateDefaultDeliveryInfo(user.id, {
        deliveryFullName: cleanFullName,
        deliveryPhone: cleanPhone,
        deliveryProvince,
        deliveryDistrict,
        deliveryWard,
        deliveryStreetAddress: deliveryStreetAddress.trim(),
      });

      if (!success) {
        Alert.alert('Lỗi', 'Không thể lưu thông tin giao hàng mặc định.');
        return;
      }

      const updatedUser: User = {
        ...user,
        deliveryFullName: cleanFullName,
        deliveryPhone: cleanPhone,
        deliveryProvince,
        deliveryDistrict,
        deliveryWard,
        deliveryStreetAddress: deliveryStreetAddress.trim(),
        deliveryLocation: `${deliveryProvince}, ${deliveryDistrict}, ${deliveryWard}`,
      };
      setUser(updatedUser);
      setCurrentUser(updatedUser);

      Alert.alert(
        '✅ Đã lưu cấu hình giao hàng',
        'Thông tin giao hàng mặc định đã được cập nhật thành công! Dữ liệu này sẽ tự động điền vào biểu mẫu thanh toán (Checkout) mà không ảnh hưởng thông tin tài khoản.'
      );
    } catch (err) {
      console.error('Lỗi khi lưu thông tin giao hàng mặc định:', err);
      Alert.alert('Lỗi', 'Không thể lưu thông tin giao hàng mặc định.');
    } finally {
      setIsSavingDelivery(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Ở lại', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          authLogout();
          navigation.reset({ index: 0, routes: [{ name: 'CustomerTabs' }] });
        },
      },
    ]);
  };

  if (!user && !effectiveUserId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.guestTitle}>Chưa đăng nhập</Text>
        <Text style={styles.guestSubtitle}>
          Đăng nhập để xem và tùy chỉnh thông tin & đặt hàng.
        </Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        {/* ================= SECTION 1: ACCOUNT INFORMATION ================= */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerIconBadge}>
              <Text style={styles.headerEmoji}>😎</Text>
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
            </View>
          </View>

          {/* Avatar Preview & Picker */}
          <View style={styles.avatarSection}>
            <Image
              source={getProductImageSource(avatar || user?.avatar || 'logo1.png')}
              style={styles.avatarImage}
            />
            <TouchableOpacity style={styles.changeAvatarBtn} onPress={handlePickAvatar}>
              <Text style={styles.changeAvatarText}>Đổi ảnh đại diện</Text>
            </TouchableOpacity>
          </View>

          {/* Username */}
          <Text style={styles.fieldLabel}>Tên đăng nhập</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Tên đăng nhập"
            autoCapitalize="none"
          />

          {/* Email */}
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ví dụ: user@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Management */}
          <TouchableOpacity
            style={styles.passwordToggleBtn}
            onPress={() => setShowPasswordSection((prev) => !prev)}
          >
            <Text style={styles.passwordToggleText}>
              {showPasswordSection ? '▲ Đóng phần đổi mật khẩu' : '🔒 Đổi mật khẩu'}
            </Text>
          </TouchableOpacity>

          {showPasswordSection && (
            <View style={styles.passwordBox}>
              <Text style={styles.fieldLabel}>Mật khẩu hiện tại</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry
              />

              <Text style={styles.fieldLabel}>Mật khẩu mới (tối thiểu 6 ký tự)</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry
              />

              <Text style={styles.fieldLabel}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry
              />
            </View>
          )}

          {/* Save Account Button */}
          <TouchableOpacity
            style={[styles.saveBtn, styles.saveAccountBtn, isSavingAccount && styles.disabledBtn]}
            onPress={handleSaveAccountInfo}
            disabled={isSavingAccount}
          >
            <Text style={styles.saveBtnText}>
              {isSavingAccount ? 'Đang lưu...' : 'Lưu thông tin tài khoản'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= SECTION 2: DEFAULT DELIVERY INFORMATION ================= */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={[styles.headerIconBadge, styles.deliveryBadge]}>
              <Text style={styles.headerEmoji}>🚚</Text>
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.sectionTitle}>Thông tin giao hàng *</Text>
            </View>
          </View>

          <View style={styles.noticeCallout}>
            <Text style={styles.noticeText}>
              💡 Mục này sẽ được tự động điền khi bạn nhập thông tin để đặt hàng
            </Text>
          </View>

          {/* Full Name */}
          <Text style={styles.fieldLabel}>Họ và tên người nhận</Text>
          <TextInput
            style={styles.input}
            value={deliveryFullName}
            onChangeText={setDeliveryFullName}
            placeholder="Họ và tên người nhận hàng"
            autoCapitalize="words"
          />

          {/* Phone Number */}
          <Text style={styles.fieldLabel}>Số điện thoại nhận hàng</Text>
          <TextInput
            style={styles.input}
            value={deliveryPhone}
            onChangeText={setDeliveryPhone}
            placeholder="Số điện thoại nhận hàng"
            keyboardType="phone-pad"
          />

          {/* Province */}
          <LocationSelectModal
            label="Tỉnh / Thành phố"
            required={false}
            value={deliveryProvince}
            placeholder="Chọn Tỉnh / Thành phố mặc định"
            options={provinceOptions}
            onSelect={handleSelectProvince}
            title="Chọn Tỉnh / Thành phố mặc định"
          />

          {/* District */}
          <LocationSelectModal
            label="Quận / Huyện"
            required={false}
            value={deliveryDistrict}
            placeholder={deliveryProvince ? 'Chọn Quận / Huyện mặc định' : 'Vui lòng chọn Tỉnh trước'}
            options={districtOptions}
            disabled={!deliveryProvince}
            disabledHint="Vui lòng chọn Tỉnh / Thành phố trước khi chọn Quận / Huyện."
            onSelect={handleSelectDistrict}
            title={`Quận / Huyện tại ${deliveryProvince}`}
          />

          {/* Ward */}
          <LocationSelectModal
            label="Phường / Xã"
            required={false}
            value={deliveryWard}
            placeholder={deliveryDistrict ? 'Chọn Phường / Xã mặc định' : 'Vui lòng chọn Quận/Huyện trước'}
            options={wardOptions}
            disabled={!deliveryDistrict}
            disabledHint="Vui lòng chọn Quận / Huyện trước khi chọn Phường / Xã."
            onSelect={setDeliveryWard}
            title={`Phường / Xã tại ${deliveryDistrict}`}
          />

          {/* Street Address */}
          <Text style={styles.fieldLabel}>Số nhà, tên đường</Text>
          <TextInput
            style={styles.input}
            value={deliveryStreetAddress}
            onChangeText={setDeliveryStreetAddress}
            placeholder="Ví dụ: Số 123 Đường Cầu Giấy..."
          />

          {/* Save Delivery Button */}
          <TouchableOpacity
            style={[styles.saveBtn, styles.saveDeliveryBtn, isSavingDelivery && styles.disabledBtn]}
            onPress={handleSaveDeliveryInfo}
            disabled={isSavingDelivery}
          >
            <Text style={styles.saveBtnText}>
              {isSavingDelivery ? 'Đang lưu...' : 'Lưu thông tin giao hàng'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= ACTIONS: ORDER HISTORY & LOGOUT ================= */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.actionRowBtn}
            onPress={() => user && navigation.navigate('OrderHistory', { userId: user.id })}
          >
            <Text style={styles.actionRowIcon}>📋</Text>
            <Text style={styles.actionRowText}>Xem đơn hàng đã đặt</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRowBtn, styles.logoutBtn]} onPress={handleLogout}>
            <Text style={styles.actionRowIcon}>↪️</Text>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: '#6d28d9',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryBadge: {
    backgroundColor: '#e0f2fe',
  },
  headerEmoji: {
    fontSize: 20,
  },
  headerTextCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionCaption: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#6d28d9',
  },
  changeAvatarBtn: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f3ff',
    borderRadius: 20,
  },
  changeAvatarText: {
    fontSize: 13,
    color: '#6d28d9',
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 10,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    marginBottom: 6,
  },
  passwordToggleBtn: {
    paddingVertical: 10,
    marginTop: 6,
  },
  passwordToggleText: {
    fontSize: 13,
    color: '#6d28d9',
    fontWeight: '600',
  },
  passwordBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  saveBtn: {
    minHeight: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  saveAccountBtn: {
    backgroundColor: '#6d28d9',
  },
  saveDeliveryBtn: {
    backgroundColor: '#0284c7',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.65,
  },
  noticeCallout: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  noticeText: {
    fontSize: 12,
    color: '#0369a1',
    lineHeight: 18,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionRowIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  actionRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  chevron: {
    fontSize: 20,
    color: '#94a3b8',
  },
  logoutBtn: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
});

export default ProfileSettingsScreen;
