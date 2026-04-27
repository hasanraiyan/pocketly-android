import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { saveCredentials } from '../api/client';
import QRScanner from '../components/ui/connect/QRScanner';
import ManualConnectForm from '../components/ui/connect/ManualConnectForm';

export default function ConnectScreen({ onConnected }) {
  const [showManual, setShowManual] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleScanned = async (parsed) => {
    setConnecting(true);
    await saveCredentials(parsed.baseUrl.replace(/\/$/, ''), parsed.token);
    onConnected();
    setConnecting(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image
            source={require('../../assets/pocketly.png')}
            style={{ width: 100, height: 100, marginBottom: 12, resizeMode: 'contain' }}
          />
          <Text style={styles.title}>Pocketly</Text>
          <Text style={styles.subtitle}>Connect to your server</Text>
        </View>

        {!showManual ? (
          <>
            <QRScanner onScanned={handleScanned} />

            <Text style={styles.hint}>
              Go to Pocketly web app → Settings → Generate QR Code, then scan it here.
            </Text>

            <TouchableOpacity onPress={() => setShowManual(true)}>
              <Text style={styles.linkText}>Enter credentials manually</Text>
            </TouchableOpacity>
          </>
        ) : (
          <ManualConnectForm onConnected={onConnected} />
        )}

        {showManual && (
          <TouchableOpacity onPress={() => setShowManual(false)}>
            <Text style={styles.linkText}>← Scan QR instead</Text>
          </TouchableOpacity>
        )}

        {connecting && (
          <View style={styles.connectingOverlay}>
            <ActivityIndicator color="#fff" size="large" />
            <Text style={styles.connectingText}>Connecting…</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f5f2',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 36, fontWeight: '800', color: '#1f644e' },
  subtitle: { fontSize: 16, color: '#7c8e88', marginTop: 4 },
  hint: {
    textAlign: 'center',
    color: '#7c8e88',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 20,
  },
  linkText: { color: '#1f644e', fontWeight: '600', fontSize: 14, marginTop: 8 },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  connectingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});