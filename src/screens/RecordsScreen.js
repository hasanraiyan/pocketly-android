import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePocketly } from '../context/PocketlyContext';
import AddTransactionModal from '../components/AddTransactionModal';
import dayjs from 'dayjs';

const INR = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 });
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

function groupByDate(transactions) {
  const groups = {};
  for (const tx of transactions) {
    const key = dayjs(tx.date).format('YYYY-MM-DD');
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return Object.entries(groups).sort(([a], [b]) => (a < b ? 1 : -1));
}

export default function RecordsScreen() {
  const {
    transactions,
    periodStart,
    periodEnd,
    periodType,
    setPeriod,
    navigatePeriod,
    deleteTransaction,
    fetchBootstrap,
    isBootstrapLoading,
  } = usePocketly();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchBootstrap(periodStart, periodEnd);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.note?.toLowerCase().includes(q) ||
        t.category?.name?.toLowerCase().includes(q) ||
        t.account?.name?.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const totalIncome = useMemo(
    () => filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () => filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [filtered]
  );

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

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
              onPress={() => {
                setEditData(tx);
                setShowModal(true);
              }}
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

  const periodLabel = () => {
    const s = dayjs(periodStart);
    const e = dayjs(periodEnd);
    if (periodType === 'week') return `${s.format('D MMM')} – ${e.format('D MMM')}`;
    if (periodType === 'month') return s.format('MMMM YYYY');
    return `${s.format('D MMM')} – ${e.format('D MMM YYYY')}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f5f2' }}>
      {/* Period nav */}
      <View style={styles.periodBar}>
        <TouchableOpacity onPress={() => navigatePeriod('prev')}>
          <Ionicons name="chevron-back" size={22} color="#1f644e" />
        </TouchableOpacity>
        <Text style={styles.periodLabel}>{periodLabel()}</Text>
        <TouchableOpacity onPress={() => navigatePeriod('next')}>
          <Ionicons name="chevron-forward" size={22} color="#1f644e" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryVal, { color: '#1f644e' }]}>+{fmt(totalIncome)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Expense</Text>
          <Text style={[styles.summaryVal, { color: '#c94c4c' }]}>-{fmt(totalExpense)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={[styles.summaryVal, { color: totalIncome - totalExpense >= 0 ? '#1f644e' : '#c94c4c' }]}>
            {fmt(totalIncome - totalExpense)}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#7c8e88" style={{ marginRight: 6 }} />
        <TextInput
          style={{ flex: 1, fontSize: 14, color: '#1e3a34' }}
          placeholder="Search transactions…"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isBootstrapLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#1f644e" />
        </View>
      ) : grouped.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="wallet-outline" size={48} color="#7c8e88" />
          <Text style={{ color: '#7c8e88', marginTop: 8 }}>No transactions this period</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          renderItem={renderItem}
          keyExtractor={([date]) => date}
          contentContainerStyle={{ padding: 12 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditData(null);
          setShowModal(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={showModal}
        editData={editData}
        onClose={() => {
          setShowModal(false);
          setEditData(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  periodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e3d8',
  },
  periodLabel: { fontSize: 15, fontWeight: '700', color: '#1e3a34' },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e3d8',
  },
  summaryCard: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: '#7c8e88', fontWeight: '600' },
  summaryVal: { fontSize: 13, fontWeight: '700', marginTop: 2 },
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1f644e',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});