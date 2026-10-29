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
  SafeAreaView,
  TextInput,
} from 'react-native';
import { fetchUsers, updateUserRole, deleteUser, addUser } from '../../database/projectDb';
import { User } from '../../database/types';

interface AdminUserScreenProps {
  onBack?: () => void;
}

const AdminUserScreen: React.FC<AdminUserScreenProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const list = await fetchUsers();
    setUsers(list);
  };

  const handleAddUser = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }

    const success = await addUser({
      username: username.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      role: role,
    });

    if (success) {
      Alert.alert('Thành công', 'Đã thêm người dùng mới!');
      setUsername('');
      setPassword('');
      setFullName('');
      setShowAddForm(false);
      loadUsers();
    } else {
      Alert.alert('Lỗi', 'Tên đăng nhập đã tồn tại!');
    }
  };

  const handleToggleRole = (user: User) => {
    if (user.username === 'admin') {
      Alert.alert('Cảnh báo', 'Không thể đổi quyền tài khoản Admin gốc!');
      return;
    }

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    Alert.alert(
      'Xác nhận',
      `Đổi quyền của "${user.username}" thành [${newRole.toUpperCase()}]?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            await updateUserRole(user.id, newRole);
            loadUsers();
          },
        },
      ]
    );
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
            await deleteUser(user.id);
            loadUsers();
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item, index }: { item: User; index: number }) => {
    const isAdmin = item.role === 'admin';

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.userRow}>
            <Text style={styles.usernameText}>{index + 1}. {item.username}</Text>
            <View style={[styles.roleBadge, isAdmin ? styles.roleAdmin : styles.roleUser]}>
              <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.userFullName}>
            Họ tên: {item.fullName || 'Chưa cập nhật'}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.btnRole} onPress={() => handleToggleRole(item)}>
            <Text style={styles.btnActionText}>Đổi quyền</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDelete} onPress={() => handleDeleteUser(item)}>
            <Text style={styles.btnActionText}>Xóa</Text>
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
            Danh sách người dùng ({users.length})
          </Text>
          <TouchableOpacity
            style={styles.btnAddToggle}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Text style={styles.btnAddToggleText}>
              {showAddForm ? 'Đóng' : '+ Thêm User'}
            </Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>Thêm người dùng mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              placeholderTextColor="#888"
              value={fullName}
              onChangeText={setFullName}
            />

            <View style={styles.roleRow}>
              <Text style={styles.roleLabel}>Vai trò:</Text>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
                onPress={() => setRole('user')}
              >
                <Text style={[styles.roleBtnText, role === 'user' && styles.roleBtnTextActive]}>
                  User
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]}
                onPress={() => setRole('admin')}
              >
                <Text style={[styles.roleBtnText, role === 'admin' && styles.roleBtnTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btnSave} onPress={handleAddUser}>
              <Text style={styles.btnSaveText}>Lưu người dùng</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={{ paddingBottom: 20 }}
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
  },
  content: {
    flex: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
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
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 8,
    backgroundColor: '#fff',
    fontSize: 13,
    color: '#000',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleLabel: {
    fontSize: 13,
    color: '#333',
    marginRight: 10,
  },
  roleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  roleBtnActive: {
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
  },
  roleBtnText: {
    fontSize: 12,
    color: '#333',
  },
  roleBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  btnSave: {
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
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usernameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleAdmin: {
    backgroundColor: '#dc3545',
  },
  roleUser: {
    backgroundColor: '#0d6efd',
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userFullName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  btnRole: {
    backgroundColor: '#0dcaf0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  btnDelete: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  btnActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
