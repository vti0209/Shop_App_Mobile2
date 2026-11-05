// src/components/admin/AdminUserScreen.tsx
// Chức năng 15: Quản trị User
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  fetchUsers,
  updateUser,
  deleteUser,
  addUser,
} from '../../database/projectDb';
import { User } from '../../database/types';
import { getProductImageSource } from '../../utils/imageHelper';

interface AdminUserScreenProps {
  onBack?: () => void;
}

const AdminUserScreen: React.FC<AdminUserScreenProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('logo.png');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const list = await fetchUsers();
    setUsers(list.filter((user) => user.username !== 'admin'));
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setFullName('');
    setPhone('');
    setAvatar('logo.png');
    setEditingId(null);
  };

  const handleSaveUser = async () => {
    if (!username.trim() || (editingId === null && !password.trim())) {
      Alert.alert(
        'Thông báo',
        editingId !== null ? 'Vui lòng nhập tên đăng nhập!' : 'Vui lòng nhập tên đăng nhập và mật khẩu!'
      );
      return;
    }

    const success = editingId !== null
      ? await updateUser(editingId, {
        username: username.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatar,
        password: password.trim() || undefined,
      })
      : await addUser({
        username: username.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatar,
        role: 'user',
      });

    if (success) {
      Alert.alert('Thành công', editingId !== null ? 'Đã cập nhật người dùng!' : 'Đã thêm người dùng mới!');
      clearForm();
      setShowAddForm(false);
      loadUsers();
    } else {
      Alert.alert('Lỗi', editingId !== null ? 'Không thể cập nhật người dùng. Tên đăng nhập có thể đã tồn tại.' : 'Tên đăng nhập đã tồn tại!');
    }
  };

  const handleEditUser = (user: User) => {
    setUsername(user.username);
    setPassword('');
    setFullName(user.fullName || '');
    setPhone(user.phone || '');
    setAvatar(user.avatar || 'logo.png');
    setEditingId(user.id);
    setShowAddForm(true);
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

  const handleDeleteUser = (user: User) => {
    if (user.username === 'admin') {
      Alert.alert('Cảnh báo', 'Không thể xóa tài khoản Admin gốc!');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa tài khoản "${user.username}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUser(user.id);
            if (!success) {
              Alert.alert('Lỗi', 'Không thể xóa người dùng.');
              return;
            }
            loadUsers();
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item, index }: { item: User; index: number }) => {
    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.userRow}>
            <Text style={styles.usernameText} numberOfLines={1}>
              {index + 1}. {item.username}
            </Text>
            <View style={[styles.roleBadge, item.role === 'admin' ? styles.roleAdmin : styles.roleUser]}>
              <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.userFullName}>
            Họ tên: {item.fullName || 'Chưa cập nhật'}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton]}
            onPress={() => handleEditUser(item)}
            accessibilityRole="button"
            accessibilityLabel="Sửa"
            hitSlop={4}
          >
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton]}
            onPress={() => handleDeleteUser(item)}
            accessibilityRole="button"
            accessibilityLabel="Xóa"
            hitSlop={4}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.btnBack} onPress={onBack}>
            <Text style={styles.btnBackText}>Quay lại</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>QUẢN LÝ USER</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.listTitle}>
            Danh sách ({users.length})
          </Text>
          <TouchableOpacity
            style={styles.btnAddToggle}
            onPress={() => {
              if (showAddForm) {
                clearForm();
                setShowAddForm(false);
              } else {
                clearForm();
                setShowAddForm(true);
              }
            }}
          >
            <Text style={styles.btnAddToggleText}>
              {showAddForm ? 'Đóng' : '✍️ Thêm '}
            </Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>
              {editingId !== null ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder={editingId !== null ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              placeholderTextColor="#94a3b8"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              placeholderTextColor="#94a3b8"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.avatarEditRow}>
              <Image source={getProductImageSource(avatar)} style={styles.avatarPreview} />
              <TouchableOpacity style={styles.avatarPicker} onPress={handlePickAvatar}>
                <Text style={styles.avatarPickerText}>Chọn ảnh đại diện</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formActions}>
              {editingId !== null && (
                <TouchableOpacity
                  style={styles.btnCancel}
                  onPress={() => {
                    clearForm();
                    setShowAddForm(false);
                  }}
                >
                  <Text style={styles.btnCancelText}>Hủy</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveUser}>
                <Text style={styles.btnSaveText}>
                  {editingId !== null ? 'Cập nhật' : 'Lưu người dùng'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có người dùng nào</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default AdminUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  btnBack: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 10,
  },
  btnBackText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flexShrink: 1,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  listTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  btnAddToggle: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  btnAddToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
    height: 44,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#1e293b',
  },
  btnSave: {
    flex: 1,
    backgroundColor: '#198754',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  avatarEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatarPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  avatarPicker: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#ede9fe',
    borderRadius: 8,
  },
  avatarPickerText: {
    color: '#6d28d9',
    fontSize: 13,
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  usernameText: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleUser: {
    backgroundColor: '#0d6efd',
  },
  roleAdmin: {
    backgroundColor: '#dc3545',
  },
  roleText: {
    color: '#fff',
    fontSize: 5,
    fontWeight: 'bold',
  },
  userFullName: {
    fontSize: 10,
    color: '#7e0000',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    maxWidth: '62%',
  },
  actionButton: {
    minWidth: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 19,
    lineHeight: 24,
    includeFontPadding: false,
  },
  btnCancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
