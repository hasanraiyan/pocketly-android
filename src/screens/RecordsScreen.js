import { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={{ flex: 1, backgroundColor: '#f0f5f2' }}>
      <PeriodNavigator
        periodStart={periodStart}
        periodEnd={periodEnd}
        periodType={periodType}
        onNavigate={navigatePeriod}
      />

      <SummaryCards income={totalIncome} expense={totalExpense} />

      <TransactionList
        onEditTransaction={handleEditTransaction}
        isBootstrapLoading={isBootstrapLoading}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditData(null);
          setShowModal(true);
        }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1f644e',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});