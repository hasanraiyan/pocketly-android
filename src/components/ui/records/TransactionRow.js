import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INR = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 });
const compactFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatAmountCompact(amount) {
  const abs = Math.abs(amount);
  const useCompact = abs >= 100000;
  const formatted = useCompact ? compactFormatter.format(abs) : INR.format(abs);
  return `₹${formatted}`;
}

const getIconName = (icon) => {
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

const typeColor = (type) =>
  type === 'income' ? '#1f644e' : type === 'expense' ? '#c94c4c' : '#4a86e8';

const typeSign = (type) => (type === 'income' ? '+' : type === 'expense' ? '-' : '');

export default function TransactionRow({ tx, isLast, onMore }) {
  const isTransfer = tx.type === 'transfer';

  return (
    <View style={[styles.txRow, !isLast && styles.txRowBorder]}>
      <View style={[styles.txIconContainer, { backgroundColor: typeColor(tx.type) }]}>
        <Ionicons
          name={isTransfer ? 'swap-horizontal' : getIconName(tx.category?.icon)}
          size={20}
          color="#fff"
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txNote} numberOfLines={1}>
          {isTransfer ? 'Transfer' : (tx.category?.name || 'Uncategorized')}
        </Text>
        <Text style={styles.txSub}>
          {isTransfer ? (
            <Text>{tx.account?.name} <Ionicons name="swap-horizontal" size={10} /> {tx.toAccount?.name}</Text>
          ) : (
            tx.account?.name || 'Account'
          )}
        </Text>
        {tx.description && tx.description !== 'Transaction' && tx.description !== 'Transfer' && (
          <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
        )}
      </View>
      <View style={styles.txAmountActions}>
        <Text style={[styles.txAmount, { color: typeColor(tx.type) }]}>
          {typeSign(tx.type)}{formatAmountCompact(tx.amount)}
        </Text>
        <TouchableOpacity onPress={() => onMore(tx)} style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#7c8e88" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e3d8',
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: { flex: 1 },
  txNote: { fontSize: 14, fontWeight: '700', color: '#1e3a34' },
  txSub: { fontSize: 11, color: '#7c8e88', marginTop: 2, flexDirection: 'row', alignItems: 'center' },
  txDesc: { fontSize: 12, color: '#7c8e88', marginTop: 2 },
  txAmountActions: { 
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 8 
  },
  txAmount: { fontSize: 14, fontWeight: '700' },
  moreBtn: { padding: 4, borderRadius: 8 },
});
