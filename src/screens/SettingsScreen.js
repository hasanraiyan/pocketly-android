import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clearCredentials, getBaseUrl } from '../api/client';
import { usePocketly } from '../context/PocketlyContext';

export default function SettingsScreen({ navigation, onDisconnect }) {
  const { stats, accounts, categories, fetchBootstrap, periodStart, periodEnd } = usePocketly();
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    setServerUrl(getBaseUrl() || '');
  }, []);

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect',
      'Remove this server connection? You will need to scan the QR code again to reconnect.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await clearCredentials();
            onDisconnect?.();
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    fetchBootstrap(periodStart, periodEnd);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fcfbf5' }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Server Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="server" size={20} color="#1f644e" />
          </View>
          <Text style={styles.cardTitle}>Connected Server</Text>
        </View>
        <View style={styles.serverUrlContainer}>
          <Text style={styles.serverUrl} numberOfLines={2}>{serverUrl || 'Not connected'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#4a86e81a' }]}>
            <Ionicons name="stats-chart" size={20} color="#4a86e8" />
          </View>
          <Text style={styles.cardTitle}>Data Overview</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{accounts.length}</Text>
            <Text style={styles.statLabel}>Accounts</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{stats.totalTransactionCount}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.actionRow} onPress={handleRefresh} activeOpacity={0.7}>
          <View style={styles.iconCircle}>
             <Ionicons name="refresh" size={20} color="#1f644e" />
          </View>
          <Text style={styles.actionText}>Refresh Data</Text>
          <Ionicons name="chevron-forward" size={18} color="#7c8e88" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#f59e0b1a' }]}>
            <Ionicons name="information-circle" size={20} color="#f59e0b" />
          </View>
          <Text style={styles.cardTitle}>About</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>App</Text>
          <Text style={styles.aboutVal}>Pocketly</Text>
        </View>
        <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutVal}>1.0.0</Text>
        </View>
      </View>

      {/* Disconnect */}
      <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#c94c4c" />
        <Text style={styles.disconnectText}>Disconnect from Server</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16,
    borderWidth: 1, 
    borderColor: '#e5e3d8',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1f644e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e3a34' },
  serverUrlContainer: {
    backgroundColor: '#f8f9f4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  serverUrl: { fontSize: 13, color: '#7c8e88', fontFamily: Platform?.OS === 'ios' ? 'Courier' : 'monospace' },
  
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  stat: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 40, backgroundColor: '#e5e3d8' },
  statVal: { fontSize: 24, fontWeight: '800', color: '#1f644e' },
  statLabel: { fontSize: 12, color: '#7c8e88', marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  actionText: { fontSize: 16, fontWeight: '600', color: '#1e3a34' },
  
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e3d8',
  },
  aboutLabel: { fontSize: 14, color: '#7c8e88', fontWeight: '500' },
  aboutVal: { fontSize: 14, fontWeight: '600', color: '#1e3a34' },
  
  disconnectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fdf5f5', borderWidth: 1, borderColor: '#f5c6c6',
    borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 40,
  },
  disconnectText: { fontSize: 16, fontWeight: '700', color: '#c94c4c' },
});
