import { View, Text, StyleSheet } from 'react-native';
import Button from '../../common/Button';

export default function PermissionRequest({ onRequestPermission }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>Camera permission is needed to scan the QR code.</Text>
      <Button title="Grant Camera Access" onPress={onRequestPermission} />
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
  cardText: { color: '#1e3a34', fontSize: 14, lineHeight: 20, textAlign: 'center' },
});