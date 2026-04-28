import React, { useState } from 'react';
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePocketly } from '../context/PocketlyContext';
import BottomSheet from '../components/common/BottomSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INR = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];

const accountIcons = [
  'wallet',
  'business',
  'server',
  'card',
  'cash',
  'library',
  'logo-bitcoin',
  'phone-portrait',
  'ribbon',
  'shapes',
];

const getIconName = (icon) => {
  if (!icon) return 'wallet';
  const name = icon.toLowerCase();
  if (name.includes('wallet')) return 'wallet';
  if (name.includes('business')) return 'business';
  if (name.includes('bank') || name.includes('server')) return 'server';
  if (name.includes('card')) return 'card';
  if (name.includes('cash')) return 'cash';
  if (name.includes('library')) return 'library';
  if (name.includes('bitcoin')) return 'logo-bitcoin';
  if (name.includes('phone')) return 'phone-portrait';
  if (name.includes('ribbon')) return 'ribbon';
  if (name.includes('shapes')) return 'shapes';
  return 'wallet';
};

const iconColors = [
  { bg: '#ffedd5', text: '#f97316', border: '#fed7aa' }, // orange
  { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' }, // blue
  { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' }, // green
  { bg: '#f3e8ff', text: '#9333ea', border: '#e9d5ff' }, // purple
  { bg: '#fee2e2', text: '#ef4444', border: '#fecaca' }, // red
];

function AccountForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [initialBalance, setInitialBalance] = useState(initial?.initialBalance?.toString() || '0');
  const [currency, setCurrency] = useState(initial?.currency || 'INR');
  const [icon, setIcon] = useState(initial?.icon || 'wallet');
  const [ignored, setIgnored] = useState(initial?.ignored || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Account name is required.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), initialBalance: parseFloat(initialBalance) || 0, currency, ignored, icon });
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#7c8e88" />
            <Text style={styles.headerBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{initial ? 'Edit Account' : 'New Account'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.headerBtnRight}>
            {saving ? <ActivityIndicator color="#1f644e" size="small" /> : <Text style={styles.saveText}>Save</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
          <View>
            <Text style={styles.label}>Account Name</Text>
            <View style={styles.webInputWrapper}>
              <Text style={styles.webInputLabel}>NAME</Text>
              <TextInput 
                style={styles.webInput} 
                value={name} 
                onChangeText={setName} 
                placeholder="Account name" 
                placeholderTextColor="#7c8e88" 
              />
            </View>
          </View>

          <View>
            <Text style={styles.label}>Initial Amount (₹)</Text>
            <View style={styles.webInputWrapper}>
              <Text style={styles.webInputLabel}>AMOUNT</Text>
              <TextInput 
                style={styles.webInput} 
                value={initialBalance} 
                onChangeText={setInitialBalance} 
                keyboardType="decimal-pad" 
                placeholder="0.00"
                placeholderTextColor="#7c8e88" 
              />
            </View>
          </View>

          <View>
            <Text style={styles.label}>Select Icon</Text>
            <View style={styles.iconGrid}>
              {accountIcons.map((ico) => (
                <TouchableOpacity
                  key={ico}
                  onPress={() => setIcon(ico)}
                  activeOpacity={0.7}
                  style={[
                    styles.iconOption,
                    icon === ico ? styles.iconOptionActive : styles.iconOptionInactive
                  ]}
                >
                  <Ionicons name={getIconName(ico)} size={24} color={icon === ico ? '#fff' : '#7c8e88'} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Currency</Text>
            <View style={styles.chipRow}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, currency === c && styles.chipActive]} onPress={() => setCurrency(c)} activeOpacity={0.7}>
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
  const { accounts, stats, totalIncome, totalExpense, createAccount, updateAccount, deleteAccount } = usePocketly();
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [selectedAcc, setSelectedAcc] = useState(null);

  const handleDelete = (id, name) => {
    Alert.alert('Delete Account', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { 
          await deleteAccount(id); 
          setSelectedAcc(null);
        } catch (err) { 
          Alert.alert('Error', err.message); 
        }
      }},
    ]);
  };

  const handleMore = (acc) => {
    setSelectedAcc(acc);
  };

  const renderAccount = ({ item: acc, index }) => {
    const colorSet = iconColors[index % iconColors.length];
    const balance = acc.currentBalance ?? acc.initialBalance ?? acc.balance ?? 0;
    
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          setEditAccount(acc);
          setShowForm(true);
        }}
      >
        <View style={styles.cardTop}>
          <View style={[styles.cardIconBg, { backgroundColor: colorSet.bg, borderColor: colorSet.border }]}>
            <Ionicons name={getIconName(acc.icon)} size={24} color={colorSet.text} />
          </View>
          <TouchableOpacity 
            style={styles.moreBtn} 
            onPress={() => handleMore(acc)}
            activeOpacity={0.6}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#7c8e88" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.accName} numberOfLines={1}>{acc.name}</Text>
          <Text style={[styles.accBalance, { color: balance >= 0 ? '#1f644e' : '#c94c4c' }]}>
            {balance < 0 ? '-' : ''}{fmt(balance)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[styles.summaryVal, { color: '#1e3a34' }]}>{fmt(stats.totalAccountBalance ?? 0)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={[styles.summaryVal, { color: '#c94c4c' }]}>{fmt(totalExpense ?? 0)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryVal, { color: '#1f644e' }]}>{fmt(totalIncome ?? 0)}</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Your Accounts</Text>
          <TouchableOpacity 
            style={styles.addOutlineBtn} 
            onPress={() => { setEditAccount(null); setShowForm(true); }}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={16} color="#1f644e" />
            <Text style={styles.addOutlineBtnText}>Add Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={accounts}
        renderItem={renderAccount}
        keyExtractor={(a) => a.id}
        numColumns={2}
        columnWrapperStyle={styles.listColumnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="wallet-outline" size={32} color="#7c8e88" />
            </View>
            <Text style={styles.emptyTitle}>No accounts yet</Text>
            <Text style={styles.emptySub}>Tap the button to create one</Text>
          </View>
        }
      />

      {showForm && (
        <AccountForm
          initial={editAccount}
          onSave={editAccount ? (body) => updateAccount(editAccount.id, body) : createAccount}
          onClose={() => { setShowForm(false); setEditAccount(null); }}
        />
      )}

      {/* Account Options Bottom Sheet */}
      <BottomSheet visible={!!selectedAcc} onClose={() => setSelectedAcc(null)}>
        {selectedAcc && (
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
               <Text style={styles.sheetTitleText} numberOfLines={1}>{selectedAcc.name}</Text>
            </View>
            <View style={styles.sheetDivider} />
            <Text style={styles.optionsLabel}>Account options</Text>
            <TouchableOpacity
              style={styles.optionBtn}
              onPress={() => {
                setEditAccount(selectedAcc);
                setSelectedAcc(null);
                setShowForm(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.optionTextEdit}>Edit account</Text>
              <Ionicons name="pencil" size={18} color="#1f644e" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, styles.optionBtnDelete]}
              onPress={() => {
                handleDelete(selectedAcc.id, selectedAcc.name);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.optionTextDelete}>Delete account</Text>
              <Ionicons name="trash" size={18} color="#c94c4c" />
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfbf5' },
  headerArea: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  
  summaryGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryBox: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e5e3d8', 
    borderRadius: 14, 
    paddingVertical: 10, 
    alignItems: 'center' 
  },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: '#7c8e88', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryVal: { fontSize: 14, fontWeight: '700', marginTop: 2 },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1f644e', textTransform: 'uppercase', letterSpacing: 0.5 },
  addOutlineBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    borderWidth: 1, 
    borderColor: '#1f644e', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    paddingVertical: 6 
  },
  addOutlineBtnText: { fontSize: 11, fontWeight: '800', color: '#1f644e' },
  
  listContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  listColumnWrapper: { gap: 12 },
  
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtn: { padding: 4, marginRight: -8, marginTop: -4 },
  
  cardBottom: { marginTop: 20 },
  accName: { fontSize: 14, fontWeight: '700', color: '#1e3a34', marginBottom: 2 },
  accBalance: { fontSize: 18, fontWeight: '800' },
  
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
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1e3a34', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#7c8e88' },
  
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#fcfbf5' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, 
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e3d8',
  },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBtnText: { fontSize: 14, fontWeight: '700', color: '#7c8e88' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1e3a34' },
  headerBtnRight: { minWidth: 60, alignItems: 'flex-end' },
  saveText: { fontSize: 15, fontWeight: '800', color: '#1f644e' },
  
  label: { fontSize: 12, fontWeight: '700', color: '#7c8e88', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  webInputWrapper: { 
    backgroundColor: '#f0f5f2', 
    borderWidth: 1, 
    borderColor: '#1f644e', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 8 
  },
  webInputLabel: { fontSize: 9, fontWeight: '800', color: '#1f644e', marginBottom: 2 },
  webInput: { fontSize: 14, fontWeight: '700', color: '#1e3a34', padding: 0 },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  iconOption: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  iconOptionActive: { backgroundColor: '#1f644e' },
  iconOptionInactive: { backgroundColor: '#f0f5f2' },

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
  labelToggle: { fontSize: 15, fontWeight: '600', color: '#1e3a34' },

  // Bottom Sheet Styles
  sheetContent: { paddingTop: 0, paddingHorizontal: 20, paddingBottom: 20 },
  sheetHeader: { alignItems: 'center', marginBottom: 4 },
  sheetTitleText: { fontSize: 18, fontWeight: '800', color: '#1e3a34' },
  sheetDivider: { height: 1, backgroundColor: '#e5e3d8', marginVertical: 20 },
  optionsLabel: { fontSize: 12, fontWeight: '700', color: '#7c8e88', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  optionBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#f8f9f4', borderRadius: 16,
    borderWidth: 1, borderColor: '#d9e6df', marginBottom: 12,
  },
  optionBtnDelete: { backgroundColor: '#fdf2f2', borderColor: '#f5c6c6' },
  optionTextEdit: { fontSize: 15, fontWeight: '700', color: '#1f644e' },
  optionTextDelete: { fontSize: 15, fontWeight: '700', color: '#c94c4c' },
});
