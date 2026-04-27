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
import { Ionicons } from '@expo/vector-icons';
import { usePocketly } from '../context/PocketlyContext';

const INR = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 });
const fmt = (n) => `₹${INR.format(n)}`;

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
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
        <Text style={styles.modalTitle}>{initial ? 'Edit Account' : 'New Account'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#1f644e" /> : <Text style={styles.save}>Save</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: '#f7faf7', padding: 16 }} contentContainerStyle={{ gap: 16 }}>
        <View>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Savings" />
        </View>
        <View>
          <Text style={styles.label}>Initial Balance (₹)</Text>
          <TextInput style={styles.input} value={initialBalance} onChangeText={setInitialBalance} keyboardType="decimal-pad" />
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
        <TouchableOpacity style={styles.toggleRow} onPress={() => setIgnored(!ignored)}>
          <Text style={styles.label}>Ignore in total balance</Text>
          <Ionicons name={ignored ? 'checkbox' : 'square-outline'} size={22} color="#1f644e" />
        </TouchableOpacity>
      </ScrollView>
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
          <Text style={styles.accSub}>{acc.currency || 'INR'}{acc.ignored ? ' · ignored' : ''}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.accBalance, { color: acc.balance >= 0 ? '#1f644e' : '#c94c4c' }]}>
          {fmt(acc.balance || 0)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
          <TouchableOpacity onPress={() => { setEditAccount(acc); setShowForm(true); }} style={styles.iconBtn}>
            <Ionicons name="pencil" size={14} color="#7c8e88" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(acc.id, acc.name)} style={styles.iconBtn}>
            <Ionicons name="trash" size={14} color="#c94c4c" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f5f2' }}>
      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>Total Balance</Text>
        <Text style={styles.totalVal}>{fmt(stats.totalAccountBalance)}</Text>
      </View>

      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="wallet-outline" size={48} color="#7c8e88" />
            <Text style={{ color: '#7c8e88', marginTop: 8 }}>No accounts yet</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => { setEditAccount(null); setShowForm(true); }}>
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
    backgroundColor: '#1f644e',
    padding: 20,
    alignItems: 'center',
  },
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  totalVal: { fontSize: 28, color: '#fff', fontWeight: '800', marginTop: 4 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f644e15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accName: { fontSize: 15, fontWeight: '700', color: '#1e3a34' },
  accSub: { fontSize: 12, color: '#7c8e88', marginTop: 2 },
  accBalance: { fontSize: 16, fontWeight: '800' },
  iconBtn: { padding: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1f644e',
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e3d8', backgroundColor: '#fff',
  },
  cancel: { color: '#7c8e88', fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1e3a34' },
  save: { color: '#1f644e', fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: '#7c8e88', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 10,
    padding: 12, fontSize: 15, backgroundColor: '#fff', color: '#1e3a34',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#e5e3d8', backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#1f644e', borderColor: '#1f644e' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#7c8e88' },
  chipTextActive: { color: '#fff' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
});