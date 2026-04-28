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
  if (icon.includes('tag')) return 'pricetag';
  if (icon.includes('food') || icon.includes('pizza')) return 'fast-food';
  if (icon.includes('car') || icon.includes('bus')) return 'car';
  if (icon.includes('home')) return 'home';
  if (icon.includes('cash') || icon.includes('wallet')) return 'wallet';
  return 'pricetag';
};

const typeColor = (type) =>
  type === 'income' ? '#1f644e' : type === 'expense' ? '#c94c4c' : '#4a86e8';

const typeSign = (type) => (type === 'income' ? '+' : type === 'expense' ? '-' : '');

export default function TransactionRow({ tx, isLast, onEdit, onDelete }) {
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
        <View style={styles.txActions}>
          <TouchableOpacity onPress={() => onEdit(tx)} style={styles.iconBtn}>
            <Ionicons name="pencil" size={16} color="#7c8e88" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(tx.id)} style={styles.iconBtn}>
            <Ionicons name="trash" size={16} color="#7c8e88" />
          </TouchableOpacity>
        </View>
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
  txAmountActions: { alignItems: 'flex-end' },
  txAmount: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  txActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4, backgroundColor: '#f8f9f4', borderRadius: 8 },
});
