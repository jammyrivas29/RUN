import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// ── Screens ──
import GuestHomeScreen from '../screens/home/GuestHomeScreen';   // 👈 new guest screen
import UserHomeScreen from '../screens/home/UserHomeScreen';     // 👈 new user screen
import GuidesListScreen from '../screens/firstAid/GuidesListScreen';
import GuideDetailEnhancedScreen from '../screens/firstAid/GuideDetailEnhancedScreen';
import EmergencyScreen from '../screens/emergency/EmergencyScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChatbotScreen from '../screens/chatbot/ChatbotScreen';
import HospitalLocatorScreen from '../screens/hospital/HospitalLocatorScreen';
import VideoInstructionsScreen from '../screens/videos/VideoInstructionsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Guides Stack (shared by both guest and user) ──
function GuidesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GuidesList"
        component={GuidesListScreen}
        options={{
          title: 'First Aid Guides',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailEnhancedScreen}
        options={{
          title: 'Guide Detail',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Videos"
        component={VideoInstructionsScreen}
        options={{
          title: 'Video Instructions',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// ── Guest Stack — no tab bar, uses GuestHomeScreen ──
function GuestStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={GuestHomeScreen}              // 👈 GuestHomeScreen here
        options={{
          title: 'MediFirst',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen
        name="Guides"
        component={GuidesStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          title: 'AI Assistant',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Hospital"
        component={HospitalLocatorScreen}
        options={{
          title: 'Hospitals',
          headerStyle: { backgroundColor: '#e74c3c' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// ── Main Navigator ──
export default function TabNavigator() {
  const { isAuthenticated, isGuest } = useSelector((state) => state.auth);

  // Guest or not authenticated → no tab bar
  if (isGuest || !isAuthenticated) {
    return <GuestStack />;
  }

  // Logged-in user → full tab navigation with UserHomeScreen
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:      focused ? 'home'         : 'home-outline',
            Guides:    focused ? 'book'         : 'book-outline',
            Hospital:  focused ? 'medical'      : 'medical-outline',
            Emergency: focused ? 'warning'      : 'warning-outline',
            Chatbot:   focused ? 'chatbubbles'  : 'chatbubbles-outline',
            Profile:   focused ? 'person'       : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        headerStyle: { backgroundColor: '#e74c3c' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={UserHomeScreen}               // 👈 UserHomeScreen here
        options={{ title: 'MediFirst' }}
      />
      <Tab.Screen
        name="Guides"
        component={GuidesStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Hospital"
        component={HospitalLocatorScreen}
        options={{ title: 'Hospitals' }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          tabBarLabel: 'Emergency',
          tabBarBadge: '!',
          tabBarBadgeStyle: { backgroundColor: '#e74c3c', color: '#fff' },
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ title: 'AI Assistant' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
}