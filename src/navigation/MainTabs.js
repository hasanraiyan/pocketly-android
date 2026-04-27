import { View, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import RecordsScreen from '../screens/RecordsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import PlanningScreen from '../screens/PlanningScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { PocketlyProvider } from '../context/PocketlyContext';

const Tab = createBottomTabNavigator();

const ICON_MAP = {
  Records: 'list',
  Accounts: 'wallet',
  Analysis: 'bar-chart',
  Planning: 'calendar',
  Chat: 'chatbubble-ellipses',
  Settings: 'settings',
};

export default function MainTabs({ onDisconnect }) {
  return (
    <PocketlyProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={ICON_MAP[route.name]} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#1f644e',
          tabBarInactiveTintColor: '#7c8e88',
          tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e5e3d8' },
          headerStyle: { 
            backgroundColor: '#fff', 
            borderBottomWidth: 1, 
            borderBottomColor: '#e5e3d8',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          headerTintColor: '#1f644e',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitle: () => (
            <Image
              source={require('../../assets/pocketly.png')}
              style={{ width: 100, height: 35, resizeMode: 'contain' }}
            />
          ),
        })}
      >
        <Tab.Screen name="Records" component={RecordsScreen} />
        <Tab.Screen name="Accounts" component={AccountsScreen} />
        <Tab.Screen name="Analysis" component={AnalysisScreen} />
        <Tab.Screen name="Planning" component={PlanningScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Settings">
          {(props) => <SettingsScreen {...props} onDisconnect={onDisconnect} />}
        </Tab.Screen>
      </Tab.Navigator>
    </PocketlyProvider>
  );
}