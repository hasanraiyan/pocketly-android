import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IconRenderer from '../../common/IconRenderer';

export default function CategoryItem({ cat, onMore }) {
  return (
    <View style={styles.cardSmall}>
      <View style={[styles.iconCircleSmall, { backgroundColor: cat.color || '#1f644e' }]}>
        <IconRenderer name={cat.icon} size={16} color="#fff" />
      </View>
      <Text style={styles.catNameSmall} numberOfLines={1}>{cat.name}</Text>
      <TouchableOpacity onPress={() => onMore(cat)} style={styles.moreBtnSmall}>
        <Ionicons name="ellipsis-vertical" size={16} color="#7c8e88" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSmall: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 16, padding: 12, gap: 12 
  },
  iconCircleSmall: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catNameSmall: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1e3a34' },
  moreBtnSmall: { padding: 4 },
});
