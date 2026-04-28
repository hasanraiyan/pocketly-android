import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { getAccountIconName } from './AccountForm';

const INR = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

export const iconColors = [
  { bg: '#ffedd5', text: '#f97316', border: '#fed7aa' }, // orange
  { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' }, // blue
  { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' }, // green
  { bg: '#f3e8ff', text: '#9333ea', border: '#e9d5ff' }, // purple
  { bg: '#fee2e2', text: '#ef4444', border: '#fecaca' }, // red
];

export default function AccountCard({ acc, index, onPress, onMore }) {
  const colorSet = iconColors[index % iconColors.length];
  const balance = acc.currentBalance ?? acc.initialBalance ?? acc.balance ?? 0;

  return (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress(acc)}
    >
      <View style={styles.cardTop}>
        <View style={[styles.cardIconBg, { backgroundColor: colorSet.bg, borderColor: colorSet.border }]}>
          {acc.icon === 'rupay' ? (
            <MaterialCommunityIcons name="credit-card-chip" size={22} color={colorSet.text} />
          ) : acc.icon === 'ippb' || acc.icon === 'pnb' ? (
            <FontAwesome5 name="university" size={18} color={colorSet.text} />
          ) : (
            <Ionicons name={getAccountIconName(acc.icon)} size={22} color={colorSet.text} />
          )}
        </View>
        <TouchableOpacity 
          style={styles.moreBtn} 
          onPress={() => onMore(acc)}
          activeOpacity={0.6}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#7c8e88" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.accName} numberOfLines={1}>{acc.name}</Text>
        <Text style={[styles.accBalance, { color: balance >= 0 ? '#1f644e' : '#c94c4c' }]}>
          {balance < 0 ? '-' : ''}{fmt(balance)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtn: { padding: 4, marginRight: -8, marginTop: -4 },
  cardBottom: { marginTop: 20 },
  accName: { fontSize: 14, fontWeight: '700', color: '#1e3a34', marginBottom: 2 },
  accBalance: { fontSize: 18, fontWeight: '800' },
});
