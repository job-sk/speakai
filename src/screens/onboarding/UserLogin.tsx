import React, { useState } from 'react';
import { View, StyleSheet, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const logo = require('../../assets/ai_tutor_illustration.jpg');
const backgroundImage = require('../../assets/background-images/signin-background.jpg');

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserLoginScreen'>;
};

export const UserLogin: React.FC<LoginScreenProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
    };

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateForm()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('DashboardScreen');
      }, 1000);
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backArrow} onPress={() => navigation.navigate('Welcome')}>
            <MaterialCommunityIcons name="arrow-left" size={32} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>speakAI</Text>
            <Text style={styles.subtitle}>Welcome! Please login to continue.</Text>
          </View>
          <Card style={styles.card} elevation={4}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors(prev => ({ ...prev, email: '' }));
              }}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="email-outline" size={26} color="rgba(0, 0, 0, 0.5)" />} />}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="lock-outline" size={26} color="rgba(0, 0, 0, 0.5)" />} />}
              right={
                <TextInput.Icon 
                  icon={() => (
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={24} 
                      color="rgba(0, 0, 0, 0.5)"
                    />
                  )}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <Button
              mode="contained"
              style={styles.button}
              onPress={handleContinue}
              loading={loading}
              contentStyle={{ paddingVertical: 8 }}
            >
              Login
            </Button>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 26, 32, 0.85)',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 6,
    borderRadius: 100,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#246bfd',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    color: '#b0b8c1',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 370,
    padding: 24,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  button: {
    marginTop: 8,
    borderRadius: 30,
  },
  signupContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#888',
    fontSize: 15,
  },
  signupLink: {
    color: '#246bfd',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  backArrow: {
    position: 'absolute',
    top: 18,
    left: 18,
    zIndex: 10,
    padding: 4,
  },
});