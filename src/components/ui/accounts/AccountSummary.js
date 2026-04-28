import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const INR = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

export default function AccountSummary({ stats, totalIncome, totalExpense }) {
  return (
    <View style={styles.summaryGrid}>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Balance</Text>
        <Text style={[styles.summaryVal, { color: '#1e3a34' }]}>{fmt(stats.totalAccountBalance ?? 0)}</Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Expense</Text>
        <Text style={[styles.summaryVal, { color: '#c94c4c' }]}>{fmt(totalExpense ?? 0)}</Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Income</Text>
        <Text style={[styles.summaryVal, { color: '#1f644e' }]}>{fmt(totalIncome ?? 0)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryBox: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e5e3d8', 
    borderRadius: 14, 
    paddingVertical: 10, 
    alignItems: 'center' 
  },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: '#7c8e88', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryVal: { fontSize: 14, fontWeight: '700', marginTop: 2 },
});
