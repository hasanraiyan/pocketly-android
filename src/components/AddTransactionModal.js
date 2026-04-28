import React, { useState, useEffect, useMemo } from 'react';
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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { usePocketly } from '../context/PocketlyContext';
import BottomSheet from './common/BottomSheet';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TYPES = [
  { id: 'expense', label: 'Expense', icon: 'arrow-down' },
  { id: 'income', label: 'Income', icon: 'arrow-up' },
  { id: 'transfer', label: 'Transfer', icon: 'swap-horizontal' },
];

const getIconName = (icon) => {
  if (!icon) return 'pricetag';
  const name = icon.toLowerCase().replace(/[-_]/g, ' ');
  if (name.includes('food') || name.includes('pizza') || name.includes('utensils') || name.includes('restaurant') || name.includes('dining') || name.includes('coffee') || name.includes('cafe')) return 'fast-food';
  if (name.includes('car') || name.includes('bus') || name.includes('train') || name.includes('transport') || name.includes('fuel') || name.includes('gas') || name.includes('travel')) return 'car';
  if (name.includes('home') || name.includes('house') || name.includes('rent') || name.includes('bill') || name.includes('utility') || name.includes('water') || name.includes('electricity')) return 'home';
  if (name.includes('shopping') || name.includes('cart') || name.includes('bag') || name.includes('grocery') || name.includes('store') || name.includes('clothing')) return 'cart';
  if (name.includes('health') || name.includes('heart') || name.includes('medical') || name.includes('doctor') || name.includes('pharmacy') || name.includes('fitness') || name.includes('gym')) return 'heart';
  if (name.includes('gift') || name.includes('present') || name.includes('birthday') || name.includes('donation')) return 'gift';
  if (name.includes('salary') || name.includes('cash') || name.includes('money') || name.includes('income') || name.includes('dividend') || name.includes('interest')) return 'cash';
  if (name.includes('wallet') || name.includes('bank') || name.includes('savings')) return 'wallet';
  if (name.includes('entertainment') || name.includes('play') || name.includes('game') || name.includes('movie') || name.includes('music') || name.includes('hobby')) return 'game-controller';
  if (name.includes('education') || name.includes('book') || name.includes('school') || name.includes('tuition') || name.includes('learning')) return 'book';
  if (name.includes('personal') || name.includes('self') || name.includes('beauty') || name.includes('spa')) return 'person';
  if (name.includes('work') || name.includes('office') || name.includes('business')) return 'briefcase';
  if (name.includes('tax') || name.includes('government')) return 'receipt';
  if (name.includes('other') || name.includes('misc') || name.includes('extra')) return 'ellipsis-horizontal';
  return 'pricetag';
};

