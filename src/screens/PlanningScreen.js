import React, { useState, useMemo } from 'react';
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
import dayjs from 'dayjs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INR = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const fmt = (n) => `₹${INR.format(Math.abs(n))}`;

const categoryIcons = [
  'fast-food', 'car', 'cart', 'receipt', 'film', 'heart', 'people', 'book', 'briefcase', 'laptop', 'trophy', 'pricetag', 'trending-up', 'cafe', 'home', 'airplane', 'musical-notes', 'gift', 'baby', 'paw', 'shirt', 'hammer', 'wifi', 'flash', 'fitness', 'medical', 'school', 'brush', 'camera', 'location'
];

const categoryColors = [
  '#1f644e', '#2d8a6e', '#3ba88a', '#5cbfa6', '#4a86e8', '#9333ea', '#ef4444', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6'
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

// ... categoryIcons list truncated ... use similar map as web

function CategoryForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState(initial?.type || 'expense');
  const [icon, setIcon] = useState(initial?.icon || 'pricetag');
  const [color, setColor] = useState(initial?.color || '#1f644e');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name is required.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), type, icon, color });
      onClose();
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#7c8e88" />
            <Text style={styles.headerBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{initial ? 'Edit Category' : 'New Category'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.headerBtnRight}>
            {saving ? <ActivityIndicator color="#1f644e" size="small" /> : <Text style={styles.saveText}>Save</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
           <View>
             <Text style={styles.label}>Category Name</Text>
             <View style={styles.webInputWrapper}>
               <Text style={styles.webInputLabel}>NAME</Text>
               <TextInput style={styles.webInput} value={name} onChangeText={setName} placeholder="e.g. Food" placeholderTextColor="#7c8e88" />
             </View>
           </View>

           <View>
             <Text style={styles.label}>Type</Text>
             <View style={styles.typeSwitcher}>
               {['expense', 'income'].map((t) => (
                 <TouchableOpacity 
                   key={t} 
                   onPress={() => setType(t)} 
                   style={[styles.typeOption, type === t && styles.typeOptionActive]}
                 >
                   <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextActive]}>{t.toUpperCase()}</Text>
                 </TouchableOpacity>
               ))}
             </View>
           </View>

           <View>
             <Text style={styles.label}>Select Color</Text>
             <View style={styles.colorGrid}>
               {categoryColors.map((c) => (
                 <TouchableOpacity 
                   key={c} 
                   onPress={() => setColor(c)} 
                   style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorCircleActive]} 
                 />
               ))}
             </View>
           </View>

           <View>
             <Text style={styles.label}>Select Icon</Text>
             <View style={styles.iconPickerGrid}>
               {categoryIcons.slice(0, 30).map((ico) => (
                 <TouchableOpacity 
                    key={ico} 
                    onPress={() => setIcon(ico)} 
                    style={[styles.iconPickerItem, icon === ico && { backgroundColor: color }]}
                 >
                   <Ionicons name={ico} size={20} color={icon === ico ? '#fff' : '#7c8e88'} />
                 </TouchableOpacity>
               ))}
             </View>
           </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function BudgetForm({ initial, categories, onSave, onClose }) {
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
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
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
                {selectedCat && <View style={[styles.catIconMini, { backgroundColor: selectedCat.color || '#1f644e' }]} />}
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

export default function PlanningScreen() {
  const { 
    budgets, categories, transactions, 
    createBudget, updateBudget, deleteBudget,
    createCategory, updateCategory, deleteCategory
  } = usePocketly();

  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'budgets'
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // For generic bottom sheet more actions

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const budgetProgress = useMemo(() => {
    const now = dayjs();
    return budgets.map((b) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && (t.category?.id === b.category?.id || t.category === b.category?.id) && dayjs(t.date).isSame(now, 'month'))
        .reduce((s, t) => s + t.amount, 0);
      const pct = b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0;
      return { ...b, spent, progress: pct, isExceeded: spent > b.amount };
    });
  }, [budgets, transactions]);

  const handleDelete = (item, type) => {
    Alert.alert(`Delete ${type}`, `Are you sure?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          if (type === 'Category') await deleteCategory(item.id);
          else await deleteBudget(item.id);
          setSelectedItem(null);
        } catch (err) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  const renderCategoryItem = (cat) => (
    <View key={cat.id} style={styles.cardSmall}>
      <View style={[styles.iconCircleSmall, { backgroundColor: cat.color || '#1f644e' }]}>
        <Ionicons name={getIconName(cat.icon)} size={16} color="#fff" />
      </View>
      <Text style={styles.catNameSmall} numberOfLines={1}>{cat.name}</Text>
      <TouchableOpacity onPress={() => setSelectedItem({ ...cat, _type: 'Category' })} style={styles.moreBtnSmall}>
        <Ionicons name="ellipsis-vertical" size={16} color="#7c8e88" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity 
          style={[styles.tabCard, activeTab === 'categories' && styles.tabCardActive]}
          onPress={() => setActiveTab('categories')}
        >
          <View style={[styles.tabIconBg, activeTab === 'categories' && styles.tabIconBgActive]}>
            <Ionicons name="pricetags" size={20} color={activeTab === 'categories' ? '#fff' : '#1f644e'} />
          </View>
          <View>
            <Text style={[styles.tabLabel, activeTab === 'categories' && { color: '#1f644e' }]}>CATEGORIES</Text>
            <Text style={styles.tabCount}>{categories.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabCard, activeTab === 'budgets' && styles.tabCardActive]}
          onPress={() => setActiveTab('budgets')}
        >
          <View style={[styles.tabIconBg, activeTab === 'budgets' && styles.tabIconBgActive]}>
            <Ionicons name={activeTab === 'budgets' ? 'disc' : 'disc-outline'} size={20} color={activeTab === 'budgets' ? '#fff' : '#1f644e'} />
          </View>
          <View>
            <Text style={[styles.tabLabel, activeTab === 'budgets' && { color: '#1f644e' }]}>BUDGETS</Text>
            <Text style={styles.tabCount}>{budgets.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'categories' ? (
          <View style={styles.tabContent}>
             <View style={styles.sectionHeader}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <Ionicons name="trending-up" size={16} color="#1f644e" />
                 <Text style={styles.sectionTitle}>Income</Text>
                 <View style={styles.badge}><Text style={styles.badgeText}>{incomeCategories.length}</Text></View>
               </View>
             </View>
             <View style={styles.categoryGridFlow}>
               {incomeCategories.map(renderCategoryItem)}
             </View>

             <View style={[styles.sectionHeader, { marginTop: 24 }]}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <Ionicons name="trending-down" size={16} color="#c94c4c" />
                 <Text style={styles.sectionTitle}>Expense</Text>
                 <View style={styles.badge}><Text style={styles.badgeText}>{expenseCategories.length}</Text></View>
               </View>
             </View>
             <View style={styles.categoryGridFlow}>
               {expenseCategories.map(renderCategoryItem)}
             </View>

             <TouchableOpacity 
                style={styles.addOutlineBtnLarge}
                onPress={() => { setEditCategory(null); setShowCategoryForm(true); }}
             >
               <Ionicons name="add" size={18} color="#1f644e" />
               <Text style={styles.addOutlineBtnTextLarge}>Add Category</Text>
             </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tabContent}>
             <View style={styles.sectionHeader}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <Ionicons name="flash" size={16} color="#1f644e" />
                 <Text style={styles.sectionTitle}>Active Budgets</Text>
               </View>
               <TouchableOpacity 
                 style={styles.addPrimaryBtn}
                 onPress={() => { setEditBudget(null); setShowBudgetForm(true); }}
               >
                 <Ionicons name="add" size={16} color="#fff" />
                 <Text style={styles.addPrimaryBtnText}>New Budget</Text>
               </TouchableOpacity>
             </View>

             {budgetProgress.length === 0 ? (
               <View style={styles.emptyCard}>
                 <Ionicons name="target-outline" size={48} color="#e5e3d8" />
                 <Text style={styles.emptyText}>No budgets set</Text>
               </View>
             ) : (
               <View style={{ gap: 12 }}>
                 {budgetProgress.map((b) => (
                   <View key={b.id} style={styles.budgetCard}>
                      <View style={styles.budgetCardHeader}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                           <View style={[styles.iconCircleSmall, { backgroundColor: b.category?.color || '#1f644e' }]}>
                             <Ionicons name={getIconName(b.category?.icon)} size={18} color="#fff" />
                           </View>
                           <View>
                             <Text style={styles.budgetCatName}>{b.category?.name || 'Category'}</Text>
                             <Text style={styles.budgetPeriod}>{b.period}</Text>
                           </View>
                         </View>
                         <TouchableOpacity onPress={() => setSelectedItem({ ...b, _type: 'Budget' })}>
                           <Ionicons name="ellipsis-vertical" size={20} color="#7c8e88" />
                         </TouchableOpacity>
                      </View>

                      <View style={styles.budgetStats}>
                        <View>
                          <Text style={[styles.spentAmount, b.isExceeded && { color: '#c94c4c' }]}>{fmt(b.spent)}</Text>
                          <Text style={styles.limitLabel}>of {fmt(b.amount)} limit</Text>
                        </View>
                        {b.isExceeded && (
                          <View style={styles.exceededBadge}>
                            <Ionicons name="warning" size={10} color="#c94c4c" />
                            <Text style={styles.exceededText}>Exceeded</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${b.progress}%`, backgroundColor: b.isExceeded ? '#c94c4c' : '#1f644e' }]} />
                      </View>
                      <Text style={styles.progressPct}>{b.progress.toFixed(0)}%</Text>
                   </View>
                 ))}
               </View>
             )}
          </View>
        )}
      </ScrollView>

      {/* Options Bottom Sheet */}
      <BottomSheet visible={!!selectedItem} onClose={() => setSelectedItem(null)}>
        {selectedItem && (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitleText}>{selectedItem.name || selectedItem.category?.name}</Text>
            <View style={styles.sheetDivider} />
            <TouchableOpacity 
              style={styles.optionBtn}
              onPress={() => {
                if (selectedItem._type === 'Category') { setEditCategory(selectedItem); setShowCategoryForm(true); }
                else { setEditBudget(selectedItem); setShowBudgetForm(true); }
                setSelectedItem(null);
              }}
            >
              <Text style={styles.optionTextEdit}>Edit {selectedItem._type}</Text>
              <Ionicons name="pencil" size={18} color="#1f644e" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionBtn, styles.optionBtnDelete]} onPress={() => handleDelete(selectedItem, selectedItem._type)}>
              <Text style={styles.optionTextDelete}>Delete {selectedItem._type}</Text>
              <Ionicons name="trash" size={18} color="#c94c4c" />
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>

      {showCategoryForm && (
        <CategoryForm 
          initial={editCategory} 
          onSave={editCategory ? (b) => updateCategory(editCategory.id, b) : createCategory}
          onClose={() => { setShowCategoryForm(false); setEditCategory(null); }} 
        />
      )}

      {showBudgetForm && (
        <BudgetForm 
          initial={editBudget} 
          categories={categories}
          onSave={editBudget ? (b) => updateBudget(editBudget.id, b) : createBudget}
          onClose={() => { setShowBudgetForm(false); setEditBudget(null); }} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfbf5' },
  tabSwitcher: { flexDirection: 'row', padding: 16, gap: 12, marginBottom: 8 },
  tabCard: { 
    flex: 1, backgroundColor: '#fcfbf5', borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 20, 
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, position: 'relative', overflow: 'hidden'
  },
  tabCardActive: { backgroundColor: '#fff', borderColor: '#1f644e', elevation: 4, shadowColor: '#1f644e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  tabIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1f644e1a', justifyContent: 'center', alignItems: 'center' },
  tabIconBgActive: { backgroundColor: '#1f644e' },
  tabLabel: { fontSize: 9, fontWeight: '800', color: '#7c8e88', letterSpacing: 0.5 },
  tabCount: { fontSize: 18, fontWeight: '900', color: '#1e3a34' },
  activeDot: { position: 'absolute', top: 12, right: 12, width: 6, height: 6, borderRadius: 3, backgroundColor: '#1f644e' },

  tabContent: { paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1e3a34', textTransform: 'uppercase' },
  badge: { backgroundColor: '#f0f5f2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#7c8e88' },

  categoryGridFlow: { gap: 8 },
  cardSmall: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 16, padding: 12, gap: 12 
  },
  iconCircleSmall: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catNameSmall: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1e3a34' },
  moreBtnSmall: { padding: 4 },

  addOutlineBtnLarge: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, 
    borderWidth: 1, borderColor: '#1f644e', borderRadius: 12, padding: 12, marginTop: 24 
  },
  addOutlineBtnTextLarge: { fontSize: 13, fontWeight: '800', color: '#1f644e' },

  addPrimaryBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: '#1f644e', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 
  },
  addPrimaryBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },

  budgetCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 20, padding: 16 },
  budgetCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  budgetCatName: { fontSize: 15, fontWeight: '700', color: '#1e3a34' },
  budgetPeriod: { fontSize: 11, color: '#7c8e88', textTransform: 'capitalize' },
  budgetStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  spentAmount: { fontSize: 22, fontWeight: '800', color: '#1e3a34' },
  limitLabel: { fontSize: 12, fontWeight: '600', color: '#7c8e88' },
  exceededBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, 
    backgroundColor: '#fdf2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 
  },
  exceededText: { fontSize: 10, fontWeight: '800', color: '#c94c4c', textTransform: 'uppercase' },
  progressBarBg: { height: 8, backgroundColor: '#f0f5f2', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressPct: { fontSize: 10, fontWeight: '800', color: '#7c8e88', textAlign: 'right', marginTop: 4 },

  emptyCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 20, padding: 40, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, fontWeight: '700', color: '#7c8e88' },

  // Modal & Generic styles
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
  typeSwitcher: { flexDirection: 'row', backgroundColor: '#f0f5f2', borderRadius: 12, padding: 4, gap: 4 },
  typeOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  typeOptionActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  typeOptionText: { fontSize: 11, fontWeight: '800', color: '#7c8e88' },
  typeOptionTextActive: { color: '#1f644e' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorCircleActive: { borderWidth: 3, borderColor: '#1e3a34' },
  iconPickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconPickerItem: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0f5f2', justifyContent: 'center', alignItems: 'center' },
  catIconMini: { width: 12, height: 12, borderRadius: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#e5e3d8', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#1f644e', borderColor: '#1f644e' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#7c8e88' },
  chipTextActive: { color: '#fff' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e3d8' },
  labelToggle: { fontSize: 15, fontWeight: '600', color: '#1e3a34' },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sheetTitleText: { fontSize: 18, fontWeight: '800', color: '#1e3a34', textAlign: 'center' },
  sheetDivider: { height: 1, backgroundColor: '#e5e3d8', marginVertical: 20 },
  optionsLabel: { fontSize: 12, fontWeight: '700', color: '#7c8e88', textTransform: 'uppercase', marginBottom: 12 },
  optionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8f9f4', borderRadius: 16, borderWidth: 1, borderColor: '#d9e6df', marginBottom: 12 },
  optionBtnDelete: { backgroundColor: '#fdf2f2', borderColor: '#f5c6c6' },
  optionTextEdit: { fontSize: 15, fontWeight: '700', color: '#1f644e' },
  optionTextDelete: { fontSize: 15, fontWeight: '700', color: '#c94c4c' },
  sheetTitle: { fontSize: 12, fontWeight: '800', color: '#7c8e88', textTransform: 'uppercase', marginBottom: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 20 },
  categoryItem: { width: (SCREEN_WIDTH - 40 - 36) / 4, alignItems: 'center' },
  categoryIconBg: { width: 52, height: 52, borderRadius: 16, borderCurve: 'continuous', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 8 },
  categoryName: { fontSize: 10, fontWeight: '700', color: '#7c8e88', textAlign: 'center', width: '100%' },
});
