import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function CustomHeader({ title, navigation, options, route }) {
  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {canGoBack ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1e3a34" />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandContainer}>
              <View style={styles.iconCircle}>
                <Image
                  source={require('../../../assets/pocketly.png')}
                  style={styles.brandIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandText}>Pocketly</Text>
            </View>
          )}
        </View>

        <View style={styles.rightContainer}>
          <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
            <View style={styles.profileIconCircle}>
              <Ionicons name="person" size={20} color="#1f644e" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e3d8',
    paddingTop: Platform.OS === 'android' ? 10 : 0, // Handle status bar on Android if not using Expo StatusBar
  },
  container: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f0f5f2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  brandIcon: {
    width: 30,
    height: 30,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e3a34',
    letterSpacing: -0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 2,
  },
  profileIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1f644e1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
});
