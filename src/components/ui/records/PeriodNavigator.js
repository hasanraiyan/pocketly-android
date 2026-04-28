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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => onNavigate('prev')}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={20} color="#1e3a34" />
      </TouchableOpacity>

      <View style={styles.labelContainer}>
        <Text style={styles.periodLabel} numberOfLines={1}>{periodLabel()}</Text>
      </View>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => onNavigate('next')}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-forward" size={20} color="#1e3a34" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e3d8',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a34',
  },
});
