import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useTransactions, useTransactionFilters } from '../../../hooks/useTransactions';
import TransactionGroup from './TransactionGroup';
import EmptyState from './EmptyState';

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

export default function TransactionList({ onEditTransaction, isBootstrapLoading, header }) {
  const { deleteTransaction } = useTransactions();
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

  if (isBootstrapLoading) {
    return (
      <View style={{ flex: 1 }}>
        {header}
        <View style={styles.center}>
          <Ionicons name="refresh-circle" size={48} color="#1f644e" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={grouped}
        ListHeaderComponent={(
          <View>
            {header}
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
          </View>
        )}
        renderItem={({ item: [date, txns] }) => (
          <TransactionGroup
            date={date}
            txns={txns}
            onEdit={onEditTransaction}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={<EmptyState search={search} />}
        keyExtractor={([date]) => date}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 16,
    marginTop: 0,
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});
