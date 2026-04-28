import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useTransactions, useTransactionFilters } from '../../../hooks/useTransactions';
import TransactionGroup from './TransactionGroup';
import EmptyState from './EmptyState';
import BottomSheet from '../../common/BottomSheet';

const INR = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 });
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

const typeColor = (type) =>
  type === 'income' ? '#1f644e' : type === 'expense' ? '#c94c4c' : '#4a86e8';

const getIconName = (icon) => {
  if (!icon) return 'pricetag';
  if (icon.includes('tag')) return 'pricetag';
  if (icon.includes('food') || icon.includes('pizza')) return 'fast-food';
  if (icon.includes('car') || icon.includes('bus')) return 'car';
  if (icon.includes('home')) return 'home';
  if (icon.includes('cash') || icon.includes('wallet')) return 'wallet';
  return 'pricetag';
};

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

export default function TransactionList({ onEditTransaction, isBootstrapLoading, header, search, onSearchChange }) {
  const { deleteTransaction } = useTransactions();
  const { filterBySearch } = useTransactionFilters();
  const [selectedTx, setSelectedTx] = useState(null);

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
            setSelectedTx(null);
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleMore = (tx) => {
    setSelectedTx(tx);
  };

  if (isBootstrapLoading) {
    return (
      <View style={[styles.listContent, { flex: 1 }]}>
        {header}
        <View style={styles.center}>
          <Ionicons name="refresh-circle" size={48} color="#1f644e" />
        </View>
      </View>
    );
  }

  const isTransfer = selectedTx?.type === 'transfer';

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={grouped}
        ListHeaderComponent={(
          <View>
            {header}
          </View>
        )}
        renderItem={({ item: [date, txns] }) => (
          <TransactionGroup
            date={date}
            txns={txns}
            onMore={handleMore}
          />
        )}
        ListEmptyComponent={<EmptyState search={search} />}
        keyExtractor={([date]) => date}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet 
        visible={!!selectedTx} 
        onClose={() => setSelectedTx(null)}
      >
        {selectedTx && (
          <View style={styles.sheetContent}>
            <View style={styles.txHeader}>
              <View style={[styles.txIconBg, { backgroundColor: typeColor(selectedTx.type) }]}>
                <Ionicons
                  name={isTransfer ? 'swap-horizontal' : getIconName(selectedTx.category?.icon)}
                  size={24}
                  color="#fff"
                />
              </View>
              <View style={styles.txHeaderText}>
                <Text style={styles.txHeaderCat}>
                  {isTransfer ? 'Transfer' : (selectedTx.category?.name || 'Uncategorized')}
                </Text>
                <Text style={styles.txHeaderTitle} numberOfLines={1}>
                  {selectedTx.description && selectedTx.description !== 'Transaction' && selectedTx.description !== 'Transfer'
                    ? selectedTx.description
                    : selectedTx.account?.name || 'Account'}
                </Text>
                <Text style={styles.txHeaderSub}>
                  {isTransfer ? (
                    <Text>{selectedTx.account?.name} → {selectedTx.toAccount?.name}</Text>
                  ) : (
                    selectedTx.account?.name || 'Account'
                  )}
                </Text>
              </View>
              <View style={styles.txHeaderAmount}>
                <Text style={[styles.txAmountText, { color: typeColor(selectedTx.type) }]}>
                  {selectedTx.type === 'expense' ? '-' : selectedTx.type === 'income' ? '+' : ''}{fmt(selectedTx.amount)}
                </Text>
              </View>
            </View>

            <View style={styles.sheetDivider} />

            <Text style={styles.optionsLabel}>Transaction options</Text>

            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => {
                onEditTransaction(selectedTx);
                setSelectedTx(null);
              }}
            >
              <Text style={styles.optionTextEdit}>Edit transaction</Text>
              <Ionicons name="pencil" size={18} color="#1f644e" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, styles.optionBtnDelete]}
              onPress={() => {
                handleDelete(selectedTx.id);
              }}
            >
              <Text style={styles.optionTextDelete}>Delete transaction</Text>
              <Ionicons name="trash" size={18} color="#c94c4c" />
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sheetContent: {
    paddingTop: 0,
  },
  txHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  txIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txHeaderText: {
    flex: 1,
  },
  txHeaderCat: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c8e88',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  txHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a34',
    marginBottom: 2,
  },
  txHeaderSub: {
    fontSize: 12,
    color: '#7c8e88',
  },
  txHeaderAmount: {
    alignItems: 'flex-end',
  },
  txAmountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#e5e3d8',
    marginVertical: 20,
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c8e88',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9f4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d9e6df',
    marginBottom: 12,
  },
  optionBtnDelete: {
    backgroundColor: '#fdf2f2',
    borderColor: '#f5c6c6',
  },
  optionTextEdit: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f644e',
  },
  optionTextDelete: {
    fontSize: 15,
    fontWeight: '700',
    color: '#c94c4c',
  },
});
