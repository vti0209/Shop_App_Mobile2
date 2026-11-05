// Màn hình đăng ký tài khoản mới vào bảng users trong SQLite.
import React, { useState } from 'react';
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
import { addUser, initProjectDatabase } from '../database/projectDb';
import type { RootStackParamList } from './AppNavigatorProduct';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  // Bước 1: Khai báo trạng thái cho các trường đăng ký và trạng thái gửi biểu mẫu.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bước 2: Kiểm tra dữ liệu đầu vào trước khi ghi tài khoản mới.
  const handleRegister = async () => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường.');
      return;
    }
    if (normalizedUsername.length < 3) {
      Alert.alert('Tên đăng nhập chưa hợp lệ', 'Tên đăng nhập cần có ít nhất 3 ký tự.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mật khẩu chưa hợp lệ', 'Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Vui lòng nhập lại mật khẩu xác nhận.');
      return;
    }

    // Bước 3: Lưu tài khoản với quyền user; SQLite bảo vệ username bằng UNIQUE.
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
          'Tên đăng nhập có thể đã được sử dụng hoặc không thể lưu tài khoản.'
        );
        return;
      }

      // Bước 4: Quay về màn hình đăng nhập và điền sẵn tên tài khoản vừa tạo.
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login', params: { username: normalizedUsername } }],
      });
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      Alert.alert('Lỗi', 'Không thể tạo tài khoản lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Bước 5: Hiển thị biểu mẫu tạo tài khoản mới. */}
        <View style={styles.card}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Đăng ký để bắt đầu mua sắm.</Text>

          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập (ít nhất 3 ký tự)"
            placeholderTextColor="#94a3b8"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Tên đăng nhập"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Mật khẩu"
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor="#94a3b8"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            accessibilityLabel="Xác nhận mật khẩu"
          />

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isSubmitting}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </Text>
          </TouchableOpacity>

          {/* Bước 6: Cho phép người dùng quay lại màn hình đăng nhập. */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}> Đăng nhập</Text>
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
    padding: 16,
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

export default RegisterScreen;
