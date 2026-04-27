import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useTransactions, useTransactionFilters } from '../../../hooks/useTransactions';

const INR = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 });
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

function groupByDate(transactions) {
  if (!transactions) return [];
  const groups = {};
  for (const tx of transactions) {
    const key = dayjs(tx.date).format('YYYY-MM-DD');
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return Object.entries(groups).sort(([a], [b]) => (a < b ? 1 : -1));
}

export default function TransactionList({ onEditTransaction, isBootstrapLoading }) {
  const { transactions, deleteTransaction } = useTransactions();
  const { filterBySearch, calculateTotals } = useTransactionFilters();
  const [search, setSearch] = useState('');

  const filtered = filterBySearch(search);
  const grouped = groupByDate(filtered);

  const handleDelete = (id) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(id);
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const typeColor = (type) =>
    type === 'income' ? '#1f644e' : type === 'expense' ? '#c94c4c' : '#4a86e8';
  const typeSign = (type) => (type === 'income' ? '+' : type === 'expense' ? '-' : '↔');

  const renderItem = ({ item: [date, txns] }) => (
    <View style={styles.group}>
      <Text style={styles.dateLabel}>{dayjs(date).format('ddd, D MMM YYYY')}</Text>
      {txns.map((tx) => (
        <View key={tx.id} style={styles.txRow}>
          <View style={[styles.txDot, { backgroundColor: tx.category?.color || '#ccc' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.txNote} numberOfLines={1}>
              {tx.note || tx.category?.name || 'No note'}
            </Text>
            <Text style={styles.txSub}>
              {tx.account?.name}
              {tx.category?.name ? ` · ${tx.category.name}` : ''}
            </Text>
          </View>
          <Text style={[styles.txAmount, { color: typeColor(tx.type) }]}>
            {typeSign(tx.type)} {fmt(tx.amount)}
          </Text>
          <View style={styles.txActions}>
            <TouchableOpacity
              onPress={() => onEditTransaction(tx)}
              style={styles.iconBtn}
            >
              <Ionicons name="pencil" size={14} color="#7c8e88" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(tx.id)} style={styles.iconBtn}>
              <Ionicons name="trash" size={14} color="#c94c4c" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  if (isBootstrapLoading) {
    return (
      <View style={styles.center}>
        <Ionicons name="refresh-circle" size={48} color="#1f644e" />
      </View>
    );
  }

  if (grouped.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="wallet-outline" size={48} color="#7c8e88" />
        <Text style={{ color: '#7c8e88', marginTop: 8 }}>No transactions this period</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#7c8e88" style={{ marginRight: 6 }} />
        <TextInput
          style={{ flex: 1, fontSize: 14, color: '#1e3a34' }}
          placeholder="Search transactions…"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={grouped}
        renderItem={renderItem}
        keyExtractor={([date]) => date}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  group: { marginBottom: 8 },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c8e88',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  txDot: { width: 10, height: 10, borderRadius: 5 },
  txNote: { fontSize: 14, fontWeight: '600', color: '#1e3a34' },
  txSub: { fontSize: 12, color: '#7c8e88', marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 4 },
});