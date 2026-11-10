import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomerHomeScreen from './CustomerHomeScreen';
import CartScreen from './CartScreen';
import ProfileSettingsScreen from './ProfileSettingsScreen';
import { useCart } from './CartContext';
import { fetchCategories, initProjectDatabase } from '../../database/projectDb';
import type { Category } from '../../database/types';
import type { RootStackParamList } from '../AppNavigatorProduct';
import NotificationBell from './NotificationBell';

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
      <Text style={styles.subtitle}>Chọn danh mục để khám phá các sản phẩm.</Text>
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
        headerRight: () => <NotificationBell userId={userId} />,
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
          title: 'Thanh toán & Giỏ hàng',
          tabBarLabel: 'Giỏ hàng',
          tabBarIcon: CartTabIcon,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileSettingsScreen}
        initialParams={{ username, userId }}
        options={{
          title: 'Hồ sơ & Cài đặt',
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
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  chevron: {
    fontSize: 22,
    color: '#94a3b8',
    marginLeft: 8,
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e2e8f0',
    borderTopWidth: 1,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.65,
  },
  tabEmojiActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
});

export default CustomerTabNavigator;
