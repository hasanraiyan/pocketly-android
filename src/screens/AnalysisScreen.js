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
const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const fmt = (n) => `₹${INR.format(n)}`;

const CHART_CONFIG = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(31, 100, 78, ${opacity})`,
  labelColor: () => '#7c8e88',
  barPercentage: 0.6,
  propsForLabels: { fontSize: 10 },
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
      labels: dates.map((d) => d.slice(5)),
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
        <ActivityIndicator color="#1f644e" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f0f5f2' }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Summary cards */}
      <View style={styles.row}>
        <View style={[styles.summaryCard, { backgroundColor: '#1f644e' }]}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryVal}>{fmt(analysis.totalIncome)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#c94c4c' }]}>
          <Text style={styles.summaryLabel}>Expense</Text>
          <Text style={styles.summaryVal}>{fmt(analysis.totalExpense)}</Text>
        </View>
      </View>
      <View style={[styles.summaryCard, { backgroundColor: analysis.netFlow >= 0 ? '#4a86e8' : '#f59e0b' }]}>
        <Text style={styles.summaryLabel}>Net Flow</Text>
        <Text style={[styles.summaryVal, { fontSize: 22 }]}>{fmt(analysis.netFlow)}</Text>
      </View>

      {/* Daily flow chart */}
      {dailyChartData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily Net Flow</Text>
          <BarChart
            data={dailyChartData}
            width={WIDTH - 32}
            height={180}
            chartConfig={CHART_CONFIG}
            style={{ borderRadius: 8 }}
          />
        </View>
      )}

      {/* Top expense categories */}
      {topCategories.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Expenses by Category</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            {topCategories.map((cat) => {
              const pct = analysis.totalExpense > 0 ? (cat.total / analysis.totalExpense) * 100 : 0;
              return (
                <View key={`${cat.categoryId}-${cat.type}`}>
                  <View style={styles.catRow}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catAmount}>{fmt(cat.total)}</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color || '#1f644e' }]} />
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
          <View style={{ gap: 8, marginTop: 8 }}>
            {analysis.accountAnalysis
              .filter((a, i, arr) => arr.findIndex((x) => x.accountId === a.accountId) === i)
              .map((acc) => (
                <View key={acc.accountId} style={styles.accRow}>
                  <Text style={styles.catName}>{acc.name}</Text>
                  <Text style={[styles.catAmount, { color: acc.currentBalance >= 0 ? '#1f644e' : '#c94c4c' }]}>
                    {fmt(acc.currentBalance || 0)}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  summaryCard: {
    flex: 1, borderRadius: 14, padding: 16, alignItems: 'center',
  },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  summaryVal: { fontSize: 18, color: '#fff', fontWeight: '800', marginTop: 4 },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#e5e3d8',
  },
  chartTitle: { fontSize: 14, fontWeight: '700', color: '#1e3a34', marginBottom: 8 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 13, color: '#1e3a34', fontWeight: '600' },
  catAmount: { fontSize: 13, color: '#7c8e88', fontWeight: '600' },
  barBg: { height: 6, backgroundColor: '#e5e3d8', borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  accRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});