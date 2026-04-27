import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

export default function PeriodNavigator({ periodStart, periodEnd, periodType, onNavigate }) {
  const periodLabel = () => {
    const s = dayjs(periodStart);
    const e = dayjs(periodEnd);
    if (periodType === 'week') return `${s.format('D MMM')} – ${e.format('D MMM')}`;
    if (periodType === 'month') return s.format('MMMM YYYY');
    return `${s.format('D MMM')} – ${e.format('D MMM YYYY')}`;
  };

  return (
    <View style={styles.periodBar}>
      <TouchableOpacity onPress={() => onNavigate('prev')}>
        <Ionicons name="chevron-back" size={22} color="#1f644e" />
      </TouchableOpacity>
      <Text style={styles.periodLabel}>{periodLabel()}</Text>
      <TouchableOpacity onPress={() => onNavigate('next')}>
        <Ionicons name="chevron-forward" size={22} color="#1f644e" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  periodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e3d8',
  },
  periodLabel: { fontSize: 15, fontWeight: '700', color: '#1e3a34' },
});