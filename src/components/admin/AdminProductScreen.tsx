// src/components/admin/AdminProductScreen.tsx
// Chức năng 17: Quản trị Sản phẩm
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import {
  fetchProducts,
  fetchCategories,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../../database/projectDb';
import { Product, Category } from '../../database/types';
import { getProductImageSource } from '../../utils/imageHelper';

interface AdminProductScreenProps {
  onBack?: () => void;
}

const AdminProductScreen: React.FC<AdminProductScreenProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [img, setImg] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setProducts(prods);
  };

  const clearForm = () => {
    setName('');
    setPrice('');
    setImg('');
    setCategoryId(null);
    setEditingId(null);
  };

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return;
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setImg(uri);
        }
      }
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên sản phẩm!');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Thông báo', 'Giá sản phẩm phải lớn hơn 0!');
      return;
    }
    if (!categoryId) {
      Alert.alert('Thông báo', 'Vui lòng chọn loại sản phẩm!');
      return;
    }

    const imageToSave = img.trim() || 'sanpham1.png';

    try {
      if (editingId !== null) {
        await updateProduct({
          id: editingId,
          name: name.trim(),
          price: numPrice,
          img: imageToSave,
          categoryId: categoryId,
        });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm!');
      } else {
        await addProduct({
          name: name.trim(),
          price: numPrice,
          img: imageToSave,
          categoryId: categoryId,
        });
        Alert.alert('Thành công', 'Đã thêm sản phẩm mới!');
      }
      clearForm();
      loadData();
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm!');
    }
  };

  const handleEdit = (item: Product) => {
    setName(item.name);
    setPrice(item.price.toString());
    setImg(item.img);
    setCategoryId(item.categoryId);
    setEditingId(item.id);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(id);
            if (editingId === id) clearForm();
            loadData();
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <View style={styles.tableRow}>
      <Text style={styles.colIndex}>{index + 1}</Text>
      <View style={styles.colProduct}>
        <Image source={getProductImageSource(item.img)} style={styles.thumbImage} />
        <View style={styles.productTextGroup}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.categoryText}>{item.categoryName || 'Chưa phân loại'}</Text>
        </View>
      </View>
      <Text style={styles.colPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
      <View style={styles.colActions}>
        <TouchableOpacity style={styles.btnEdit} onPress={() => handleEdit(item)}>
          <Text style={styles.btnActionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.id)}>
          <Text style={styles.btnActionText}>Xóa</Text>
        </TouchableOpacity>
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
        <Text style={styles.title}>QUẢN LÝ SẢN PHẨM</Text>
      </View>

      <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Form nhập liệu */}
        <View style={styles.formBox}>
          <Text style={styles.formTitle}>
            {editingId !== null ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập tên sản phẩm"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Nhập giá sản phẩm"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          {/* Chọn loại sản phẩm */}
          <View style={styles.pickerBox}>
            <RNPickerSelect
              placeholder={{ label: '-- Chọn loại sản phẩm --', value: null }}
              value={categoryId}
              onValueChange={(val) => setCategoryId(val)}
              items={categories.map((c) => ({
                label: c.name,
                value: c.id,
                key: c.id.toString(),
              }))}
              style={{
                inputIOS: styles.pickerInput,
                inputAndroid: styles.pickerInput,
              }}
            />
          </View>

          {/* Chọn ảnh */}
          <TouchableOpacity style={styles.btnPickImg} onPress={handlePickImage}>
            <Text style={styles.btnPickImgText}>
              {img ? 'Chọn lại hình ảnh' : 'Chọn hình ảnh'}
            </Text>
          </TouchableOpacity>

          {img ? (
            <Image source={getProductImageSource(img)} style={styles.imagePreview} />
          ) : null}

          {/* Nút lưu & hủy */}
          <View style={styles.buttonRow}>
            {editingId !== null && (
              <TouchableOpacity style={styles.btnCancel} onPress={clearForm}>
                <Text style={styles.btnCancelText}>Hủy sửa</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
              <Text style={styles.btnSaveText}>
                {editingId !== null ? 'Cập nhật' : 'Thêm sản phẩm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.listBox}>
          <Text style={styles.listTitle}>
            Danh sách sản phẩm ({products.length})
          </Text>

          <View style={styles.tableHeader}>
            <Text style={styles.headIndex}>STT</Text>
            <Text style={styles.headProduct}>Sản phẩm</Text>
            <Text style={styles.headPrice}>Giá</Text>
            <Text style={styles.headActions}>Thao tác</Text>
          </View>

          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProductItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminProductScreen;

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
  scrollContent: {
    flex: 1,
    padding: 12,
  },
  formBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 10,
    color: '#000',
    fontSize: 14,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    height: 42,
    justifyContent: 'center',
    marginBottom: 10,
  },
  pickerInput: {
    fontSize: 14,
    paddingHorizontal: 10,
    color: '#000',
  },
  btnPickImg: {
    backgroundColor: '#6f42c1',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPickImgText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  imagePreview: {
    width: 70,
    height: 70,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnCancel: {
    backgroundColor: '#6c757d',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  btnCancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnSave: {
    backgroundColor: '#0d6efd',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  btnSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  listBox: {
    marginBottom: 30,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0d6efd',
    paddingVertical: 8,
    borderRadius: 4,
  },
  headIndex: { width: 35, color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  headProduct: { flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 12, paddingLeft: 6 },
  headPrice: { width: 85, color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'right', paddingRight: 6 },
  headActions: { width: 85, color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  colIndex: { width: 35, textAlign: 'center', fontSize: 12, color: '#555' },
  colProduct: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 6 },
  thumbImage: { width: 38, height: 38, borderRadius: 4, marginRight: 6 },
  productTextGroup: { flex: 1 },
  productName: { fontSize: 13, fontWeight: 'bold', color: '#000' },
  categoryText: { fontSize: 11, color: '#666' },
  colPrice: { width: 85, fontSize: 12, fontWeight: 'bold', color: '#d63384', textAlign: 'right', paddingRight: 6 },
  colActions: { width: 85, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  btnEdit: { backgroundColor: '#198754', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4 },
  btnDelete: { backgroundColor: '#dc3545', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4 },
  btnActionText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 15 },
});
