import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { OnboardingQuestionnaireScreen } from './src/screens/onboarding/OnboardingQuestionnaireScreen';
import { VocabularyTestScreen } from './src/screens/onboarding/VocabularyTestScreen';
import { RootStackParamList } from './src/navigation/types';
import { VocabularyResultScreen } from 'screens/onboarding/VocabularyResultScreen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { UserLogin } from 'screens/onboarding/UserLogin';
import { UserSignup } from 'screens/onboarding/UserSignup';
import { QuestionnaireScreen } from 'screens/onboarding/QuestionnaireScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 , backgroundColor: '#1a1a1a'}}>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Welcome"
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#1a1a1a' },
                    animation: 'fade',
                    animationDuration: 200,
                    presentation: 'transparentModal',
                  }}
                >
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
                  {/* <Stack.Screen name="Dashboard" component={DashboardScreen} /> */}
                  {/* <Stack.Screen name="OnboardingQuestionnaire" component={OnboardingQuestionnaireScreen} /> */}
                  {/* <Stack.Screen name="VocabularyTest" component={VocabularyTestScreen} /> */}
                  {/* <Stack.Screen name="VocabularyResult" component={VocabularyResultScreen} /> */}
                  <Stack.Screen name="UserSignup" component={UserSignup} />
                  <Stack.Screen name="UserLoginScreen" component={UserLogin} />
                  <Stack.Screen name="QuestionnaireScreen" component={QuestionnaireScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </SafeAreaView>
          </SafeAreaProvider>
  );
}
