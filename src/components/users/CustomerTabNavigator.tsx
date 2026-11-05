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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomerHomeScreen from './CustomerHomeScreen';
import CartScreen from './CartScreen';
import { useCart } from './CartContext';
import {
  fetchCategories,
  getUserById,
  getUserByUsername,
  initProjectDatabase,
  updateUserProfile,
} from '../../database/projectDb';
import type { Category } from '../../database/types';
import type { RootStackParamList } from '../AppNavigatorProduct';
import { getProductImageSource } from '../../utils/imageHelper';

export type CustomerTabParamList = {
  Shop: { username?: string; userId?: number } | undefined;
  Categories: { username?: string; userId?: number } | undefined;
  Cart: { username?: string; userId?: number } | undefined;
  Account: { username?: string; userId?: number } | undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const categoryIcons = ['🧴', '🍼', '🍲', '🧼', '💊'];
type TabIconProps = { color: string; size: number; focused: boolean };

const ShopTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>🏡</Text>
);

const CategoriesTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>📃</Text>
);

const CartTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>🛒</Text>
);

const AccountTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>🐨</Text>
);

const CategoriesScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    initProjectDatabase(() => {
      fetchCategories().then(setCategories);
    });
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.subtitle}>Chọn danh mục để khám phá.</Text>
      {categories.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryCard}
          onPress={() =>
            navigation.navigate('ProductsByCategory', {
              categoryId: category.id,
              categoryName: category.name,
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`Xem sản phẩm ${category.name}`}
        >
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryEmoji}>
              {categoryIcons[index % categoryIcons.length]}
            </Text>
          </View>
          <Text style={styles.categoryName} numberOfLines={2}>
            {category.name}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AccountScreen = ({
  route,
}: {
  route: { params?: { username?: string; userId?: number } };
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const username = route.params?.username;
  const userId = route.params?.userId;
  const [user, setUser] = useState<Awaited<ReturnType<typeof getUserById>>>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('logo.png');

  useEffect(() => {
    const loadUser = userId
      ? getUserById(userId)
      : username
        ? getUserByUsername(username)
        : Promise.resolve(null);
    loadUser.then((loadedUser) => {
      setUser(loadedUser);
      setEditUsername(loadedUser?.username || '');
      setFullName(loadedUser?.fullName || '');
      setPhone(loadedUser?.phone || '');
      setAvatar(loadedUser?.avatar || 'logo.png');
    }).catch((error: unknown) => {
      console.error('Không thể tải hồ sơ người dùng:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin tài khoản.');
    });
  }, [userId, username]);

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

  const handleSaveProfile = async () => {
    if (!user || !editUsername.trim()) {
      Alert.alert('Thiếu thông tin', 'Tên đăng nhập không được để trống.');
      return;
    }

    const success = await updateUserProfile(user.id, {
      username: editUsername.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      avatar,
    });
    if (!success) {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ. Tên đăng nhập có thể đã tồn tại.');
      return;
    }

    setUser({ ...user, username: editUsername.trim(), fullName: fullName.trim(), phone: phone.trim(), avatar });
    setIsEditing(false);
    Alert.alert('Thành công', 'Thông tin tài khoản đã được cập nhật.');
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Ở lại', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.accountContent}>
      <View style={styles.accountCard}>
        <Image
          source={getProductImageSource(user?.avatar || 'logo1.png')}
          style={styles.avatar}
        />
        {user && isEditing && (
          <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar}>
            <Text style={styles.avatarButtonText}>Chọn ảnh đại diện</Text>
          </TouchableOpacity>
        )}
        {user && isEditing ? (
          <View style={styles.profileFields}>
            <TextInput
              style={styles.profileInput}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Tên đăng nhập"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.profileInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Họ và tên"
            />
            <TextInput
              style={styles.profileInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
            />
          </View>
        ) : (
          <>
            <Text style={styles.accountName}>{user?.fullName || username || '!'}</Text>
            <Text style={styles.accountCaption}>@{user?.username || username || 'guest'}</Text>
            {user?.phone ? <Text style={styles.accountCaption}>{user.phone}</Text> : null}
          </>
        )}
      </View>
      {user ? (
        <>
          {isEditing ? (
            <View style={styles.profileActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveProfileButton} onPress={handleSaveProfile}>
                <Text style={styles.profileButtonText}>Lưu thông tin</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.profileActionButton}
                onPress={() => setIsEditing(true)}
                accessibilityRole="button"
              >
                <Text style={styles.profileButtonText}>Chỉnh sửa thông tin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileActionButton}
                onPress={() => navigation.navigate('OrderHistory', { userId: user.id })}
                accessibilityRole="button"
              >
                <Text style={styles.profileButtonText}>Lịch sử mua hàng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                accessibilityRole="button"
              >
                <Text style={styles.logoutEmoji}>↪</Text>
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      ) : (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="button"
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const CustomerTabNavigator = ({
  route,
}: {
  route: { params?: { username?: string; userId?: number } };
}) => {
  const username = route.params?.username;
  const userId = route.params?.userId;
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();
  const tabBarStyle = {
    ...styles.tabBar,
    height: 65 + insets.bottom,
    paddingBottom: 12 + insets.bottom,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { color: '#0f172a', fontWeight: '700' },
        tabBarActiveTintColor: '#6d28d9',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Shop"
        component={CustomerHomeScreen}
        initialParams={{ username, userId }}
        options={{
          title: 'Tạp hóa Vanw Tiet',
          tabBarLabel: 'Sản phẩm',
          tabBarIcon: ShopTabIcon,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        initialParams={{ username, userId }}
        options={{
          title: 'Danh mục',
          tabBarLabel: 'Danh mục',
          tabBarIcon: CategoriesTabIcon,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        initialParams={{ username, userId }}
        options={{
          title: 'Giỏ hàng',
          tabBarLabel: 'Giỏ hàng',
          tabBarIcon: CartTabIcon,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        initialParams={{ username, userId }}
        options={{
          title: 'Tài khoản',
          tabBarLabel: 'Tài khoản',
          tabBarIcon: AccountTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  categoryCard: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  chevron: {
    color: '#94a3b8',
    fontSize: 26,
    lineHeight: 28,
    paddingHorizontal: 4,
  },
  categoryName: {
    flex: 1,
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '600',
  },
  accountCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
  },
  accountContent: {
    padding: 16,
    paddingBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    resizeMode: 'cover',
    borderRadius: 32,
  },
  avatarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    backgroundColor: '#ede9fe',
    borderRadius: 8,
  },
  avatarButtonText: {
    color: '#6d28d9',
    fontSize: 13,
    fontWeight: '700',
  },
  profileFields: {
    width: '100%',
    marginTop: 16,
  },
  profileInput: {
    minHeight: 44,
    paddingHorizontal: 12,
    marginBottom: 10,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 9,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  profileActionButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
  },
  saveProfileButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 10,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#64748b',
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  profileButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  accountName: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
  accountCaption: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#fff1f2',
    borderRadius: 12,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutEmoji: {
    color: '#dc2626',
    fontSize: 20,
  },
  loginButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  tabBar: {
    height: 65,
    paddingTop: 6,
    paddingBottom: 12,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabEmoji: {
    fontSize: 19,
    opacity: 0.75,
  },
  tabEmojiActive: {
    opacity: 1,
  },
});

export default CustomerTabNavigator;
