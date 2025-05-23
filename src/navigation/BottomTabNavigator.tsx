import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { UserSettingsScreen } from '../screens/settings/UserSettingsScreen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const checkVoiceAnalysis = async () => {
      try {
        const hasAnalyzedVoice = await AsyncStorage.getItem('hasAnalyzedVoice');
        if (!hasAnalyzedVoice) {
          // Only navigate to SelfIntroScreen if voice hasn't been analyzed
          navigation.navigate('SelfIntroScreen');
        }
      } catch (error) {
        console.error('Error checking voice analysis status:', error);
      }
    };

    checkVoiceAnalysis();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#246bfd',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={UserSettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 