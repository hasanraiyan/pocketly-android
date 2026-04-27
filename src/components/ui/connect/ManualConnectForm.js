import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { saveCredentials } from '../../../api/client';
import Input from '../../common/Input';
import Button from '../../common/Button';

export default function ManualConnectForm({ onConnected }) {
  const [manualUrl, setManualUrl] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    const url = manualUrl.trim().replace(/\/$/, '');
    const token = manualToken.trim();
    if (!url || !token) {
      Alert.alert('Missing fields', 'Enter both the server URL and the token.');
      return;
    }
    setConnecting(true);
    try {
      // Quick connectivity check
      const res = await fetch(`${url}/api/money/bootstrap`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        Alert.alert('Connection failed', 'Invalid URL or token. Check your credentials.');
        return;
      }
      await saveCredentials(url, token);
      onConnected();
    } catch {
      Alert.alert('Connection failed', 'Could not reach the server. Check your URL.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Input
        label="Server URL"
        placeholder="https://your-site.com"
        value={manualUrl}
        onChangeText={setManualUrl}
        autoCapitalize="none"
        keyboardType="url"
      />

      <Input
        label="Token"
        placeholder="Paste your mobile token here"
        value={manualToken}
        onChangeText={setManualToken}
        autoCapitalize="none"
        multiline
        numberOfLines={3}
      />

      <Button
        title="Connect"
        onPress={handleConnect}
        disabled={connecting}
      />

      <TouchableOpacity>
        <Text style={styles.linkText}>← Scan QR instead</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  linkText: { color: '#1f644e', fontWeight: '600', fontSize: 14, marginTop: 8, textAlign: 'center' },
});