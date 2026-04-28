import React, { useState } from 'react';
import {
  View,
  Text,
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
import BottomSheet from '../../common/BottomSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

export default function BudgetForm({ visible, initial, categories, onSave, onClose }) {
  const [categoryId, setCategoryId] = useState(initial?.category?.id || initial?.category || '');
  const [limit, setLimit] = useState(initial?.limit?.toString() || initial?.amount?.toString() || '');
  const [period, setPeriod] = useState(initial?.period || 'monthly');
  const [showCatSheet, setShowCatSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const selectedCat = categories.find(c => c.id === categoryId);

  const handleSave = async () => {
    if (!categoryId) { Alert.alert('Error', 'Select a category.'); return; }
    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) { Alert.alert('Error', 'Enter a valid limit.'); return; }
    setSaving(true);
    try {
      await onSave({ category: categoryId, amount: parsedLimit, period });
      onClose();
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#7c8e88" />
            <Text style={styles.headerBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{initial ? 'Edit Budget' : 'New Budget'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.headerBtnRight}>
            {saving ? <ActivityIndicator color="#1f644e" size="small" /> : <Text style={styles.saveText}>Save</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 24 }}>
          <View>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity style={styles.webInputWrapper} onPress={() => setShowCatSheet(true)}>
              <Text style={styles.webInputLabel}>CATEGORY</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {selectedCat && (
                   <View style={[styles.catIconMini, { backgroundColor: selectedCat.color || '#1f644e' }]}>
                      <Ionicons name={getIconName(selectedCat.icon)} size={10} color="#fff" />
                   </View>
                )}
                <Text style={[styles.webInput, !selectedCat && { color: '#7c8e88' }]}>
                  {selectedCat?.name || 'Select a category'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View>
            <Text style={styles.label}>Limit Amount (₹)</Text>
            <View style={styles.webInputWrapper}>
              <Text style={styles.webInputLabel}>LIMIT</Text>
              <TextInput style={styles.webInput} value={limit} onChangeText={setLimit} keyboardType="decimal-pad" placeholder="e.g. 5000" placeholderTextColor="#7c8e88" />
            </View>
          </View>

          <View>
            <Text style={styles.label}>Period</Text>
            <View style={styles.chipRow}>
              {['weekly', 'monthly', 'yearly'].map((p) => (
                <TouchableOpacity key={p} style={[styles.chip, period === p && styles.chipActive]} onPress={() => setPeriod(p)}>
                  <Text style={[styles.chipText, period === p && styles.chipTextActive]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <BottomSheet visible={showCatSheet} onClose={() => setShowCatSheet(false)}>
           <Text style={styles.sheetTitle}>Select Category</Text>
           <ScrollView showsVerticalScrollIndicator={false}>
             <View style={styles.categoryGrid}>
               {expenseCategories.map(cat => (
                 <TouchableOpacity 
                    key={cat.id} 
                    style={styles.categoryItem}
                    onPress={() => { setCategoryId(cat.id); setShowCatSheet(false); }}
                 >
                   <View style={[styles.categoryIconBg, { backgroundColor: cat.color || '#1f644e' }]}>
                     <Ionicons name={getIconName(cat.icon)} size={24} color="#fff" />
                   </View>
                   <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                 </TouchableOpacity>
               ))}
             </View>
           </ScrollView>
        </BottomSheet>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#fcfbf5' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e3d8'
  },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBtnText: { fontSize: 14, fontWeight: '700', color: '#7c8e88' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1e3a34' },
  headerBtnRight: { minWidth: 60, alignItems: 'flex-end' },
  saveText: { fontSize: 15, fontWeight: '800', color: '#1f644e' },
  label: { fontSize: 12, fontWeight: '700', color: '#7c8e88', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  webInputWrapper: { backgroundColor: '#f0f5f2', borderWidth: 1, borderColor: '#1f644e', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  webInputLabel: { fontSize: 9, fontWeight: '800', color: '#1f644e', marginBottom: 2 },
  webInput: { fontSize: 14, fontWeight: '700', color: '#1e3a34', padding: 0 },
  catIconMini: { width: 18, height: 18, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#e5e3d8', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#1f644e', borderColor: '#1f644e' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#7c8e88' },
  chipTextActive: { color: '#fff' },
  sheetTitle: { fontSize: 12, fontWeight: '800', color: '#7c8e88', textTransform: 'uppercase', marginBottom: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 20 },
  categoryItem: { width: (SCREEN_WIDTH - 40 - 36) / 4, alignItems: 'center' },
  categoryIconBg: { width: 52, height: 52, borderRadius: 16, borderCurve: 'continuous', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 8 },
  categoryName: { fontSize: 10, fontWeight: '700', color: '#7c8e88', textAlign: 'center', width: '100%' },
});
