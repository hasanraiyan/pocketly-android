import { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePocketly } from '../context/PocketlyContext';
import { usePeriod } from '../hooks/usePeriod';
import { useTransactionFilters } from '../hooks/useTransactions';
import AddTransactionModal from '../components/AddTransactionModal';
import PeriodNavigator from '../components/ui/records/PeriodNavigator';
import SummaryCards from '../components/ui/records/SummaryCards';
import TransactionList from '../components/ui/records/TransactionList';

export default function RecordsScreen() {
  const { fetchBootstrap, isBootstrapLoading, transactions } = usePocketly();
  const { periodStart, periodEnd, periodType, navigatePeriod } = usePeriod();
  const { calculateTotals } = useTransactionFilters();
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchBootstrap(periodStart, periodEnd);
  }, []);

  const { income: totalIncome, expense: totalExpense } = calculateTotals(transactions);

  const handleEditTransaction = (transaction) => {
    setEditData(transaction);
    setShowModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SummaryCards income={totalIncome} expense={totalExpense} />

        <PeriodNavigator
          periodStart={periodStart}
          periodEnd={periodEnd}
          periodType={periodType}
          onNavigate={navigatePeriod}
        />

        <TransactionList
          onEditTransaction={handleEditTransaction}
          isBootstrapLoading={isBootstrapLoading}
        />
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditData(null);
          setShowModal(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={showModal}
        editData={editData}
        onClose={() => {
          setShowModal(false);
          setEditData(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfbf5', // Matched with web UI background
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1f644e', // Income green, standard for 'Add' here
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1e3a34',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
});
