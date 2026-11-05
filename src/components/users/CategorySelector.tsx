// Component danh sách các nút loại sản phẩm
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { Category } from '../../database/types';

interface Props {
  categories: Category[];
  selectedId: number;
  onSelect: (id: number) => void;
}

const CategorySelector = ({ categories, selectedId, onSelect }: Props) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isSelected = cat.id === selectedId;
        return (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.7}
            style={[styles.button, isSelected && styles.selectedButton]}
            onPress={() => onSelect(cat.id)}
          >
            <Text style={[styles.text, isSelected && styles.selectedText]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
    paddingRight: 4,
  },
  button: {
    flexShrink: 0,
    minHeight: 36,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  selectedButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  text: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default CategorySelector;
