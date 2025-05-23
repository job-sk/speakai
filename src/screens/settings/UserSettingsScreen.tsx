import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { TextInput, Button, Avatar, Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { authAPI } from '../../services/api';

export const UserSettingsScreen = () => {
  const { logout } = useAuth();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
  };

  const handleLogout = async () => {
    try {
      // Get user data to extract userId
      const userDataStr = await AsyncStorage.getItem('userData');
      if (!userDataStr) {
        throw new Error('No user data found');
      }
      
      const userData = JSON.parse(userDataStr);
      
      // Call logout API with userId
      await authAPI.logout(userData._id);
      
      // Clear all stored values
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userData',
        'hasAnalyzedVoice'
      ]);
      
      // Navigate to login screen
      navigation.navigate('UserLoginScreen');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'There was an error logging out. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Settings</Text>
      </View>

      <View style={styles.photoSection}>
        <TouchableOpacity onPress={pickImage}>
          {profilePhoto ? (
            <View style={styles.avatarWrapper}>
              <Avatar.Image size={100} source={{ uri: profilePhoto }} />
              <IconButton
                icon="close-circle"
                size={24}
                style={styles.removeButton}
                onPress={removePhoto}
              />
            </View>
          ) : (
            <Avatar.Icon size={100} icon="account" />
          )}
        </TouchableOpacity>
        <Text style={styles.uploadText}>Tap to change photo</Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              disabled={!isEditing}
              right={
                <TextInput.Icon
                  icon={isEditing ? "check" : "pencil"}
                  onPress={() => setIsEditing(!isEditing)}
                />
              }
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={email}
            style={styles.input}
            mode="outlined"
            disabled
          />
        </View>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  photoSection: {
    alignItems: 'center',
    padding: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1a1a1a',
  },
  uploadText: {
    color: '#666',
    marginTop: 10,
  },
  formSection: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff4444',
  },
}); 