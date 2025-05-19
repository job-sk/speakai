import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay
} from 'react-native-reanimated';
import { useFonts, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withSpring(1);
    subtitleOpacity.value = withDelay(300, withSpring(1));
    buttonScale.value = withDelay(600, withSpring(1));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: withSpring(titleOpacity.value * 20) }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: withSpring(subtitleOpacity.value * 20) }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonScale.value,
    transform: [{ scale: buttonScale.value }],
  }));

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.Text style={[styles.title, titleStyle]}>
          SpeakAI
        </Animated.Text>
        
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Your AI-powered language learning companion
        </Animated.Text>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: width * 0.8,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: width * 0.8,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
}); 