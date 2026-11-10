import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface LocationSelectModalProps {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  disabledHint?: string;
  onSelect: (value: string) => void;
  title: string;
}

export const LocationSelectModal: React.FC<LocationSelectModalProps> = ({
  label,
  required = true,
  value,
  placeholder,
  options,
  disabled = false,
  disabledHint = 'Vui lòng hoàn tất trường trước đó',
  onSelect,
  title,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.trim().toLowerCase();
    return options.filter((item) => item.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const handleOpen = () => {
    if (disabled) {
      Alert.alert('Chưa thể chọn', disabledHint);
      return;
    }
    setSearchQuery('');
    setModalVisible(true);
  };

  const handleSelectOption = (item: string) => {
    onSelect(item);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.selectorButton, disabled && styles.disabledButton]}
        onPress={handleOpen}
        activeOpacity={disabled ? 1 : 0.7}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
      >
        <Text
          style={[
            styles.selectorText,
            !value && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Text style={[styles.arrowIcon, disabled && styles.disabledArrow]}>
          {disabled ? '🔒' : '▼'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Đóng modal"
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp.</Text>
            }
            renderItem={({ item }) => {
              const isSelected = item === value;
              return (
                <TouchableOpacity
                  style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
                  onPress={() => handleSelectOption(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item}
                >
                  <Text
                    style={[styles.optionText, isSelected && styles.selectedOptionText]}
                  >
                    {item}
                  </Text>
                  {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#dc2626',
    fontWeight: '700',
  },
  selectorButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  selectorText: {
    fontSize: 14,
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: '#94a3b8',
  },
  disabledText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  arrowIcon: {
    fontSize: 12,
    color: '#64748b',
  },
  disabledArrow: {
    fontSize: 11,
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  closeButtonText: {
    fontSize: 15,
    color: '#6d28d9',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: '#0f172a',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  selectedOptionItem: {
    backgroundColor: '#f5f3ff',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  optionText: {
    fontSize: 15,
    color: '#1e293b',
    flex: 1,
  },
  selectedOptionText: {
    color: '#6d28d9',
    fontWeight: '700',
  },
  checkIcon: {
    color: '#6d28d9',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyText: {
    paddingVertical: 32,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
  },
});

export default LocationSelectModal;
