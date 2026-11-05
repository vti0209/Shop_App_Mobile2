// Danh sách sản phẩm hiển thị bằng FlatList
import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  initDatabase,
  fetchCategories,
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
  Category,
  searchProductsByNameOrCategory,
} from './database';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { getProductImageSource } from '../utils/imageHelper';
import ActionIconButton from './ActionIconButton';

const Sanpham3Sqlite = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    initDatabase(() => {
      loadData();
    });
  }, []);

  const loadData = async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setProducts(prods.reverse());
  };

  const handleAddOrUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên sản phẩm!');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Thông báo', 'Giá sản phẩm phải là số lớn hơn 0!');
      return;
    }

    const productData = {
      name: name.trim(),
      price: numPrice,
      img: imageUri || 'sanpham1.png',
      categoryId,
    };

    try {
      if (editingId !== null) {
        await updateProduct({ id: editingId, ...productData });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm!');
        setEditingId(null);
      } else {
        await addProduct(productData);
        Alert.alert('Thành công', 'Đã thêm sản phẩm mới!');
      }
      setName('');
      setPrice('');
      setCategoryId(categories[0]?.id || 1);
      setImageUri(null);
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm!');
    }
  };

  const handleEdit = (id: number) => {
    const p = products.find((x) => x.id === id);
    if (p) {
      setName(p.name);
      setPrice(p.price.toString());
      setCategoryId(p.categoryId);
      setImageUri(p.img);
      setEditingId(p.id);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(id);
            if (editingId === id) {
              setName('');
              setPrice('');
              setImageUri(null);
              setEditingId(null);
            }
            loadData();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        setImageUri(response.assets[0].uri ?? null);
      }
    });
  };

  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim() === '') {
      loadData();
    } else {
      const results = await searchProductsByNameOrCategory(keyword);
      setProducts(results.reverse());
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const categoryName = categories.find((c) => c.id === item.categoryId)?.name;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <Image
            source={getProductImageSource(item.img)}
            style={styles.image}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardInfo}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>
            {item.price.toLocaleString('vi-VN')} đ
          </Text>
          {categoryName ? (
            <Text style={styles.categoryTag}>Loại: {categoryName}</Text>
          ) : null}
        </TouchableOpacity>

        <View style={styles.actionColumn}>
          <ActionIconButton action="edit" onPress={() => handleEdit(item.id)} />
          <ActionIconButton action="delete" onPress={() => handleDelete(item.id)} />
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Quản Lý Sản Phẩm</Text>

      {/* Form thêm / sửa sản phẩm */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập tên sản phẩm"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Nhập giá sản phẩm (VNĐ)"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={(value) => setCategoryId(value)}
            items={categories.map((c) => ({ label: c.name, value: c.id }))}
            value={categoryId}
            placeholder={{ label: '-- Chọn loại sản phẩm --', value: null }}
            style={{
              inputAndroid: styles.pickerInput,
              inputIOS: styles.pickerInput,
            }}
          />
        </View>

        {/* Nút chọn ảnh */}
        <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
          <Text style={styles.imagePickerText}>
            {imageUri ? 'Chọn lại hình ảnh' : 'Chọn hình ảnh từ máy'}
          </Text>
        </TouchableOpacity>

        {imageUri && (
          <Image
            source={getProductImageSource(imageUri)}
            style={styles.selectedImagePreview}
          />
        )}

        <View style={styles.buttonRow}>
          {editingId !== null && (
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={() => {
                setName('');
                setPrice('');
                setImageUri(null);
                setEditingId(null);
              }}
            >
              <Text style={styles.btnCancelText}>Hủy</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btnSubmit, editingId !== null && styles.btnSubmitEdit]}
            onPress={handleAddOrUpdate}
          >
            <Text style={styles.btnSubmitText}>
              {editingId ? 'Cập nhật sản phẩm' : '➕ Thêm sản phẩm'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ô tìm kiếm */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên sản phẩm hoặc loại..."
          placeholderTextColor="#94a3b8"
          value={searchKeyword}
          onChangeText={handleSearch}
        />
      </View>

      <Text style={styles.listHeading}>
        Danh sách sản phẩm ({products.length})
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 14,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginVertical: 10,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  pickerInput: {
    fontSize: 14,
    paddingHorizontal: 12,
    color: '#1e293b',
  },
  imagePickerBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  selectedImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btnCancel: {
    backgroundColor: '#94a3b8',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
  btnCancelText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnSubmit: {
    backgroundColor: '#2563eb',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  btnSubmitEdit: {
    backgroundColor: '#16a34a',
  },
  btnSubmitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  searchBox: {
    marginBottom: 12,
  },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  listHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#f1f5f9',
  },
  cardInfo: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  productName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  productPrice: {
    color: '#e11d48',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryTag: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
  },
  actionColumn: {
    justifyContent: 'center',
    gap: 8,
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
    fontStyle: 'italic',
  },
});

export default Sanpham3Sqlite;
