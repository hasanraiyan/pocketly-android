import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IconRenderer from '../../common/IconRenderer';

const INR = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

export default function BudgetItem({ budget, onMore }) {
  return (
    <View style={styles.budgetCard}>
      <View style={styles.budgetCardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[styles.iconCircleSmall, { backgroundColor: budget.category?.color || '#1f644e' }]}>
            <IconRenderer name={budget.category?.icon} size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.budgetCatName}>{budget.category?.name || 'Category'}</Text>
            <Text style={styles.budgetPeriod}>{budget.period}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onMore(budget)}>
          <Ionicons name="ellipsis-vertical" size={20} color="#7c8e88" />
        </TouchableOpacity>
      </View>

      <View style={styles.budgetStats}>
        <View>
          <Text style={[styles.spentAmount, budget.isExceeded && { color: '#c94c4c' }]}>{fmt(budget.spent)}</Text>
          <Text style={styles.limitLabel}>of {fmt(budget.amount)} limit</Text>
        </View>
        {budget.isExceeded && (
          <View style={styles.exceededBadge}>
            <Ionicons name="warning" size={10} color="#c94c4c" />
            <Text style={styles.exceededText}>Exceeded</Text>
          </View>
        )}
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${budget.progress}%`, backgroundColor: budget.isExceeded ? '#c94c4c' : '#1f644e' }]} />
      </View>
      <Text style={styles.progressPct}>{budget.progress.toFixed(0)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  budgetCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 20, padding: 16 },
  budgetCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  budgetCatName: { fontSize: 15, fontWeight: '700', color: '#1e3a34' },
  budgetPeriod: { fontSize: 11, color: '#7c8e88', textTransform: 'capitalize' },
  budgetStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  spentAmount: { fontSize: 22, fontWeight: '800', color: '#1e3a34' },
  limitLabel: { fontSize: 12, fontWeight: '600', color: '#7c8e88' },
  exceededBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, 
    backgroundColor: '#fdf2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 
  },
  exceededText: { fontSize: 10, fontWeight: '800', color: '#c94c4c', textTransform: 'uppercase' },
  progressBarBg: { height: 8, backgroundColor: '#f0f5f2', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressPct: { fontSize: 10, fontWeight: '800', color: '#7c8e88', textAlign: 'right', marginTop: 4 },
  iconCircleSmall: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
