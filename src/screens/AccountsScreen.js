import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePocketly } from '../context/PocketlyContext';
import BottomSheet from '../components/common/BottomSheet';
import AccountSummary from '../components/ui/accounts/AccountSummary';
import AccountCard from '../components/ui/accounts/AccountCard';
import AccountForm from '../components/ui/accounts/AccountForm';

export default function AccountsScreen() {
  const { 
    accounts, stats, totalIncome, totalExpense, 
    createAccount, updateAccount, deleteAccount 
  } = usePocketly();
  
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

  const handleEdit = (acc) => {
    setEditAccount(acc);
    setShowForm(true);
    setSelectedAcc(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <AccountSummary 
          stats={stats} 
          totalIncome={totalIncome} 
          totalExpense={totalExpense} 
        />

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
        renderItem={({ item, index }) => (
          <AccountCard 
            acc={item} 
            index={index} 
            onPress={handleEdit} 
            onMore={handleMore} 
          />
        )}
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

      <AccountForm
        visible={showForm}
        initial={editAccount}
        onSave={editAccount ? (body) => updateAccount(editAccount.id, body) : createAccount}
        onClose={() => { setShowForm(false); setEditAccount(null); }}
      />

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
              onPress={() => handleEdit(selectedAcc)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionTextEdit}>Edit account</Text>
              <Ionicons name="pencil" size={18} color="#1f644e" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, styles.optionBtnDelete]}
              onPress={() => handleDelete(selectedAcc.id, selectedAcc.name)}
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
