// Màn hình đăng nhập dùng tài khoản đã lưu trong SQLite.
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getUserByCredentials, initProjectDatabase } from '../database/projectDb';
import { useAuth } from './users/AuthContext';
import type { RootStackParamList } from './AppNavigatorProduct';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation, route }: Props) => {
  const { setCurrentUser } = useAuth();
  // Bước 1: Khởi tạo trạng thái biểu mẫu; có thể điền sẵn tên sau khi đăng ký.
  const [username, setUsername] = useState(route.params?.username ?? '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingDatabase, setIsPreparingDatabase] = useState(true);

  // Bước 2: Khởi tạo database dùng chung cho đăng nhập, quản trị và sản phẩm.
  useEffect(() => {
    initProjectDatabase().then(() => setIsPreparingDatabase(false));
  }, []);

  // Bước 3: Đồng bộ tên tài khoản nếu màn hình nhận tham số mới.
  useEffect(() => {
    if (route.params?.username) {
      setUsername(route.params.username);
    }
  }, [route.params?.username]);

  // Bước 4: Kiểm tra dữ liệu và xác thực tài khoản trong database dự án.
  const handleLogin = async () => {
    if (isPreparingDatabase) {
      Alert.alert('Vui lòng đợi', 'Ứng dụng đang chuẩn bị dữ liệu.');
      return;
    }

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await getUserByCredentials(normalizedUsername, password);
      if (!user) {
        Alert.alert('Đăng nhập thất bại', 'Tên đăng nhập hoặc mật khẩu không đúng.');
        return;
      }

      // Bước 5: Điều hướng theo quyền và xóa màn hình đăng nhập khỏi lịch sử.
      setCurrentUser(user);
      navigation.reset({
        index: 0,
        routes: [
          user.role === 'admin'
            ? {
                name: 'AdminHome',
                params: { username: user.username, fullName: user.fullName, userId: user.id },
              }
            : { name: 'CustomerTabs', params: { username: user.username, userId: user.id } },
        ],
      });
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      Alert.alert('Lỗi', 'Không thể đăng nhập lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Bước 6: Hiển thị biểu mẫu đăng nhập trước khi vào các chức năng chính. */}
        <View style={styles.card}>
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để mua sắm.</Text>

          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#94a3b8"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Tên đăng nhập"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Mật khẩu"
          />

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isSubmitting || isPreparingDatabase}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {isPreparingDatabase
                ? 'Đang tải dữ liệu...'
                : isSubmitting
                  ? 'Đang đăng nhập...'
                  : 'Đăng nhập'}
            </Text>
          </TouchableOpacity>

          {/* Bước 5: Cho phép chuyển sang biểu mẫu tạo tài khoản mới. */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}> Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 48,
  },
  card: {
    padding: 20,
    minWidth: 0,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 22,
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    marginBottom: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    fontSize: 12,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: '#2563eb',
    borderRadius: 10,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#64748b',
    flexShrink: 1,
    textAlign: 'center',
  },
  link: {
    color: '#2563eb',
    fontWeight: '700',
  },
});

export default LoginScreen;
