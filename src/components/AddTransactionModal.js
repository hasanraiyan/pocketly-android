import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { usePocketly } from '../context/PocketlyContext';

const TYPES = ['expense', 'income', 'transfer'];

export default function AddTransactionModal({ visible, onClose, editData = null }) {
  const { accounts, categories, createTransaction, updateTransaction } = usePocketly();
  const [type, setType] = useState(editData?.type || 'expense');
  const [amount, setAmount] = useState(editData?.amount?.toString() || '');
  const [note, setNote] = useState(editData?.note || '');
  const [accountId, setAccountId] = useState(editData?.account?.id || '');
  const [toAccountId, setToAccountId] = useState(editData?.toAccount?.id || '');
  const [categoryId, setCategoryId] = useState(editData?.category?.id || '');
  const [date, setDate] = useState(editData?.date ? editData.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const relevantCategories = categories.filter(
    (c) => c.type === type || type === 'transfer'
  );

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive number.');
      return;
    }
    if (!accountId) {
      Alert.alert('Select account', 'Please select an account.');
      return;
    }
    if (type === 'transfer' && !toAccountId) {
      Alert.alert('Select destination', 'Please select a destination account for the transfer.');
      return;
    }

    const body = {
      type,
      amount: parsedAmount,
      note,
      account: accountId,
      category: categoryId || undefined,
      date: new Date(date).toISOString(),
      ...(type === 'transfer' ? { toAccount: toAccountId } : {}),
    };

    setSaving(true);
    try {
      if (editData?.id) {
        await updateTransaction(editData.id, body);
      } else {
        await createTransaction(body);
      }
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{editData ? 'Edit Transaction' : 'New Transaction'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#1f644e" /> : <Text style={styles.save}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
        {/* Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
          />
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="2024-01-01"
          />
        </View>

        {/* Account */}
        <View style={styles.field}>
          <Text style={styles.label}>Account</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.chip, accountId === acc.id && styles.chipActive]}
                  onPress={() => setAccountId(acc.id)}
                >
                  <Text style={[styles.chipText, accountId === acc.id && styles.chipTextActive]}>
                    {acc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* To Account (transfer only) */}
        {type === 'transfer' && (
          <View style={styles.field}>
            <Text style={styles.label}>To Account</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {accounts
                  .filter((a) => a.id !== accountId)
                  .map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      style={[styles.chip, toAccountId === acc.id && styles.chipActive]}
                      onPress={() => setToAccountId(acc.id)}
                    >
                      <Text style={[styles.chipText, toAccountId === acc.id && styles.chipTextActive]}>
                        {acc.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Category */}
        {type !== 'transfer' && (
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, !categoryId && styles.chipActive]}
                  onPress={() => setCategoryId('')}
                >
                  <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>None</Text>
                </TouchableOpacity>
                {relevantCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, categoryId === cat.id && styles.chipActive]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text style={[styles.chipText, categoryId === cat.id && styles.chipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Note */}
        <View style={styles.field}>
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            value={note}
            onChangeText={setNote}
            placeholder="Optional note"
            multiline
          />
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e3d8',
    backgroundColor: '#fff',
  },
  cancel: { color: '#7c8e88', fontSize: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#1e3a34' },
  save: { color: '#1f644e', fontSize: 16, fontWeight: '700' },
  body: { flex: 1, backgroundColor: '#f7faf7', padding: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#7c8e88' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e3d8',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#1e3a34',
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  typeBtnActive: { backgroundColor: '#1f644e', borderColor: '#1f644e' },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#7c8e88' },
  typeBtnTextActive: { color: '#fff' },
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#1f644e', borderColor: '#1f644e' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#7c8e88' },
  chipTextActive: { color: '#fff' },
});