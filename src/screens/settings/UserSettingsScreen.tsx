import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { TextInput, Avatar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { authAPI, userAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { showToast } from '../../utils/toast';

const { width } = Dimensions.get('window');

export const UserSettingsScreen = () => {
  const { logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await userAPI.getCurrentUser();
      const userData = response.data;
      setName(userData.name);
      setEmail(userData.email);
      if (userData.profilePhoto) {
        setProfilePhoto(userData.profilePhoto);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showToast.error('Failed to load user data');
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      showToast.error('Name cannot be empty');
      return;
    }

    try {
      setIsUpdating(true);
      await userAPI.updateUser({ name: name.trim() });
      setIsEditing(false);
      showToast.success('Name updated successfully');
      
      // Update local storage with new user data
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.name = name.trim();
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error updating name:', error);
      showToast.error('Failed to update name');
    } finally {
      setIsUpdating(false);
    }
  };

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
      const userDataStr = await AsyncStorage.getItem('userData');
      if (!userDataStr) {
        throw new Error('No user data found');
      }
      
      const userData = JSON.parse(userDataStr);
      await authAPI.logout(userData._id);
      await AsyncStorage.multiRemove([
        'accessToken',
        'userData',
        'hasAnalyzedVoice'
      ]);
      
      navigation.navigate('UserLoginScreen');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'There was an error logging out. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#246bfd', '#1a1a1a']}
        style={styles.header}
      >
        <Text style={styles.title}>Profile Settings</Text>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {profilePhoto ? (
              <View style={styles.avatarWrapper}>
                <Avatar.Image 
                  size={120} 
                  source={{ uri: profilePhoto }} 
                  style={styles.avatar}
                />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={removePhoto}
                >
                  <MaterialCommunityIcons name="close-circle" size={28} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={60} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.uploadText}>Tap to change photo</Text>
        </View>
      </LinearGradient>

      <View style={styles.formSection}>
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
              disabled={!isEditing || isUpdating}
              textColor="#fff"
              theme={{
                colors: {
                  primary: '#246bfd',
                  background: '#2a2a2a',
                  text: '#fff',
                  placeholder: '#666',
                  onSurface: '#fff',
                }
              }}
              right={
                <TextInput.Icon
                  icon={isEditing ? "check" : "pencil"}
                  onPress={isEditing ? handleUpdateName : () => setIsEditing(true)}
                  color="#246bfd"
                  disabled={isUpdating}
                />
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              style={styles.input}
              mode="outlined"
              disabled
              textColor="#fff"
              theme={{
                colors: {
                  primary: '#246bfd',
                  background: '#2a2a2a',
                  text: '#fff',
                  placeholder: '#666',
                  onSurface: '#fff',
                }
              }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
            <Text style={styles.menuText}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="shield-outline" size={24} color="#fff" />
            <Text style={styles.menuText}>Privacy</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#fff" />
            <Text style={styles.menuText}>Help & Support</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  photoSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#2a2a2a',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#246bfd',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 0,
  },
  uploadText: {
    color: '#fff',
    opacity: 0.7,
    marginTop: 8,
    fontSize: 14,
  },
  formSection: {
    padding: 20,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2a2a2a',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});