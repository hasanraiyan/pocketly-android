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
          headerStyle: { backgroundColor: '#1f644e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
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