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

// Compact formatter for large amounts like 45K, 1.2Cr
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
  const { filterBySearch } = useTransactionFilters();
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
  
  const typeBgColor = (type) =>
    type === 'income' ? '#1f644e' : type === 'expense' ? '#c94c4c' : '#4a86e8';

  const typeSign = (type) => (type === 'income' ? '+' : type === 'expense' ? '-' : '');

  const getIconName = (icon) => {
    // Map web lucide icons or simple names to Ionicons roughly
    if (!icon) return 'pricetag';
    if (icon.includes('tag')) return 'pricetag';
    if (icon.includes('food') || icon.includes('pizza')) return 'fast-food';
    if (icon.includes('car') || icon.includes('bus')) return 'car';
    if (icon.includes('home')) return 'home';
    if (icon.includes('cash') || icon.includes('wallet')) return 'wallet';
    return 'pricetag';
  };

  const renderItem = ({ item: [date, txns] }) => (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Text style={styles.dateLabel}>{dayjs(date).format('MMM D, dddd')}</Text>
        <View style={styles.groupLine} />
        <Text style={styles.groupCount}>{txns.length} transaction{txns.length !== 1 ? 's' : ''}</Text>
      </View>
      <View style={styles.txnsCard}>
        {txns.map((tx, index) => {
          const isTransfer = tx.type === 'transfer';
          const isLast = index === txns.length - 1;
          return (
            <View key={tx.id} style={[styles.txRow, !isLast && styles.txRowBorder]}>
              <View style={[styles.txIconContainer, { backgroundColor: typeBgColor(tx.type) }]}>
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
                  <TouchableOpacity
                    onPress={() => onEditTransaction(tx)}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="pencil" size={16} color="#7c8e88" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(tx.id)} style={styles.iconBtn}>
                    <Ionicons name="trash" size={16} color="#7c8e88" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  if (isBootstrapLoading) {
    return (
      <View style={styles.center}>
        <Ionicons name="refresh-circle" size={48} color="#1f644e" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#7c8e88" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#7c8e88"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {grouped.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="swap-horizontal" size={32} color="#7c8e88" />
          </View>
          <Text style={styles.emptyTitle}>
            {search ? 'No matching transactions' : 'No transactions'}
          </Text>
          <Text style={styles.emptySub}>
            {search ? 'Try a different search term' : 'Transactions for this period will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          renderItem={renderItem}
          keyExtractor={([date]) => date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e3a34',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    marginHorizontal: 16,
    padding: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f0f5f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e3a34',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#7c8e88',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  group: { marginBottom: 24 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c8e88',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e3d8',
  },
  groupCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c8e88',
  },
  txnsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    overflow: 'hidden',
  },
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
