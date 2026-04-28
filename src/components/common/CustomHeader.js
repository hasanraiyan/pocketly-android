import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Platform, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function CustomHeader({ title, navigation, options, route }) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const animationValue = useRef(new Animated.Value(0)).current;

  // List of bottom tab screen names
  const tabScreens = [
    'Records',
    'Accounts',
    'Analysis',
    'Planning',
    'Chat',
  ];
  
  const isTabScreen = tabScreens.includes(route?.name);
  const canGoBack = navigation.canGoBack() && !isTabScreen;
  const isRecordsScreen = route?.name === 'Records';

  useEffect(() => {
    if (isSearching) {
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        searchInputRef.current?.focus();
      });
    } else {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setSearchQuery('');
      if (isRecordsScreen) {
        navigation.setParams({ search: '' });
      }
    }
  }, [isSearching]);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    navigation.setParams({ search: text });
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
  };

  const searchWidth = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const contentOpacity = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const searchOpacity = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <Animated.View style={[styles.leftContainer, { opacity: contentOpacity }]}>
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
          </Animated.View>

          {isRecordsScreen && isSearching && (
            <Animated.View style={[styles.searchBarContainer, { width: searchWidth, opacity: searchOpacity }]}>
              <Ionicons name="search" size={20} color="#1f644e" style={styles.searchIconInside} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search transactions..."
                placeholderTextColor="#7c8e88"
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCorrect={false}
              />
              <TouchableOpacity onPress={toggleSearch} style={styles.closeSearchButton}>
                <Ionicons name="close-circle" size={20} color="#7c8e88" />
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View style={[styles.rightContainer, { opacity: contentOpacity }]}>
            {isRecordsScreen && !isSearching && (
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={toggleSearch}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={24} color="#1f644e" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.profileButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.profileIconCircle}>
                <Ionicons name="person" size={20} color="#1f644e" />
              </View>
            </TouchableOpacity>
          </Animated.View>
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
    paddingTop: Platform.OS === 'android' ? 5 : 0, // Reduce top padding
  },
  container: {
    height: 40, // Reduced height for compactness
    paddingHorizontal: 8, // Less horizontal padding
    paddingBottom: 0,
    justifyContent: 'center',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    height: '100%',
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
    gap: 8,
  },
  headerIconButton: {
    padding: 2,
  },
  iconCircleSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f0f5f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  profileButton: {
    padding: 2,
  },
  profileIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f644e1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e3d8',
  },
  searchBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5f2',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 34,
    zIndex: 10,
  },
  searchIconInside: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e3a34',
    paddingVertical: 0,
  },
  closeSearchButton: {
    padding: 4,
  },
});

