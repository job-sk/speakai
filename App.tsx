import React from 'react';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { RootStackParamList } from './src/navigation/types';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { UserLogin } from 'screens/onboarding/UserLogin';
import { UserSignup } from 'screens/onboarding/UserSignup';
import { QuestionnaireScreen } from 'screens/onboarding/QuestionnaireScreen';
import { SelfIntroScreen } from 'screens/onboarding/SelfIntroScreen';
import { EventRegister } from 'react-native-event-listeners';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { BackHandler } from 'react-native';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';
import { ReadingSessionScreen } from 'screens/practice/ReadingSessionScreen';
import { ReadingResultScreen } from 'screens/practice/ReadingResultScreen';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/utils/toast';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentRoute = useNavigationState(state => state?.routes[state.index]?.name);

  useEffect(() => {
    const listener = EventRegister.addEventListener('AUTH_EXPIRED', () => {
      logout();
      navigation.navigate('UserLoginScreen');
    }) as string;

    return () => {
      EventRegister.removeEventListener(listener);
    };
  }, [navigation, logout]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isAuthenticated) {
        if (currentRoute === 'UserLoginScreen' || currentRoute === 'UserSignup') {
          return true;
        }
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isAuthenticated, navigation, currentRoute]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? "MainTabs" : "Welcome"}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a1a' },
        animation: 'fade',
        animationDuration: 200,
        presentation: 'transparentModal',
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="UserSignup" component={UserSignup} />
          <Stack.Screen name="QuestionnaireScreen" component={QuestionnaireScreen} />
          <Stack.Screen name="UserLoginScreen" component={UserLogin} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="SelfIntroScreen" component={SelfIntroScreen} />
          <Stack.Screen name="ReadingSessionScreen" component={ReadingSessionScreen} />
          <Stack.Screen name="ReadingResultScreen" component={ReadingResultScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function AppContent() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
        <StatusBar style="light" />
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AppContent />
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}
