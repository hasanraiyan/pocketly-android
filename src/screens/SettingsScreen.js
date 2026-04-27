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
    <ScrollView style={{ flex: 1, backgroundColor: '#f0f5f2' }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Server Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="server" size={20} color="#1f644e" />
          <Text style={styles.cardTitle}>Connected Server</Text>
        </View>
        <Text style={styles.serverUrl} numberOfLines={2}>{serverUrl || 'Not connected'}</Text>
      </View>

      {/* Stats */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart" size={20} color="#4a86e8" />
          <Text style={styles.cardTitle}>Data Overview</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{accounts.length}</Text>
            <Text style={styles.statLabel}>Accounts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{stats.totalTransactionCount}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.actionRow} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#1f644e" />
          <Text style={styles.actionText}>Refresh Data</Text>
          <Ionicons name="chevron-forward" size={16} color="#7c8e88" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={20} color="#f59e0b" />
          <Text style={styles.cardTitle}>About</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>App</Text>
          <Text style={styles.aboutVal}>Pocketly Mobile</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutVal}>1.0.0</Text>
        </View>
      </View>

      {/* Disconnect */}
      <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
        <Ionicons name="log-out-outline" size={18} color="#c94c4c" />
        <Text style={styles.disconnectText}>Disconnect from Server</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#e5e3d8',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e3a34' },
  serverUrl: { fontSize: 13, color: '#7c8e88', fontFamily: Platform?.OS === 'ios' ? 'Courier' : 'monospace' },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800', color: '#1f644e' },
  statLabel: { fontSize: 12, color: '#7c8e88', marginTop: 2 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4,
  },
  actionText: { fontSize: 15, fontWeight: '600', color: '#1e3a34' },
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#e5e3d8',
  },
  aboutLabel: { fontSize: 14, color: '#7c8e88' },
  aboutVal: { fontSize: 14, fontWeight: '600', color: '#1e3a34' },
  disconnectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#f0d2d2',
    borderRadius: 14, padding: 16,
  },
  disconnectText: { fontSize: 15, fontWeight: '700', color: '#c94c4c' },
});