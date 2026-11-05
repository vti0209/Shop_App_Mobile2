import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminHomeScreen from './AdminHomeScreen';
import AdminUserScreen from './AdminUserScreen';
import AdminCategoryScreen from './AdminCategoryScreen';
import AdminProductScreen from './AdminProductScreen';
import AdminOrdersScreen from './AdminOrdersScreen';

export type AdminTabParamList = {
  Overview: undefined;
  Users: undefined;
  Categories: undefined;
  Products: undefined;
  Orders: undefined;
};

type TabIconProps = { focused: boolean };

const Tab = createBottomTabNavigator<AdminTabParamList>();

const OverviewTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>🏡</Text>
);

const UsersTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>🧑‍🤝‍🧑</Text>
);

const CategoriesTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>📃</Text>
);

const ProductsTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>📋</Text>
);

const OrdersTabIcon = ({ focused }: TabIconProps) => (
  <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>📦</Text>
);

const AdminTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const tabBarStyle = {
    ...styles.tabBar,
    height: 65 + insets.bottom,
    paddingBottom: 12 + insets.bottom,
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6d28d9',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Overview"
        component={AdminHomeScreen}
        options={{
          title: 'Tổng quan',
          tabBarLabel: 'Tổng quan',
          tabBarIcon: OverviewTabIcon,
        }}
      />
      <Tab.Screen
        name="Users"
        component={AdminUserScreen}
        options={{
          title: 'Người dùng',
          tabBarLabel: 'User',
          tabBarIcon: UsersTabIcon,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={AdminCategoryScreen}
        options={{
          title: 'Danh mục',
          tabBarLabel: 'Danh mục',
          tabBarIcon: CategoriesTabIcon,
        }}
      />
      <Tab.Screen
        name="Products"
        component={AdminProductScreen}
        options={{
          title: 'Sản phẩm',
          tabBarLabel: 'Sản phẩm',
          tabBarIcon: ProductsTabIcon,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={AdminOrdersScreen}
        options={{
          title: 'Quản lý hàng',
          tabBarLabel: 'Hàng',
          tabBarIcon: OrdersTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
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

export default AdminTabNavigator;
