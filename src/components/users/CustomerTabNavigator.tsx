import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomerHomeScreen from './CustomerHomeScreen';
import { fetchCategories, initProjectDatabase } from '../../database/projectDb';
import type { Category } from '../../database/types';
import type { RootStackParamList } from '../AppNavigatorProduct';

type CustomerTabParamList = {
  Shop: { username?: string } | undefined;
  Categories: { username?: string } | undefined;
  Account: { username?: string } | undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const categoryIcons = ['🧴', '🍼', '🍲', '🧼', '💊'];
type TabIconProps = { color: string; size: number; focused: boolean };

const ShopTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>🛒</Text>
);

const CategoriesTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>📃</Text>
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
      <Text style={styles.title}>Danh mục sản phẩm</Text>
      <Text style={styles.subtitle}>Chọn danh mục để khám phá sản phẩm.</Text>
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
  route: { params?: { username?: string } };
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const username = route.params?.username;

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
    <View style={styles.screen}>
      <Text style={styles.title}>Tài khoản</Text>
      <View style={styles.accountCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <Text style={styles.accountName}>{username || 'Love'}</Text>
        <Text style={styles.accountCaption}>
          {username ? 'User' : 'Bạn chưa đăng nhập'}
        </Text>
      </View>
      {username ? (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
        >
          <Text style={styles.logoutEmoji}>↪</Text>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="button"
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const CustomerTabNavigator = ({
  route,
}: {
  route: { params?: { username?: string } };
}) => {
  const username = route.params?.username;
  const insets = useSafeAreaInsets();
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
        initialParams={{ username }}
        options={{
          title: 'Tạp hóa Vanw Tiet',
          tabBarLabel: 'Sản phẩm',
          tabBarIcon: ShopTabIcon,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        initialParams={{ username }}
        options={{
          title: 'Danh mục',
          tabBarLabel: 'Danh mục',
          tabBarIcon: CategoriesTabIcon,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        initialParams={{ username }}
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
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 32,
  },
  avatarEmoji: {
    fontSize: 20,
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
