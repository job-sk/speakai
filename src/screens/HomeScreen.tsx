import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleAlert = () => {
    Alert.alert(
      'Welcome!',
      'You tapped the button!',
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SpeakAI</Text>
      <Text style={styles.subtitle}>Your AI-powered companion</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleAlert}>
        <Text style={styles.buttonText}>Show Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Go to Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
}); 