// src/components/admin/AdminCategoryScreen.tsx
// Chức năng 16: Quản trị Loại sản phẩm
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
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../../database/projectDb';
import { Category } from '../../database/types';
import ActionIconButton from '../ActionIconButton';

interface AdminCategoryScreenProps {
  onBack?: () => void;
}

const AdminCategoryScreen: React.FC<AdminCategoryScreenProps> = ({ onBack }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const list = await fetchCategories();
    setCategories(list);
  };

  const clearForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên loại sản phẩm!');
      return;
    }

    if (editingId !== null) {
      await updateCategory({
        id: editingId,
        name: name.trim(),
        description: description.trim(),
      });
      Alert.alert('Thành công', 'Đã cập nhật loại sản phẩm!');
    } else {
      await addCategory(name.trim(), description.trim());
      Alert.alert('Thành công', 'Đã thêm loại sản phẩm mới!');
    }
    clearForm();
    loadCategories();
  };

  const handleEdit = (cat: Category) => {
    setName(cat.name);
    setDescription(cat.description || '');
    setEditingId(cat.id);
  };

  const handleDelete = (cat: Category) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa loại sản phẩm "${cat.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(cat.id);
            if (editingId === cat.id) clearForm();
            loadCategories();
          },
        },
      ]
    );
  };

  const renderCategoryItem = ({ item, index }: { item: Category; index: number }) => (
    <View style={styles.catCard}>
      <View style={styles.catInfo}>
        <Text style={styles.catName}>{index + 1}. {item.name}</Text>
        <Text style={styles.catDesc} numberOfLines={1}>
          {item.description || 'Không có mô tả'}
        </Text>
      </View>
      <View style={styles.catActions}>
        <ActionIconButton action="edit" onPress={() => handleEdit(item)} />
        <ActionIconButton action="delete" onPress={() => handleDelete(item)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.btnBack} onPress={onBack}>
            <Text style={styles.btnBackText}>Quay lại</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>QUẢN LÝ LOẠI SẢN PHẨM</Text>
      </View>

      <View style={styles.content}>
        {/* Form thêm/sửa */}
        <View style={styles.formBox}>
          <Text style={styles.formTitle}>
            {editingId !== null ? 'Cập nhật loại sản phẩm' : 'Thêm loại sản phẩm mới'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên loại sản phẩm"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập mô tả (không bắt buộc)"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.btnRow}>
            {editingId !== null && (
              <TouchableOpacity style={styles.btnCancel} onPress={clearForm}>
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={styles.btnSaveText}>
                {editingId !== null ? 'Cập nhật' : '➕ Thêm loại'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách loại sản phẩm */}
        <View style={styles.listBox}>
          <Text style={styles.listTitle}>
            Danh sách loại sản phẩm ({categories.length})
          </Text>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Chưa có loại sản phẩm nào</Text>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminCategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  formBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
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
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  btnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 2,
  },
  btnCancel: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnCancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  btnSave: {
    backgroundColor: '#198754',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  listBox: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  catCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: 0,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  catInfo: {
    flex: 1,
    minWidth: 0,
  },
  catName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    flexShrink: 1,
  },
  catDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  catActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
