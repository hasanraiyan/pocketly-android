import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const getIconName = (icon) => {
  if (!icon) return 'pricetag';
  const name = icon.toLowerCase().replace(/[-_]/g, ' ');
  if (name.includes('food') || name.includes('pizza') || name.includes('utensils') || name.includes('restaurant') || name.includes('dining') || name.includes('coffee') || name.includes('cafe')) return 'fast-food';
  if (name.includes('car') || name.includes('bus') || name.includes('train') || name.includes('transport') || name.includes('fuel') || name.includes('gas') || name.includes('travel')) return 'car';
  if (name.includes('home') || name.includes('house') || name.includes('rent') || name.includes('bill') || name.includes('utility') || name.includes('water') || name.includes('electricity')) return 'home';
  if (name.includes('shopping') || name.includes('cart') || name.includes('bag') || name.includes('grocery') || name.includes('store') || name.includes('clothing')) return 'cart';
  if (name.includes('health') || name.includes('heart') || name.includes('medical') || name.includes('doctor') || name.includes('pharmacy') || name.includes('fitness') || name.includes('gym')) return 'heart';
  if (name.includes('gift') || name.includes('present') || name.includes('birthday') || name.includes('donation')) return 'gift';
  if (name.includes('salary') || name.includes('cash') || name.includes('money') || name.includes('income') || name.includes('dividend') || name.includes('interest')) return 'cash';
  if (name.includes('wallet') || name.includes('bank') || name.includes('savings')) return 'wallet';
  if (name.includes('entertainment') || name.includes('play') || name.includes('game') || name.includes('movie') || name.includes('music') || name.includes('hobby')) return 'game-controller';
  if (name.includes('education') || name.includes('book') || name.includes('school') || name.includes('tuition') || name.includes('learning')) return 'book';
  if (name.includes('personal') || name.includes('self') || name.includes('beauty') || name.includes('spa')) return 'person';
  if (name.includes('work') || name.includes('office') || name.includes('business')) return 'briefcase';
  if (name.includes('tax') || name.includes('government')) return 'receipt';
  if (name.includes('other') || name.includes('misc') || name.includes('extra')) return 'ellipsis-horizontal';
  return 'pricetag';
};

export default function CategoryItem({ cat, onMore }) {
  return (
    <View style={styles.cardSmall}>
      <View style={[styles.iconCircleSmall, { backgroundColor: cat.color || '#1f644e' }]}>
        <Ionicons name={getIconName(cat.icon)} size={16} color="#fff" />
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
