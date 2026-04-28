import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePocketly } from '../context/PocketlyContext';
import BottomSheet from '../components/common/BottomSheet';
import CategoryItem from '../components/ui/planning/CategoryItem';
import BudgetItem from '../components/ui/planning/BudgetItem';
import CategoryForm from '../components/ui/planning/CategoryForm';
import BudgetForm from '../components/ui/planning/BudgetForm';
import dayjs from 'dayjs';

export default function PlanningScreen() {
  const { 
    budgets, categories, transactions, 
    createBudget, updateBudget, deleteBudget,
    createCategory, updateCategory, deleteCategory
  } = usePocketly();

  const [activeTab, setActiveTab] = useState('categories');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const handleMore = (item, type) => {
    setSelectedItem({ ...item, _type: type });
  };

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
               {incomeCategories.map(cat => (
                 <CategoryItem key={cat.id} cat={cat} onMore={(c) => handleMore(c, 'Category')} />
               ))}
             </View>

             <View style={[styles.sectionHeader, { marginTop: 24 }]}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <Ionicons name="trending-down" size={16} color="#c94c4c" />
                 <Text style={styles.sectionTitle}>Expense</Text>
                 <View style={styles.badge}><Text style={styles.badgeText}>{expenseCategories.length}</Text></View>
               </View>
             </View>
             <View style={styles.categoryGridFlow}>
               {expenseCategories.map(cat => (
                 <CategoryItem key={cat.id} cat={cat} onMore={(c) => handleMore(c, 'Category')} />
               ))}
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
                 <Ionicons name="disc-outline" size={48} color="#e5e3d8" />
                 <Text style={styles.emptyText}>No budgets set</Text>
               </View>
             ) : (
               <View style={{ gap: 12 }}>
                 {budgetProgress.map((b) => (
                   <BudgetItem key={b.id} budget={b} onMore={(bu) => handleMore(bu, 'Budget')} />
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
          visible={showCategoryForm}
          initial={editCategory} 
          onSave={editCategory ? (b) => updateCategory(editCategory.id, b) : createCategory}
          onClose={() => { setShowCategoryForm(false); setEditCategory(null); }} 
        />
      )}

      {showBudgetForm && (
        <BudgetForm 
          visible={showBudgetForm}
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

  tabContent: { paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1e3a34', textTransform: 'uppercase' },
  badge: { backgroundColor: '#f0f5f2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#7c8e88' },

  categoryGridFlow: { gap: 8 },
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

  emptyCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e3d8', borderRadius: 20, padding: 40, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, fontWeight: '700', color: '#7c8e88' },

  sheetContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sheetTitleText: { fontSize: 18, fontWeight: '800', color: '#1e3a34', textAlign: 'center' },
  sheetDivider: { height: 1, backgroundColor: '#e5e3d8', marginVertical: 20 },
  optionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8f9f4', borderRadius: 16, borderWidth: 1, borderColor: '#d9e6df', marginBottom: 12 },
  optionBtnDelete: { backgroundColor: '#fdf2f2', borderColor: '#f5c6c6' },
  optionTextEdit: { fontSize: 15, fontWeight: '700', color: '#1f644e' },
  optionTextDelete: { fontSize: 15, fontWeight: '700', color: '#c94c4c' },
});
