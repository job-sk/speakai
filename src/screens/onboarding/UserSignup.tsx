import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Keyboard, Alert } from 'react-native';
import { TextInput, Button, Card, Avatar, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const logo = require('../../assets/avatar-images/ai_tutor_illustration.jpg');
const backgroundImage = require('../../assets/background-images/signin-background.jpg');

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserSignup'>;
};

export const UserSignup: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { checkAuth } = useAuth();
  const [profilePhoto, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    console.log(result,"result img");
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

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
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      Keyboard.dismiss();

      const userData = {
        name,
        email,
        password
      };
      // Todo
      // if (photo) {
      //   const photoData = {
      //     uri: photo,
      //     type: 'image/jpeg',
      //     name: 'photo.jpg'
      //   } as any;
      //   formData.append('photo', photoData);
      // }
      console.log(userData,"formData");
      
      const response = await authAPI.register(userData);
      
      const { user, tokens } = response.data;
      
      // Store tokens and user data
      await AsyncStorage.setItem('accessToken', tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      // Update auth state
      await checkAuth();
      
      // Replace current screen with MainTabs
      navigation.replace('MainTabs');
      
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || 'Signup failed';
        Alert.alert('Signup Failed', errorMessage);
      } else {
        Alert.alert('Signup Failed', 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
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
            <Text style={styles.subtitle}>Create an account to get started.</Text>
          </View>
          <Card style={styles.card} elevation={4}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickImage}>
                {profilePhoto ? (
                  <View style={styles.avatarWrapper}>
                    <Avatar.Image size={80} source={{ uri: profilePhoto }} />
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => setPhoto(null)}
                    >
                      <MaterialCommunityIcons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Avatar.Icon size={80} icon="camera" />
                )}
              </TouchableOpacity>
              <Text style={styles.uploadText}>Upload Photo</Text>
            </View>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors(prev => ({ ...prev, name: '' }));
              }}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="account-outline" size={25} color="rgba(0, 0, 0, 0.5)" />} />}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            
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
              left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="email-outline" size={24} color="rgba(0, 0, 0, 0.5)" />} />}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text.replace(/\s/g, ''));
                setErrors(prev => ({ ...prev, password: '' }));
              }}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="lock-outline" size={25} color="rgba(0, 0, 0, 0.5)" />} />}
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
              onPress={handleSignup}
              loading={loading}
              contentStyle={{ paddingVertical: 8 }}
            >
              Sign Up
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  uploadText: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  button: {
    marginTop: 8,
    borderRadius: 30,
  },
  avatarWrapper: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
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
