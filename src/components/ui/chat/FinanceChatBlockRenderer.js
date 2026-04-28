import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IconRenderer from '../../common/IconRenderer';

const INR = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

const accountIconColors = [
  { bg: '#ffedd5', text: '#f97316', border: '#fed7aa' },
  { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' },
  { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  { bg: '#f3e8ff', text: '#9333ea', border: '#e9d5ff' },
  { bg: '#fee2e2', text: '#ef4444', border: '#fecaca' },
];

export default function FinanceChatBlockRenderer({ block, onInteract }) {
  if (!block?.kind) return null;

  switch (block.kind) {
    case 'summary_cards':
      return <SummaryCardsBlock block={block} onInteract={onInteract} />;
    case 'transaction_list':
      return <TransactionListBlock block={block} onInteract={onInteract} />;
    case 'accounts_snapshot':
      return <AccountsSnapshotBlock block={block} onInteract={onInteract} />;
    case 'transaction_confirmation':
      return <TransactionConfirmationBlock block={block} onInteract={onInteract} />;
    default:
      return null;
  }
}

function SummaryCardsBlock({ block, onInteract }) {
  const data = block.data || {};
  const cards = [
    { label: 'Income', value: data.totalIncome, icon: 'trending-up', color: '#1f644e' },
    { label: 'Expense', value: data.totalExpense, icon: 'trending-down', color: '#c94c4c' },
    { label: 'Net Flow', value: data.netFlow, icon: 'swap-horizontal', color: data.netFlow >= 0 ? '#1f644e' : '#c94c4c' },
    { label: 'Balance', value: data.totalAccountBalance, icon: 'wallet', color: '#1e3a34' },
  ];

  return (
    <View style={styles.blockContainer}>
      <View style={styles.blockHeader}>
        <Text style={styles.blockTitle}>{block.title || 'Finance Summary'}</Text>
      </View>
      <View style={styles.summaryGrid}>
        {cards.map((card) => (
          <View key={card.label} style={styles.summaryCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.miniIconBg, { backgroundColor: card.color + '1a' }]}>
                 <Ionicons name={card.icon} size={14} color={card.color} />
              </View>
              <Text style={styles.summaryLabel}>{card.label}</Text>
            </View>
            <Text style={[styles.summaryVal, { color: card.color }]}>{fmt(card.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TransactionListBlock({ block, onInteract }) {
  const items = block.data?.items || [];

  return (
    <View style={styles.blockContainer}>
      <Text style={styles.blockTitle}>{block.title || 'Recent Transactions'}</Text>
      {items.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <View style={{ gap: 8, marginTop: 12 }}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.description || item.category}</Text>
                <Text style={styles.itemSub} numberOfLines={1}>{item.account}</Text>
              </View>
              <Text style={[styles.itemAmount, { color: item.type === 'expense' ? '#c94c4c' : '#1f644e' }]}>
                {item.type === 'expense' ? '-' : '+'}{fmt(item.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function AccountsSnapshotBlock({ block }) {
  const items = block.data?.items || [];

  return (
    <View style={styles.blockContainer}>
      <Text style={styles.blockTitle}>{block.title || 'Accounts'}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 12 }}>
        {items.map((item, index) => {
          const colorSet = accountIconColors[index % accountIconColors.length];
          return (
            <View key={item.id} style={styles.accSnapCard}>
               <View style={[styles.accSnapIcon, { backgroundColor: colorSet.bg, borderColor: colorSet.border }]}>
                  <IconRenderer name={item.icon} size={20} color={colorSet.text} />
               </View>
               <Text style={styles.accSnapName} numberOfLines={1}>{item.name}</Text>
               <Text style={[styles.accSnapBalance, { color: item.balance >= 0 ? '#1f644e' : '#c94c4c' }]}>
                 {fmt(item.balance)}
               </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TransactionConfirmationBlock({ block, onInteract }) {
  const data = block.data || {};
  const [status, setStatus] = useState('idle');

  const handleConfirm = () => {
    setStatus('saving');
    onInteract?.({ type: 'confirm_transaction', data, setStatus });
  };

  if (status === 'success') {
    return (
      <View style={[styles.blockContainer, styles.successBlock]}>
        <Ionicons name="checkmark-circle" size={24} color="#1f644e" />
        <Text style={styles.successText}>Transaction recorded successfully</Text>
      </View>
    );
  }

  return (
    <View style={styles.blockContainer}>
      <Text style={styles.blockTitle}>Confirm Transaction</Text>
      <View style={styles.confirmCard}>
         <View style={styles.confirmHeader}>
            <View style={{ flex: 1 }}>
               <Text style={styles.confirmDesc}>{data.description || 'New Transaction'}</Text>
               <Text style={styles.confirmType}>{data.type?.toUpperCase()}</Text>
            </View>
            <Text style={[styles.confirmAmount, { color: data.type === 'expense' ? '#c94c4c' : '#1f644e' }]}>
              {data.type === 'expense' ? '-' : '+'}{fmt(data.amount)}
            </Text>
         </View>
         
         <View style={styles.confirmDetails}>
            <View style={styles.detailItem}>
               <Text style={styles.detailLabel}>ACCOUNT</Text>
               <Text style={styles.detailVal}>{data.accountName || 'Primary'}</Text>
            </View>
            <View style={styles.detailItem}>
               <Text style={styles.detailLabel}>CATEGORY</Text>
               <Text style={styles.detailVal}>{data.categoryName || 'Uncategorized'}</Text>
            </View>
         </View>
      </View>

      <View style={styles.actionsRow}>
         <TouchableOpacity 
           style={styles.confirmBtn} 
           onPress={handleConfirm}
           disabled={status === 'saving'}
         >
           {status === 'saving' ? (
             <ActivityIndicator color="#fff" size="small" />
           ) : (
             <Text style={styles.confirmBtnText}>Confirm</Text>
           )}
         </TouchableOpacity>
         <TouchableOpacity 
           style={styles.editBtn}
           onPress={() => onInteract?.({ type: 'cancel_transaction', data })}
         >
           <Text style={styles.editBtnText}>Edit Manually</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blockContainer: {
    backgroundColor: '#f8f9f4',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    marginTop: 8,
    width: '100%',
  },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  blockTitle: { fontSize: 12, fontWeight: '800', color: '#7c8e88', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  summaryCard: { 
    width: '48.5%', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#e5e3d8' 
  },
  miniIconBg: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: '#7c8e88', textTransform: 'uppercase' },
  summaryVal: { fontSize: 14, fontWeight: '800', marginTop: 4 },

  emptyBlock: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 12, color: '#7c8e88', fontWeight: '600' },

  itemRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 10, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e3d8'
  },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#1e3a34' },
  itemSub: { fontSize: 10, color: '#7c8e88', marginTop: 2 },
  itemAmount: { fontSize: 13, fontWeight: '800' },

  accSnapCard: { 
    width: 140, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#e5e3d8',
    gap: 8
  },
  accSnapIcon: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  accSnapName: { fontSize: 12, fontWeight: '700', color: '#1e3a34' },
  accSnapBalance: { fontSize: 14, fontWeight: '800' },

  confirmCard: { backgroundColor: '#fff', borderRadius: 16, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#e5e3d8' },
  confirmHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', pb: 10, paddingBottom: 10 },
  confirmDesc: { fontSize: 14, fontWeight: '700', color: '#1e3a34' },
  confirmType: { fontSize: 9, fontWeight: '800', color: '#7c8e88', marginTop: 2 },
  confirmAmount: { fontSize: 16, fontWeight: '800' },
  confirmDetails: { flexDirection: 'row', gap: 16, marginTop: 10 },
  detailLabel: { fontSize: 8, fontWeight: '800', color: '#7c8e88', marginBottom: 2 },
  detailVal: { fontSize: 11, fontWeight: '700', color: '#1e3a34' },

  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  confirmBtn: { flex: 1, backgroundColor: '#1e3a34', borderRadius: 20, paddingVertical: 10, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  editBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 20, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { color: '#1e3a34', fontSize: 12, fontWeight: '800' },

  successBlock: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', py: 16, paddingVertical: 16 },
  successText: { fontSize: 13, fontWeight: '700', color: '#1f644e' },
});
