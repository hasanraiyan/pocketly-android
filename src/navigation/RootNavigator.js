import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabs from './MainTabs';
import SettingsScreen from '../screens/SettingsScreen';
import CustomHeader from '../components/common/CustomHeader';
import { PocketlyProvider } from '../context/PocketlyContext';

const RootStack = createStackNavigator();

export default function RootNavigator({ onDisconnect }) {
  return (
    <PocketlyProvider>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs">
          {props => <MainTabs {...props} onDisconnect={onDisconnect} />}
        </RootStack.Screen>
        <RootStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={({ navigation, route, options }) => ({
            header: (props) => <CustomHeader {...props} title="Settings" />,
            headerShown: true,
          })}
        />
      </RootStack.Navigator>
    </PocketlyProvider>
  );
}
