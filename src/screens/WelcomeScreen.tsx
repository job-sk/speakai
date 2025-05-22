import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay
} from 'react-native-reanimated';
import { useFonts, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';

const aiTutorIllustration = require('../assets/avatar-images/ai_tutor_illustration.jpg');
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
      colors={['#1a1a1a','#707070']}
      style={styles.container}
    >
      <View style={styles.aiTutorSection}>
        {/* Glowing background */}
        <View style={styles.glowOuter}>
          <View style={styles.glowInner}>
            {/* Avatar */}
            <Image
              source={aiTutorIllustration}
              style={styles.avatar}
              resizeMode="contain"
            />
            {/* Floating chat bubbles/tags */}
            <View style={[styles.bubble, styles.bubbleTopLeft]}>
              <Text style={styles.bubbleText}>Time for a fluency boost! 🚀</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleTopRight]}>
              <Text style={styles.bubbleText}>📈 Pitch Practice</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleBottomLeft]}>
              <Text style={styles.bubbleText}>how did your meeting go? 👀</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleBottomRight]}>
              <Text style={styles.bubbleText}>FREE TALK 💬</Text>
            </View>
          </View>
        </View>
        {/* Heading and subtitle */}
        <Text style={styles.aiTutorHeading}>Practice with AI tutor</Text>
        <Text style={styles.aiTutorDescription}>
          Speaking practice on real-life topics: job interviews, meetings, sales, pitch calls—whatever you need
        </Text>
      </View>
      <View>
        <Animated.Text style={[styles.title, titleStyle]}>
          SpeakAI
        </Animated.Text>
        
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Your AI-powered language learning companion
        </Animated.Text>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('QuestionnaireScreen')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('UserLoginScreen')}
          >
            <Text style={styles.secondaryButtonText}>Already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
  aiTutorSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  glowInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0,122,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#222',
    backgroundColor: '#222',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: '#23243a',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 130,
    zIndex: 2,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  bubbleTopLeft: {
    top: 10,
    left: -60,
  },
  bubbleTopRight: {
    top: 10,
    right: -40,
  },
  bubbleBottomLeft: {
    bottom: 10,
    left: -70,
  },
  bubbleBottomRight: {
    bottom: 10,
    right: -50,
  },
  timer: {
    color: '#a0a0a0',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  aiTutorHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  aiTutorDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 22,
  },
  secondaryButton: {
    marginTop: 18,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
    width: width * 0.8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
}); 