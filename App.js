import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

import { loadCredentials } from './src/api/client';
import ConnectScreen from './src/screens/ConnectScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainTabs from './src/navigation/MainTabs';

const Stack = createStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    Promise.all([
      loadCredentials(),
      SecureStore.getItemAsync('onboarding_completed'),
    ])
      .then(([hasCredentials, onboarding]) => {
        setAuthenticated(hasCredentials);
        setOnboardingCompleted(onboarding === 'true');
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f5f2' }}>
        <ActivityIndicator color="#1f644e" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          {authenticated ? (
            <MainTabs onDisconnect={() => setAuthenticated(false)} />
          ) : onboardingCompleted ? (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Connect">
                {(props) => <ConnectScreen {...props} onConnected={() => setAuthenticated(true)} />}
              </Stack.Screen>
            </Stack.Navigator>
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Onboarding">
                {(props) => <OnboardingScreen {...props} onComplete={() => setOnboardingCompleted(true)} />}
              </Stack.Screen>
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}