export default function AddTransactionModal({ visible, onClose, editData = null }) {
  const { accounts, categories, createTransaction, updateTransaction, deleteTransaction } = usePocketly();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showAccountSelector, setShowAccountSelector] = useState(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editData) {
        setType(editData.type || 'expense');
        setAmount(editData.amount?.toString() || '0');
        setNote(editData.note || '');
        setAccountId(editData.account?.id || '');
        setToAccountId(editData.toAccount?.id || '');
        setCategoryId(editData.category?.id || '');
      } else {
        setType('expense');
        setAmount('0');
        setNote('');
        setCategoryId('');
        if (accounts.length > 0) setAccountId(accounts[0].id);
        setToAccountId('');
      }
    }
  }, [visible, editData, accounts]);

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);
  const selectedCategory = useMemo(() => categories.find(c => c.id === categoryId), [categories, categoryId]);
  const selectedAccount = useMemo(() => accounts.find(a => a.id === accountId), [accounts, accountId]);
  const selectedToAccount = useMemo(() => accounts.find(a => a.id === toAccountId), [accounts, toAccountId]);

  const handleKeypad = (val) => {
    if (val === 'backspace') {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (['+', '-', 'x', '/'].includes(val)) {
      setAmount((prev) => {
        // Prevent multiple operators in a row
        if (['+', '-', 'x', '/'].includes(prev.slice(-1))) {
          return prev.slice(0, -1) + val;
        }
        return prev + val;
      });
    } else if (val === '=') {
      try {
        // Replace 'x' with '*' for evaluation
        const expr = amount.replace(/x/g, '*');
        // Simple and safe evaluation using basic parser or Function
        // Note: In a real app we might want a more robust math parser
        const result = eval(expr); 
        setAmount(String(Math.round(result * 100) / 100));
      } catch {
        setAmount('0');
      }
    } else if (val === '.') {
      setAmount((prev) => {
        // Only allow one dot per number segment
        const parts = prev.split(/[+\-x/]/);
        const lastPart = parts[parts.length - 1];
        if (!lastPart.includes('.')) return prev + '.';
        return prev;
      });
    } else {
      setAmount((prev) => (prev === '0' ? val : prev + val));
    }
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!accountId) {
      Alert.alert('Error', 'Please select an account');
      return;
    }
    if (type === 'transfer' && !toAccountId) {
      Alert.alert('Error', 'Please select a destination account');
      return;
    }

    const body = {
      type,
      amount: parsedAmount,
      note: note || (type === 'transfer' ? 'Transfer' : 'Transaction'),
      account: accountId,
      category: type === 'transfer' ? undefined : (categoryId || undefined),
      toAccount: type === 'transfer' ? toAccountId : undefined,
      date: editData?.date || new Date().toISOString(),
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
      Alert.alert('Error', err.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(editData.id);
            onClose();
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const KeyBtn = ({ value, label, operator, primary }) => (
    <TouchableOpacity
      onPress={() => handleKeypad(value)}
      activeOpacity={0.5}
      style={[
        styles.keyBtn,
        operator && styles.keyBtnOperator,
        primary && styles.keyBtnPrimary
      ]}
    >
      <Text style={[
        styles.keyBtnText,
        operator && styles.keyBtnTextOperator,
        primary && styles.keyBtnTextPrimary
      ]}>
        {label || value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#7c8e88" />
            <Text style={styles.headerBtnText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {editData ? 'Edit' : (type.charAt(0).toUpperCase() + type.slice(1))}
          </Text>

          <TouchableOpacity 
            onPress={handleSave} 
            disabled={parseFloat(amount) <= 0 || saving}
            style={styles.headerBtnRight}
          >
            {saving ? (
              <ActivityIndicator color="#1f644e" size="small" />
            ) : (
              <Text style={[styles.saveText, (parseFloat(amount) <= 0) && { opacity: 0.4 }]}>
                {editData ? 'Update' : 'Save'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Type Selector */}
        <View style={styles.typeSelectorContainer}>
          <View style={styles.typeSelector}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => { setType(t.id); setCategoryId(''); }}
                style={[styles.typeOption, type === t.id && styles.typeOptionActive]}
              >
                <Ionicons name={t.icon} size={16} color={type === t.id ? '#1f644e' : '#7c8e88'} />
                <Text style={[styles.typeOptionText, type === t.id && styles.typeOptionTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Account/Category Pickers */}
          <View style={styles.pickerRow}>
            {type === 'transfer' ? (
              <>
                <View style={styles.pickerCol}>
                  <Text style={styles.pickerLabel}>FROM</Text>
                  <TouchableOpacity 
                    style={styles.pickerBtn} 
                    onPress={() => setShowAccountSelector('main')}
                  >
                    <Ionicons name="wallet-outline" size={18} color="#7c8e88" />
                    <Text style={styles.pickerBtnText} numberOfLines={1}>
                      {selectedAccount?.name || 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerCol}>
                  <Text style={styles.pickerLabel}>TO</Text>
                  <TouchableOpacity 
                    style={styles.pickerBtn} 
                    onPress={() => setShowAccountSelector('to')}
                  >
                    <Ionicons name="wallet-outline" size={18} color="#7c8e88" />
                    <Text style={styles.pickerBtnText} numberOfLines={1}>
                      {selectedToAccount?.name || 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.pickerCol}>
                  <Text style={styles.pickerLabel}>ACCOUNT</Text>
                  <TouchableOpacity 
                    style={styles.pickerBtn} 
                    onPress={() => setShowAccountSelector('main')}
                  >
                    <Ionicons name="wallet-outline" size={18} color="#7c8e88" />
                    <Text style={styles.pickerBtnText} numberOfLines={1}>
                      {selectedAccount?.name || 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerCol}>
                  <Text style={styles.pickerLabel}>CATEGORY</Text>
                  <TouchableOpacity 
                    style={styles.pickerBtn} 
                    onPress={() => setShowCategorySelector(true)}
                  >
                    {selectedCategory ? (
                      <View style={[styles.catIconSmall, { backgroundColor: selectedCategory.color || '#1f644e' }]}>
                        <Ionicons name={getIconName(selectedCategory.icon)} size={12} color="#fff" />
                      </View>
                    ) : (
                      <Ionicons name="pricetag-outline" size={18} color="#7c8e88" />
                    )}
                    <Text style={styles.pickerBtnText} numberOfLines={1}>
                      {selectedCategory?.name || 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Note Input */}
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note..."
              placeholderTextColor="#7c8e88"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>

          {/* Amount Display */}
          <View style={styles.amountContainer}>
            <View style={styles.amountWrapper}>
               <Text style={styles.currencySymbol}>₹</Text>
               <Text style={[styles.amountText, amount === '0' && { color: '#7c8e88' }]}>{amount}</Text>
               <TouchableOpacity onPress={() => handleKeypad('backspace')} style={styles.backspaceBtn}>
                 <Ionicons name="backspace-outline" size={28} color="#7c8e88" />
               </TouchableOpacity>
            </View>
          </View>

          {/* Calculator Grid */}
          <View style={styles.calculatorGrid}>
            <View style={styles.calcRow}><KeyBtn value="7" /><KeyBtn value="8" /><KeyBtn value="9" /><KeyBtn value="/" label="÷" operator /></View>
            <View style={styles.calcRow}><KeyBtn value="4" /><KeyBtn value="5" /><KeyBtn value="6" /><KeyBtn value="x" label="×" operator /></View>
            <View style={styles.calcRow}><KeyBtn value="1" /><KeyBtn value="2" /><KeyBtn value="3" /><KeyBtn value="-" operator /></View>
            <View style={styles.calcRow}><KeyBtn value="." /><KeyBtn value="0" /><KeyBtn value="+" operator /><KeyBtn value="=" primary /></View>
          </View>

          {editData && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#c94c4c" />
              <Text style={styles.deleteBtnText}>Delete Transaction</Text>
            </TouchableOpacity>
          )}

          <View style={styles.dateTimeContainer}>
             <Ionicons name="calendar-outline" size={16} color="#7c8e88" />
             <Text style={styles.dateTimeText}>
               {dayjs(editData?.date || new Date()).format('MMMM D, YYYY · h:mm A')}
             </Text>
          </View>
        </ScrollView>

        {/* Account Selector Sheet */}
        <BottomSheet visible={!!showAccountSelector} onClose={() => setShowAccountSelector(null)}>
          <Text style={styles.sheetTitle}>Select Account</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {accounts.map(acc => {
              const isSelected = (showAccountSelector === 'main' && accountId === acc.id) || 
                                (showAccountSelector === 'to' && toAccountId === acc.id);
              return (
                <TouchableOpacity 
                  key={acc.id} 
                  style={[styles.accountItem, isSelected && styles.accountItemActive]}
                  onPress={() => {
                    if (showAccountSelector === 'main') setAccountId(acc.id);
                    else setToAccountId(acc.id);
                    setShowAccountSelector(null);
                  }}
                  activeOpacity={0.6}
                >
                  <View style={[styles.accountIconBg, isSelected && { backgroundColor: '#1f644e' }]}>
                    <Ionicons name="wallet" size={20} color={isSelected ? '#fff' : '#1f644e'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.accountName, isSelected && { color: '#1f644e' }]}>{acc.name}</Text>
                    <Text style={styles.accountBalance}>₹{(acc.currentBalance ?? acc.initialBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#1f644e" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </BottomSheet>

        {/* Category Selector Sheet */}
        <BottomSheet visible={showCategorySelector} onClose={() => setShowCategorySelector(false)}>
          <Text style={styles.sheetTitle}>Select Category</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.categoryGrid}>
              <TouchableOpacity 
                style={styles.categoryItem}
                onPress={() => {
                  setCategoryId('');
                  setShowCategorySelector(false);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconBg, { backgroundColor: '#f0f5f2' }, !categoryId && { borderWidth: 2, borderColor: '#1f644e' }]}>
                  <Ionicons name="close" size={24} color="#7c8e88" />
                </View>
                <Text style={[styles.categoryName, !categoryId && { color: '#1f644e' }]} numberOfLines={1}>None</Text>
              </TouchableOpacity>
              {filteredCategories.map(cat => {
                const isSelected = categoryId === cat.id;
                return (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={styles.categoryItem}
                    onPress={() => {
                      setCategoryId(cat.id);
                      setShowCategorySelector(false);
                    }}
                    activeOpacity={0.6}
                  >
                    <View style={[
                      styles.categoryIconBg, 
                      { backgroundColor: cat.color || '#1f644e' },
                      isSelected && { borderWidth: 2, borderColor: '#1e3a34' }
                    ]}>
                      <Ionicons name={getIconName(cat.icon)} size={24} color="#fff" />
                    </View>
                    <Text style={[styles.categoryName, isSelected && { color: '#1e3a34', fontWeight: '800' }]} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </BottomSheet>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#fcfbf5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e3d8',
  },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBtnText: { fontSize: 14, fontWeight: '700', color: '#7c8e88' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1e3a34' },
  headerBtnRight: { minWidth: 60, alignItems: 'flex-end' },
  saveText: { fontSize: 15, fontWeight: '800', color: '#1f644e' },

  typeSelectorContainer: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e3d8' },
  typeSelector: { flexDirection: 'row', backgroundColor: '#f0f5f2', borderRadius: 12, gap: 4, padding: 4 },
  typeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8, gap: 6, paddingVertical: 8 },
  typeOptionActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  typeOptionText: { fontSize: 12, fontWeight: '700', color: '#7c8e88' },
  typeOptionTextActive: { color: '#1f644e' },

  content: { flex: 1 },
  pickerRow: { flexDirection: 'row', gap: 12, padding: 16 },
  pickerCol: { flex: 1 },
  pickerLabel: { fontSize: 10, fontWeight: '800', color: '#7c8e88', marginBottom: 6, letterSpacing: 1 },
  pickerBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e5e3d8', 
    borderRadius: 12, 
    padding: 12 
  },
  pickerBtnText: { fontSize: 14, fontWeight: '700', color: '#1e3a34', flex: 1 },
  catIconSmall: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  noteContainer: { paddingHorizontal: 16, marginBottom: 12 },
  noteInput: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e5e3d8', 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 14, 
    color: '#1e3a34',
    minHeight: 44
  },

  amountContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  amountWrapper: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e5e3d8', 
    borderRadius: 20, 
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  currencySymbol: { fontSize: 24, fontWeight: '700', color: '#7c8e88' },
  amountText: { fontSize: 40, fontWeight: '800', color: '#1e3a34', flex: 1, textAlign: 'center' },
  backspaceBtn: { padding: 4 },

  calculatorGrid: { padding: 16, gap: 8 },
  calcRow: { flexDirection: 'row', gap: 8 },
  keyBtn: { 
    flex: 1, 
    height: 56, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e5e3d8', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  keyBtnOperator: { backgroundColor: '#f0f5f2', borderColor: '#d9e6df' },
  keyBtnPrimary: { backgroundColor: '#1f644e', borderColor: '#1f644e' },
  keyBtnText: { fontSize: 20, fontWeight: '700', color: '#1e3a34' },
  keyBtnTextOperator: { color: '#1f644e' },
  keyBtnTextPrimary: { color: '#fff' },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, marginHorizontal: 16, backgroundColor: '#fdf2f2', borderRadius: 16, borderWidth: 1, borderColor: '#f5c6c6', marginTop: 12 },
  deleteBtnText: { fontSize: 14, fontWeight: '700', color: '#c94c4c' },

  dateTimeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 20 },
  dateTimeText: { fontSize: 12, fontWeight: '600', color: '#7c8e88' },

  sheetTitle: { fontSize: 12, fontWeight: '800', color: '#7c8e88', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  accountItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, borderBottomWidth: 1, borderBottomColor: '#f0f5f2' },
  accountItemActive: { backgroundColor: '#f0f5f2', borderBottomWidth: 0 },
  accountIconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f0f5f2', justifyContent: 'center', alignItems: 'center' },
  accountName: { fontSize: 15, fontWeight: '700', color: '#1e3a34' },
  accountBalance: { fontSize: 13, fontWeight: '700', color: '#7c8e88' },

  categoryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    columnGap: 12,
    rowGap: 20,
    paddingBottom: 20,
  },
  categoryItem: { 
    width: (SCREEN_WIDTH - 40 - 36) / 4, 
    alignItems: 'center', 
  },
  categoryIconBg: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    borderCurve: 'continuous',
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    marginBottom: 8,
  },
  categoryName: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: '#7c8e88', 
    textAlign: 'center',
    width: '100%',
  },
});
