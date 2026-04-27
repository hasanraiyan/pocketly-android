import { TextInput, Text, StyleSheet, View } from 'react-native';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline,
  numberOfLines,
  style,
  inputStyle,
  labelStyle,
  ...props
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[styles.input, multiline && styles.multiline, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7c8e88"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c8e88',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e3d8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e3a34',
    backgroundColor: '#f7faf7',
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
});