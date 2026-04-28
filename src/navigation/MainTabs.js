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
import CustomHeader from '../components/common/CustomHeader';

const Tab = createBottomTabNavigator();

const ICON_MAP = {
  Records: { active: 'list', inactive: 'list-outline' },
  Accounts: { active: 'wallet', inactive: 'wallet-outline' },
  Analysis: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Planning: { active: 'calendar', inactive: 'calendar-outline' },
  Chat: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export default function MainTabs({ onDisconnect }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: (props) => <CustomHeader {...props} />,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons 
            name={focused ? ICON_MAP[route.name].active : ICON_MAP[route.name].inactive} 
            size={24} 
            color={color} 
          />
        ),
        tabBarActiveTintColor: '#1f644e',
        tabBarInactiveTintColor: '#7c8e88',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 4,
        },
        tabBarStyle: { 
          backgroundColor: '#fff', 
          borderTopColor: '#e5e3d8',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Records" component={RecordsScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Planning" component={PlanningScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}
