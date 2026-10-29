// BƯỚC THÊM 1: Import các thành phần dùng cho form, thông báo và cuộn
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { launchImageLibrary } from 'react-native-image-picker'
import RNPickerSelect from 'react-native-picker-select'


// BƯỚC THÊM 2: Import các hàm thao tác database
import { initDatabase, fetchProducts, fetchCategories, addProduct, updateProduct, deleteProduct, Product, Category } from './database'

const ProductSqlite = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // BƯỚC THÊM 3: State lưu thông tin form và sản phẩm đang sửa
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [img, setImg] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(()=>{
    initDatabase(()=>{
        loadData();
    })
  },[])
 
  const loadData = async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setProducts(prods.reverse()); // Đảo ngược mảng để hiển thị sản phẩm mới lên đầu
  };

  // BƯỚC THÊM 4: Hàm xóa dữ liệu trong form
  const clearForm = () => {
    setName('');
    setPrice('');
    setImg('');
    setEditId(null);
  };

  // BƯỚC THÊM 5: Hàm thêm mới hoặc cập nhật sản phẩm
  const handleSave = async () => {
    if (name.trim() === '' || price.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập tên và giá sản phẩm!');
      return;
    }

    const productPrice = Number(price);

    if (!Number.isFinite(productPrice) || productPrice <= 0) {
      Alert.alert('Thông báo', 'Giá sản phẩm phải lớn hơn 0!');
      return;
    }

    try {
      if (editId !== null) {
        const oldProduct = products.find(item => item.id === editId);

        if (!oldProduct) {
          Alert.alert('Thông báo', 'Không tìm thấy sản phẩm!');
          return;
        }
        if (selectedCategory === null) {
          Alert.alert('Thông báo', 'Vui lòng chọn danh mục!');
          return;
        }
        await updateProduct({
          ...oldProduct,
          name: name.trim(),
          price: productPrice,
          img: img,
          categoryId: selectedCategory,
        });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm!');
      } else {
        if (selectedCategory === null) {
          Alert.alert('Thông báo', 'Vui lòng chọn danh mục!');
          return;
        }
        if (img === '') {
          Alert.alert('Thông báo', 'Vui lòng chọn ảnh sản phẩm!');
          return;
        }
        await addProduct({
          name: name.trim(),
          price: productPrice,
          img: img,
          categoryId: selectedCategory,
        });
        Alert.alert('Thành công', 'Đã thêm sản phẩm!');
      }
      clearForm();
      await loadData();
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm!');
    }
  };

  // BƯỚC THÊM 6: Lấy thông tin sản phẩm lên form để sửa
  const handleEdit = (item: Product) => {
    setName(item.name);
    setPrice(item.price.toString());
    setImg(item.img);
    setEditId(item.id);
    setSelectedCategory(item.categoryId);
  };

  // BƯỚC THÊM 7: Xác nhận và xóa sản phẩm
  const handleDelete = (id: number) => {
    Alert.alert('Xác nhận xóa', 'Bạn có muốn xóa sản phẩm này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteProduct(id);

          if (editId === id) {
            clearForm();
          }

          await loadData();
          Alert.alert('Thông báo', 'Đã xóa sản phẩm!');
        },
      },
    ]);
  };

  // BƯỚC THÊM 8: Ánh xạ URI hoặc ảnh tĩnh trong thư mục images
  const getImageSource = (imagePath: string) => {
    if (imagePath.startsWith('file://')) {
      return { uri: imagePath };
    }

    switch (imagePath) {
      case 'sanpham1.png':
        return require('../assets/images/sanpham1.png');
      case 'sanpham2.png':
        return require('../assets/images/sanpham2.png');
      case 'sanpham3.png':
        return require('../assets/images/sanpham3.png');
      default:
        return require('../assets/images/sanpham2.png');
    }
  };
  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }

        const imageUri = response.assets?.[0]?.uri;
        if (imageUri) {
          setImg(imageUri);
        }
      },
    );
  };

  // BƯỚC THÊM 9: Hiển thị sản phẩm theo từng hàng trong bảng
  const renderItem = ({ item, index }: { item: Product; index: number }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.sttCell]}>{index + 1}</Text>
      <View style={styles.productCell}>
        <Image source={getImageSource(item.img)} style={styles.tableImage} />
        <Text style={styles.tableName}>{item.name}</Text>
      </View>
      <Text style={[styles.tableCell, styles.priceCell]}>{item.price.toLocaleString()} đ</Text>
      <View style={[styles.tableCell, styles.actionCell]}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


