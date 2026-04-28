import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import TransactionRow from './TransactionRow';

export default function TransactionGroup({ date, txns, onMore }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Text style={styles.dateLabel}>{dayjs(date).format('MMM D, dddd')}</Text>
        <View style={styles.groupLine} />
        <Text style={styles.groupCount}>{txns.length} transaction{txns.length !== 1 ? 's' : ''}</Text>
      </View>
      <View style={styles.txnsCard}>
        {txns.map((tx, index) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            isLast={index === txns.length - 1}
            onMore={onMore}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
