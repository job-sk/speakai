import React, { useState } from 'react';
import { View, StyleSheet, Image, ImageBackground } from 'react-native';
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


  const handleContinue = () => {
    setLoading(true);
    // Handle form submission here
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
          <Button
            mode="contained"
            style={styles.button}
            onPress={handleContinue}
            loading={loading}
            contentStyle={{ paddingVertical: 8 }}
          >
            Login
          </Button>
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              {"Don't have an account? "}
              <Text
                style={styles.signupLink}
                onPress={() => navigation.navigate('UserSignup')}
              >
                Sign up
              </Text>
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
});
