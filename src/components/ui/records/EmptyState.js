import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyState({ search }) {
  return (
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
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
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
});
