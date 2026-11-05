import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
  action: 'edit' | 'delete';
  onPress: () => void;
}

const ActionIconButton = ({ action, onPress }: Props) => {
  const isEdit = action === 'edit';

  return (
    <TouchableOpacity
      style={[styles.button, isEdit ? styles.editButton : styles.deleteButton]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={isEdit ? 'Sửa' : 'Xóa'}
      hitSlop={4}
    >
      <Text style={styles.icon}>{isEdit ? '✏️' : '🗑️'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  icon: {
    fontSize: 19,
    lineHeight: 24,
    includeFontPadding: false,
  },
  editButton: {
    backgroundColor: '#0f766e',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
});

export default ActionIconButton;
