import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { usePocketly } from '../context/PocketlyContext';

const WIDTH = Dimensions.get('window').width - 32;

const INR = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

const CHART_CONFIG = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(31, 100, 78, ${opacity})`,
  labelColor: () => '#7c8e88',
  barPercentage: 0.6,
  propsForLabels: { fontSize: 10, fontWeight: '600' },
};

export default function AnalysisScreen() {
  const { analysis, periodStart, periodEnd, fetchAnalysis } = usePocketly();

  useEffect(() => {
    fetchAnalysis(periodStart, periodEnd);
  }, [periodStart, periodEnd]);

  const dailyChartData = useMemo(() => {
    if (!analysis?.dailyFlow?.length) return null;
    const byDate = {};
    for (const d of analysis.dailyFlow) {
      if (!byDate[d.date]) byDate[d.date] = { income: 0, expense: 0 };
      byDate[d.date][d.type] = d.total;
    }
    const dates = Object.keys(byDate).sort().slice(-14);
    return {
      labels: dates.map((d) => d.slice(5)), // MM-DD
      datasets: [{ data: dates.map((d) => byDate[d].income - byDate[d].expense) }],
    };
  }, [analysis]);

  const topCategories = useMemo(() => {
    if (!analysis?.categoryBreakdown) return [];
    return analysis.categoryBreakdown
      .filter((c) => c.type === 'expense')
      .slice(0, 6);
  }, [analysis]);

  if (!analysis) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1f644e" size="large" />
      </View>
    );
  }

  const netFlow = analysis.netFlow || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary cards matching Records screen style */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Expense</Text>
          <Text style={[styles.summaryVal, { color: '#c94c4c' }]}>{fmt(analysis.totalExpense)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryVal, { color: '#1f644e' }]}>{fmt(analysis.totalIncome)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Net Flow</Text>
          <Text style={[styles.summaryVal, { color: netFlow >= 0 ? '#1f644e' : '#c94c4c' }]}>
            {netFlow < 0 ? '-' : '+'}{fmt(netFlow)}
          </Text>
        </View>
      </View>

      {/* Daily flow chart */}
      {dailyChartData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily Net Flow</Text>
          <View style={styles.chartWrapper}>
            <BarChart
              data={dailyChartData}
              width={WIDTH - 32}
              height={180}
              chartConfig={CHART_CONFIG}
              style={{ borderRadius: 12 }}
              withInnerLines={false}
              showBarTops={false}
            />
          </View>
        </View>
      )}

      {/* Top expense categories */}
      {topCategories.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Expenses by Category</Text>
          <View style={{ gap: 16, marginTop: 12 }}>
            {topCategories.map((cat) => {
              const pct = analysis.totalExpense > 0 ? (cat.total / analysis.totalExpense) * 100 : 0;
              return (
                <View key={`${cat.categoryId}-${cat.type}`}>
                  <View style={styles.catRow}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catAmount}>{fmt(cat.total)}</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color || '#c94c4c' }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Account balances */}
      {analysis.accountAnalysis?.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Account Balances</Text>
          <View style={{ marginTop: 8 }}>
            {analysis.accountAnalysis
              .filter((a, i, arr) => arr.findIndex((x) => x.accountId === a.accountId) === i)
              .map((acc, index, arr) => (
                <View key={acc.accountId} style={[styles.accRow, index !== arr.length - 1 && styles.accRowBorder]}>
                  <Text style={styles.catName}>{acc.name}</Text>
                  <Text style={[styles.catAmount, { color: acc.currentBalance >= 0 ? '#1f644e' : '#c94c4c' }]}>
                    {acc.currentBalance < 0 ? '-' : ''}{fmt(acc.currentBalance)}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfbf5' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fcfbf5' },
  
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    paddingVertical: 12,
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
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },

  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  chartTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#1e3a34', 
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catName: { fontSize: 14, color: '#1e3a34', fontWeight: '600' },
  catAmount: { fontSize: 14, color: '#1e3a34', fontWeight: '700' },
  barBg: { height: 8, backgroundColor: '#f0f5f2', borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4 },
  
  accRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  accRowBorder: { borderBottomWidth: 1, borderBottomColor: '#e5e3d8' },
});
