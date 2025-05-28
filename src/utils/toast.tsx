import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export const showToast = {
  success: (message: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  },
  error: (message: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  },
  info: (message: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  },
  streak: (streak: number) => {
    Toast.show({
      type: 'streak',
      text1: `🔥 ${streak} Day Streak!`,
      text2: 'Keep up the good work!',
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
    });
  }
};

// Custom toast configuration
export const toastConfig = {
  success: (props: any) => (
    <View style={[styles.toast, styles.successToast]}>
      <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
      <Text style={styles.toastText}>{props.text1}</Text>
    </View>
  ),
  error: (props: any) => (
    <View style={[styles.toast, styles.errorToast]}>
      <MaterialCommunityIcons name="alert-circle" size={24} color="#fff" />
      <Text style={styles.toastText}>{props.text1}</Text>
    </View>
  ),
  info: (props: any) => (
    <View style={[styles.toast, styles.infoToast]}>
      <MaterialCommunityIcons name="information" size={24} color="#fff" />
      <Text style={styles.toastText}>{props.text1}</Text>
    </View>
  ),
  streak: (props: any) => (
    <View style={[styles.toast, styles.streakToast]}>
      <MaterialCommunityIcons name="fire" size={24} color="#fff" />
      <View>
        <Text style={styles.streakText}>{props.text1}</Text>
        <Text style={styles.streakSubText}>{props.text2}</Text>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successToast: {
    backgroundColor: '#4CAF50',
  },
  errorToast: {
    backgroundColor: '#f44336',
  },
  infoToast: {
    backgroundColor: '#2196F3',
  },
  streakToast: {
    backgroundColor: '#ff6b6b',
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },
  streakText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  streakSubText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
    opacity: 0.9,
  },
}); 