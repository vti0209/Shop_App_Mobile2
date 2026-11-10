// Màn hình đăng ký tài khoản mới vào bảng users trong SQLite.
import React, { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addUser, initProjectDatabase } from '../database/projectDb';
import type { RootStackParamList } from './AppNavigatorProduct';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  // Trạng thái cho các trường nhập liệu
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái cho Pop-up Đăng ký thành công
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredAccount, setRegisteredAccount] = useState('');

  // Cuộn form lên khi người dùng nhấn vào các ô mật khẩu
  const handleInputFocus = (offset = 120) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: offset, animated: true });
    }, 150);
  };

  // Kiểm tra dữ liệu đầu vào và đăng ký tài khoản
  const handleRegister = async () => {
    Keyboard.dismiss();
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
    if (normalizedUsername.length < 3) {
      Alert.alert('Tên đăng nhập quá ngắn', 'Tên đăng nhập cần có ít nhất 3 ký tự.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mật khẩu chưa an toàn', 'Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Mật khẩu nhập lại không trùng khớp với mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await initProjectDatabase();
      const created = await addUser({
        username: normalizedUsername,
        password,
        role: 'user',
      });

      if (!created) {
        Alert.alert(
          'Không thể đăng ký',
          'Tên đăng nhập này đã được sử dụng hoặc có lỗi xảy ra. Vui lòng chọn tên khác.'
        );
        return;
      }

      // Đăng ký thành công: Hiển thị Pop-up thông báo thành công
      setRegisteredAccount(normalizedUsername);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      Alert.alert('Lỗi', 'Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Điều hướng sang màn hình Đăng nhập khi bấm nút trên Pop-up
  const handleProceedToLogin = () => {
    setShowSuccessModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login', params: { username: registeredAccount } }],
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Lời chào */}
          <View style={styles.headerArea}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🛍️</Text>
            </View>
            <Text style={styles.appTitle}>Tạp hóa Vanw Tiet</Text>
            <Text style={styles.appSubtitle}>Chào mừng đã gia nhập cùng chúng tôi!</Text>
          </View>

          {/* Form tạo tài khoản */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, {textAlign: 'center'}]}>Tạo tài khoản mới</Text>

            {/* Ô nhập tên đăng nhập */}
            <Text style={styles.fieldLabel}>Tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên đăng nhập (từ 3 ký tự)"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel="Tên đăng nhập"
            />

            {/* Ô nhập mật khẩu */}
            <Text style={styles.fieldLabel}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (từ 6 ký tự)"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="next"
              onFocus={() => handleInputFocus(100)}
              accessibilityLabel="Mật khẩu"
            />

            {/* Ô xác nhận mật khẩu */}
            <Text style={styles.fieldLabel}>Xác nhận mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu vừa nhập"
              placeholderTextColor="#94a3b8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              onFocus={() => handleInputFocus(180)}
              accessibilityLabel="Xác nhận mật khẩu"
            />

            {/* Nút bấm Đăng ký */}
            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Đang tạo tài khoản...' : '✨ Đăng ký ngay'}
              </Text>
            </TouchableOpacity>

            {/* Chuyển sang màn hình Đăng nhập */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Bạn đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}> Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Khoảng trống đệm cuối giúp bàn phím không che form */}
          <View style={styles.keyboardSpacer} />
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* ================= POP-UP ĐĂNG KÝ THÀNH CÔNG ================= */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleProceedToLogin}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Huy hiệu chúc mừng */}
            <View style={styles.successIconCircle}>
              <Text style={styles.successIconEmoji}>🎉</Text>
            </View>

            <Text style={styles.modalTitle}>Đăng ký thành công!</Text>
            <Text style={styles.modalMessage}>
              Chào mừng bạn gia nhập Tạp hóa Vanw Tiet. Tài khoản{' '}
              <Text style={styles.highlightText}>@{registeredAccount}</Text> đã sẵn sàng để mua sắm.
            </Text>

            {/* Hộp thông tin tài khoản vừa tạo */}
            <View style={styles.accountInfoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tên tài khoản:</Text>
                <Text style={styles.infoValue}>@{registeredAccount}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Quyền sử dụng:</Text>
                <Text style={styles.infoValueRole}>Khách hàng</Text>
              </View>
            </View>

            {/* Nút chuyển sang Đăng nhập */}
            <TouchableOpacity
              style={styles.modalLoginButton}
              onPress={handleProceedToLogin}
              accessibilityRole="button"
              accessibilityLabel="Đăng nhập ngay"
            >
              <Text style={styles.modalLoginButtonText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoEmoji: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 3,
  },
  card: {
    padding: 22,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    marginBottom: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    fontSize: 10,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#6d28d9',
    borderRadius: 12,
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  link: {
    color: '#6d28d9',
    fontWeight: '700',
    fontSize: 14,
  },
  keyboardSpacer: {
    height: 80,
  },

  // ================= STYLES CHO MODAL POP-UP =================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: '#a7f3d0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIconEmoji: {
    fontSize: 34,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  highlightText: {
    fontWeight: '800',
    color: '#6d28d9',
  },
  accountInfoBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  infoValueRole: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
  },
  modalLoginButton: {
    width: '100%',
    minHeight: 50,
    backgroundColor: '#6d28d9',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalLoginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RegisterScreen;
