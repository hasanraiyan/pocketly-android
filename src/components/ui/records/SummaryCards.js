import { View, Text, StyleSheet } from 'react-native';

const INR = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

export default function SummaryCards({ income, expense }) {
  const net = income - expense;

  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Expense</Text>
        <Text style={[styles.summaryVal, { color: '#c94c4c' }]}>{fmt(expense)}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Income</Text>
        <Text style={[styles.summaryVal, { color: '#1f644e' }]}>{fmt(income)}</Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Net Flow</Text>
        <Text style={[styles.summaryVal, { color: net >= 0 ? '#1f644e' : '#c94c4c' }]}>
          {net < 0 ? '-' : '+'}{fmt(net)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#7c8e88',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
});
