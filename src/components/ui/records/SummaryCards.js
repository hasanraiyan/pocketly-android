import { View, Text, StyleSheet } from 'react-native';

const INR = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 });
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

export default function SummaryCards({ income, expense }) {
  const net = income - expense;

  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Income</Text>
        <Text style={[styles.summaryVal, { color: '#1f644e' }]}>+{fmt(income)}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Expense</Text>
        <Text style={[styles.summaryVal, { color: '#c94c4c' }]}>-{fmt(expense)}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Net</Text>
        <Text style={[styles.summaryVal, { color: net >= 0 ? '#1f644e' : '#c94c4c' }]}>
          {fmt(net)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});