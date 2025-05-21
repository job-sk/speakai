import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { TextInput, Button, Card, Avatar, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const logo = require('../../assets/ai_tutor_illustration.jpg');
const backgroundImage = require('../../assets/background-images/signin-background.jpg');

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserSignup'>;
};

export const UserSignup: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSignup = () => {
    setLoading(true);
    // Handle sign up logic here
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.logoText}>speakAI</Text>
        </View>
        <Card style={styles.card} elevation={4}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage}>
              {photo ? (
                <View style={styles.avatarWrapper}>
                  <Avatar.Image size={80} source={{ uri: photo }} />
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
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="account-outline" size={25} color="rgba(0, 0, 0, 0.5)" />} />}
          />
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="email-outline" size={24} color="rgba(0, 0, 0, 0.5)" />} />}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
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
          <Button
            mode="contained"
            style={styles.button}
            onPress={handleSignup}
            loading={loading}
            contentStyle={{ paddingVertical: 8 }}
          >
            Sign Up
          </Button>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink} onPress={() => navigation.navigate('UserLoginScreen')}>Login</Text>
            </Text>
          </View>
        </Card>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  loginContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#888',
    fontSize: 15,
  },
  loginLink: {
    color: '#246bfd',
    fontWeight: 'bold',
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
});