return (
  <View style={styles.container}>
    <Text style={styles.title}>QUẢN LÝ SẢN PHẨM</Text>

    <View style={styles.contentArea}>

      {/* BƯỚC THÊM 10: Form nhập tên và giá sản phẩm */}
      <View style={styles.formSection}>
        <ScrollView
          style={styles.formScroll}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {editId !== null ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            </Text>

            <Text style={styles.label}>Tên sản phẩm</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên sản phẩm"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Giá sản phẩm</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập giá sản phẩm"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Danh mục sản phẩm</Text>
            <RNPickerSelect
              placeholder={{ label: 'Chọn danh mục...', value: null }}
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
              items={categories.map((category) => ({
                label: category.name,
                value: category.id,
                key: category.id.toString(),
              }))}
              style={{
                inputIOS: styles.pickerInput,
                inputAndroid: styles.pickerInput,
                placeholder: {
                  color: '#94a3b8',
                },
              }}
            />

            {/* BƯỚC THÊM 11: Chọn ảnh sản phẩm */}
            <Text style={styles.label}> Ảnh sản phẩm</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
            >
              <Text style={styles.buttonText}>Up ảnh thư viện</Text>
            </TouchableOpacity>

            {/* Hiển thị ảnh sau khi chọn */}
            {img !== '' && (
              <Image
                source={getImageSource(img)}
                style={styles.imagePreview}
              />
            )}

            {/* BƯỚC THÊM 12: Nút thêm, cập nhật và hủy sửa */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>
                {editId !== null ? 'Cập nhật sản phẩm' : '+ Thêm sản phẩm'}
              </Text>
            </TouchableOpacity>

            {editId !== null && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={clearForm}
              >
                <Text style={styles.buttonText}>Hủy sửa</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      {/* BƯỚC THÊM 13: Tiêu đề và bảng danh sách sản phẩm */}
      <View style={styles.listSection}>
        <Text style={styles.listTitle}>
          Danh sách sản phẩm ({products.length})
        </Text>

        {/* BƯỚC THÊM 14: ScrollView giúp cuộn bảng khi có nhiều sản phẩm */}
        <ScrollView
          style={styles.tableScroll}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.table}>
            {/* Tiêu đề các cột */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.sttCell]}>STT</Text>
              <Text style={[styles.headerCell, styles.productHeader]}>
                Sản phẩm
              </Text>
              <Text style={[styles.headerCell, styles.priceCell]}>Giá</Text>
              <Text style={[styles.headerCell, styles.actionHeader]}>
                Thao tác
              </Text>
            </View>

            {/* Danh sách sản phẩm; tắt cuộn riêng của FlatList */}
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Không có sản phẩm nào
                </Text>
              }
            />
          </View>
        </ScrollView>
      </View>

    </View>
  </View>
)
}

export default ProductSqlite

// BƯỚC THÊM 15: Style cho giao diện chung và form
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, marginTop: 15, backgroundColor: '#f4f6f9' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#1e293b' },

  // BƯỚC THÊM: Vùng chứa form và danh sách, chia đều 50:50
  contentArea: { flex: 1, minHeight: 0 },
  formSection: { flex: 1, minHeight: 0, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' },
  formScroll: { flex: 1 },

  form: { backgroundColor: '#fff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#334155' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#475569' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 12, backgroundColor: '#fff' },
  imageOptions: { marginBottom: 12 },
  imageOption: { borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 8, padding: 3, marginRight: 10 },
  imageSelected: { borderColor: '#2563eb' },
  optionImage: { width: 65, height: 65, borderRadius: 5 },
  imagePreview: { width: 120, height: 120, resizeMode: 'cover', marginTop: 10, marginBottom: 10, borderRadius: 8 },
  saveButton: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 7, alignItems: 'center', alignSelf: 'flex-end', marginTop: 5 },
  uploadButton: { backgroundColor: '#009b27', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 7, alignSelf: 'flex-start', marginTop: 5 },
  cancelButton: { backgroundColor: '#64748b', padding: 10, borderRadius: 7, alignItems: 'center', marginTop: 8 },

  // BƯỚC THÊM: Vùng danh sách chiếm 50% chiều cao
  listSection: { flex: 1, minHeight: 0, paddingTop: 8 },
  listTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#1e293b' },

  // BƯỚC THÊM 16: Style cho vùng cuộn và bảng
  tableScroll: { flex: 1, minHeight: 0 },
  table: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb', paddingVertical: 12 },
  headerCell: { color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 8 },
  tableCell: { fontSize: 11, textAlign: 'center', paddingHorizontal: 2 },
  sttCell: { width: 35 },
  productHeader: { flex: 1 },
  productCell: { flex: 1, alignItems: 'center', paddingHorizontal: 3 },
  tableImage: { width: 45, height: 45, resizeMode: 'contain' },
  tableName: { fontSize: 11, textAlign: 'center', marginTop: 3 },
  priceCell: { width: 85 },
  actionHeader: { width: 100, textAlign: 'center' },
  actionCell: { width: 100, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },

  // BƯỚC THÊM 17: Style cho các nút thao tác
  editButton: { backgroundColor: '#0d9488', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 5, marginRight: 5 },
  deleteButton: { backgroundColor: '#dc2626', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', padding: 15 },
  pickerInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 12, marginBottom: 12, backgroundColor: '#fff', color: '#334155' },
});
