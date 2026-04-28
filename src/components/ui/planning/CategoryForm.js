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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const categoryIcons = [
  'fast-food', 'car', 'cart', 'receipt', 'film', 'heart', 'people', 'book', 'briefcase', 'laptop', 'trophy', 'pricetag', 'trending-up', 'cafe', 'home', 'airplane', 'musical-notes', 'gift', 'baby', 'paw', 'shirt', 'hammer', 'wifi', 'flash', 'fitness', 'medical', 'school', 'brush', 'camera', 'location'
];

const categoryColors = [
  '#1f644e', '#2d8a6e', '#3ba88a', '#5cbfa6', '#4a86e8', '#9333ea', '#ef4444', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6'
];

export default function CategoryForm({ visible, initial, onSave, onClose }) {
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
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
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
               {categoryIcons.map((ico) => (
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
});
