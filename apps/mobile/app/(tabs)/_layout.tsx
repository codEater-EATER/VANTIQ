import { Tabs } from 'expo-router';
import { MessageCircle, Target, TrendingUp, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#202124', borderTopColor: '#8C7BB8' },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <MessageCircle size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color }) => (
            <Target size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <TrendingUp size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Settings size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
