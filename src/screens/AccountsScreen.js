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

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];

function AccountForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [initialBalance, setInitialBalance] = useState(initial?.initialBalance?.toString() || '0');
  const [currency, setCurrency] = useState(initial?.currency || 'INR');
  const [ignored, setIgnored] = useState(initial?.ignored || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Account name is required.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), initialBalance: parseFloat(initialBalance) || 0, currency, ignored });
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
          <Text style={styles.modalTitle}>{initial ? 'Edit Account' : 'New Account'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#1f644e" /> : <Text style={styles.save}>Save</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 20 }}>
          <View>
            <Text style={styles.label}>Account Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Savings" placeholderTextColor="#7c8e88" />
          </View>
          <View>
            <Text style={styles.label}>Initial Balance (₹)</Text>
            <TextInput style={styles.input} value={initialBalance} onChangeText={setInitialBalance} keyboardType="decimal-pad" placeholderTextColor="#7c8e88" />
          </View>
          <View>
            <Text style={styles.label}>Currency</Text>
            <View style={styles.chipRow}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, currency === c && styles.chipActive]} onPress={() => setCurrency(c)}>
                  <Text style={[styles.chipText, currency === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.toggleRow} onPress={() => setIgnored(!ignored)} activeOpacity={0.7}>
            <Text style={styles.labelToggle}>Ignore in total balance</Text>
            <Ionicons name={ignored ? 'checkbox' : 'square-outline'} size={24} color={ignored ? '#1f644e' : '#7c8e88'} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function AccountsScreen() {
  const { accounts, stats, createAccount, updateAccount, deleteAccount } = usePocketly();
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  const handleDelete = (id, name) => {
    Alert.alert('Delete Account', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteAccount(id); } catch (err) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  const renderAccount = ({ item: acc }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Ionicons name="wallet" size={20} color="#1f644e" />
        </View>
        <View>
          <Text style={styles.accName}>{acc.name}</Text>
          <Text style={styles.accSub}>{acc.currency || 'INR'}{acc.ignored ? ' · Ignored' : ''}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.accBalance, { color: acc.balance >= 0 ? '#1f644e' : '#c94c4c' }]}>
          {acc.balance < 0 ? '-' : ''}{fmt(acc.balance || 0)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TouchableOpacity onPress={() => { setEditAccount(acc); setShowForm(true); }} style={styles.iconBtn}>
            <Ionicons name="pencil" size={16} color="#7c8e88" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(acc.id, acc.name)} style={styles.iconBtn}>
            <Ionicons name="trash" size={16} color="#7c8e88" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fcfbf5' }}>
      <View style={styles.totalBanner}>
        <View style={styles.bannerContent}>
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text style={styles.totalVal}>
             {stats.totalAccountBalance < 0 ? '-' : ''}{fmt(stats.totalAccountBalance)}
          </Text>
        </View>
      </View>

      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="wallet-outline" size={32} color="#7c8e88" />
            </View>
            <Text style={styles.emptyTitle}>No accounts yet</Text>
            <Text style={styles.emptySub}>Tap the + button to add one</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => { setEditAccount(null); setShowForm(true); }} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {showForm && (
        <AccountForm
          initial={editAccount}
          onSave={editAccount ? (body) => updateAccount(editAccount.id, body) : createAccount}
          onClose={() => { setShowForm(false); setEditAccount(null); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  totalBanner: {
    padding: 16,
  },
  bannerContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  totalLabel: { 
    fontSize: 12, 
    color: '#7c8e88', 
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalVal: { 
    fontSize: 32, 
    color: '#1f644e', 
    fontWeight: '800', 
    marginTop: 8 
  },
  
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1f644e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accName: { fontSize: 16, fontWeight: '700', color: '#1e3a34' },
  accSub: { fontSize: 12, color: '#7c8e88', marginTop: 4, fontWeight: '500' },
  accBalance: { fontSize: 18, fontWeight: '700' },
  iconBtn: { padding: 6, backgroundColor: '#f8f9f4', borderRadius: 8 },
  
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
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1f644e',
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
  labelToggle: { fontSize: 15, fontWeight: '600', color: '#1e3a34' },
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
  toggleRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 16, paddingHorizontal: 16,
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e3d8'
  },
});
