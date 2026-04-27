import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Button from '../../common/Button';

export default function QRScanner({ onScanned }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

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
      onScanned(parsed);
    } catch {
      Alert.alert('Error', 'Could not read QR code. Try manual entry instead.', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
    } finally {
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1f644e" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardText}>Camera permission is needed to scan the QR code.</Text>
        <Button title="Grant Camera Access" onPress={requestPermission} />
      </View>
    );
  }

  return (
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
      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
          <Text style={styles.rescanText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  cardText: { color: '#1e3a34', fontSize: 14, lineHeight: 20, textAlign: 'center' },
});