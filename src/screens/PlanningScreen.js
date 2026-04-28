import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePocketly } from '../context/PocketlyContext';

const INR = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

const PERIODS = ['monthly', 'weekly', 'yearly'];

function BudgetForm({ initial, categories, onSave, onClose }) {
  const [categoryId, setCategoryId] = useState(initial?.category?.id || '');
  const [limit, setLimit] = useState(initial?.limit?.toString() || '');
  const [period, setPeriod] = useState(initial?.period || 'monthly');
  const [saving, setSaving] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleSave = async () => {
    if (!categoryId) { Alert.alert('Error', 'Select a category.'); return; }
    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) { Alert.alert('Error', 'Enter a valid limit.'); return; }
    setSaving(true);
    try {
      await onSave({ category: categoryId, limit: parsedLimit, period });
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfbf5' }}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>{initial ? 'Edit Budget' : 'New Budget'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#1f644e" /> : <Text style={styles.save}>Save</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 24 }}>
          <View>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {expenseCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, categoryId === cat.id && styles.chipActive]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[styles.chipText, categoryId === cat.id && styles.chipTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.label}>Limit (₹)</Text>
            <TextInput style={styles.input} value={limit} onChangeText={setLimit} keyboardType="decimal-pad" placeholder="e.g. 5000" placeholderTextColor="#7c8e88" />
          </View>
          <View>
            <Text style={styles.label}>Period</Text>
            <View style={styles.chipRow}>
              {PERIODS.map((p) => (
                <TouchableOpacity key={p} style={[styles.chip, period === p && styles.chipActive]} onPress={() => setPeriod(p)}>
                  <Text style={[styles.chipText, period === p && styles.chipTextActive]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function PlanningScreen() {
  const { budgets, categories, transactions, createBudget, updateBudget, deleteBudget } = usePocketly();
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);

  // Calculate spending per category from current transactions
  const spendingByCat = {};
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.category?.id) {
      spendingByCat[tx.category.id] = (spendingByCat[tx.category.id] || 0) + tx.amount;
    }
  }

  const handleDelete = (id, name) => {
    Alert.alert('Delete Budget', `Delete "${name}" budget?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteBudget(id); } catch (err) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  const renderBudget = ({ item: budget }) => {
    const spent = spendingByCat[budget.category?.id] || 0;
    const pct = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0;
    const over = spent > budget.limit;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="pie-chart" size={20} color="#1f644e" />
            </View>
            <View>
              <Text style={styles.catName}>{budget.category?.name || 'Category'}</Text>
              <Text style={styles.period}>{budget.period}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => { setEditBudget(budget); setShowForm(true); }} style={styles.iconBtn}>
              <Ionicons name="pencil" size={16} color="#7c8e88" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(budget.id, budget.category?.name)} style={styles.iconBtn}>
              <Ionicons name="trash" size={16} color="#7c8e88" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: over ? '#c94c4c' : '#1f644e' }]} />
        </View>
        <View style={styles.cardFooter}>
          <Text style={[styles.spentText, { color: over ? '#c94c4c' : '#7c8e88' }]}>
            {fmt(spent)} spent
          </Text>
          <Text style={styles.limitText}>of {fmt(budget.limit)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fcfbf5' }}>
      <FlatList
        data={budgets}
        renderItem={renderBudget}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="calendar-outline" size={32} color="#7c8e88" />
            </View>
            <Text style={styles.emptyTitle}>No budgets yet</Text>
            <Text style={styles.emptySub}>Tap the + button to create one</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => { setEditBudget(null); setShowForm(true); }} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      {showForm && (
        <BudgetForm
          initial={editBudget}
          categories={categories}
          onSave={editBudget ? (body) => updateBudget(editBudget.id, body) : createBudget}
          onClose={() => { setShowForm(false); setEditBudget(null); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16,
    borderWidth: 1, 
    borderColor: '#e5e3d8',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1f644e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: { fontSize: 16, fontWeight: '700', color: '#1e3a34' },
  period: { fontSize: 12, color: '#7c8e88', marginTop: 2, textTransform: 'capitalize', fontWeight: '500' },
  iconBtn: { padding: 6, backgroundColor: '#f8f9f4', borderRadius: 8 },
  
  barBg: { height: 8, backgroundColor: '#f0f5f2', borderRadius: 4, marginBottom: 12 },
  barFill: { height: 8, borderRadius: 4 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spentText: { fontSize: 14, fontWeight: '700' },
  limitText: { fontSize: 13, color: '#7c8e88', fontWeight: '600' },
  
  emptyContainer: {
    marginTop: 32,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a34',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#7c8e88',
  },
  
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#1f644e',
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#1e3a34', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, 
    borderBottomWidth: 1, borderBottomColor: '#e5e3d8', 
    backgroundColor: '#fff',
  },
  cancel: { color: '#7c8e88', fontSize: 16, fontWeight: '500' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1e3a34' },
  save: { color: '#1f644e', fontSize: 16, fontWeight: '700' },
  
  label: { fontSize: 12, fontWeight: '700', color: '#7c8e88', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, 
    backgroundColor: '#fff', color: '#1e3a34',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    borderWidth: 1, borderColor: '#e5e3d8', backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#1f644e', borderColor: '#1f644e' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#7c8e88' },
  chipTextActive: { color: '#fff' },
});
