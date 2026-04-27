import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { saveCredentials } from '../api/client';

export default function ConnectScreen({ onConnected }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const parsed = JSON.parse(data);
      if (!parsed.baseUrl || !parsed.token) {
        Alert.alert('Invalid QR', 'This QR code is not a valid Pocketly pairing code.', [
          { text: 'Try Again', onPress: () => setScanned(false) },
        ]);
        return;
      }
      setConnecting(true);
      await saveCredentials(parsed.baseUrl.replace(/\/$/, ''), parsed.token);
      onConnected();
    } catch {
      Alert.alert('Error', 'Could not read QR code. Try manual entry instead.', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
    } finally {
      setConnecting(false);
    }
  };

  const handleManualConnect = async () => {
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

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1f644e" />
      </View>
    );
  }

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
            {!permission.granted ? (
              <View style={styles.card}>
                <Text style={styles.cardText}>Camera permission is needed to scan the QR code.</Text>
                <TouchableOpacity style={styles.btn} onPress={requestPermission}>
                  <Text style={styles.btnText}>Grant Camera Access</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraWrapper}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  onBarcodeScanned={scanned ? undefined : handleScanned}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                />
                <View style={styles.scanOverlay}>
                  <View style={styles.scanCorner} />
                </View>
                {scanned && !connecting && (
                  <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
                    <Text style={styles.rescanText}>Tap to Scan Again</Text>
                  </TouchableOpacity>
                )}
                {connecting && (
                  <View style={styles.connectingOverlay}>
                    <ActivityIndicator color="#fff" size="large" />
                    <Text style={styles.connectingText}>Connecting…</Text>
                  </View>
                )}
              </View>
            )}

            <Text style={styles.hint}>
              Go to Pocketly web app → Settings → Generate QR Code, then scan it here.
            </Text>

            <TouchableOpacity onPress={() => setShowManual(true)}>
              <Text style={styles.linkText}>Enter credentials manually</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Server URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://your-site.com"
              value={manualUrl}
              onChangeText={setManualUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.label}>Token</Text>
            <TextInput
              style={[styles.input, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}
              placeholder="Paste your mobile token here"
              value={manualToken}
              onChangeText={setManualToken}
              autoCapitalize="none"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.btn, connecting && styles.btnDisabled]}
              onPress={handleManualConnect}
              disabled={connecting}
            >
              {connecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Connect</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowManual(false)}>
              <Text style={styles.linkText}>← Scan QR instead</Text>
            </TouchableOpacity>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 36, fontWeight: '800', color: '#1f644e' },
  subtitle: { fontSize: 16, color: '#7c8e88', marginTop: 4 },
  cameraWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  camera: { flex: 1 },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCorner: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 12,
    opacity: 0.6,
  },
  rescanBtn: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rescanText: { color: '#fff', fontWeight: '600' },
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  connectingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  hint: {
    textAlign: 'center',
    color: '#7c8e88',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 20,
  },
  linkText: { color: '#1f644e', fontWeight: '600', fontSize: 14, marginTop: 8 },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  cardText: { color: '#1e3a34', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#7c8e88' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e3d8',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1e3a34',
    backgroundColor: '#f7faf7',
  },
  btn: {
    backgroundColor: '#1f644e',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});