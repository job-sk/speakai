import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { userAPI } from 'services/api';
import { formatDistanceToNow, format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type UserData = {
  name: string;
  email: string;
  profilePhoto: string;
  age: number;
  nativeLanguage: string;
  englishProficiency: 'Beginner' | 'Intermediate' | 'Upper Intermediate';
  streak: number;
  lastOpened: string;
};

const formatLastActive = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

export const DashboardScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getCurrentUser();
      setUserData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Section */}
      <LinearGradient
        colors={['#246bfd', '#1a1a1a']}
        style={styles.headerGradient}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileIconContainer}>
            {userData?.profilePhoto ? (
              <Image 
                source={{ uri: userData.profilePhoto }} 
                style={styles.profileImage}
              />
            ) : (
              <MaterialCommunityIcons name="account" size={40} color="#fff" />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{userData?.name || 'User'}</Text>
            <Text style={styles.userLevel}>{userData?.englishProficiency || 'Beginner'}</Text>
            <Text style={styles.userDetails}>
              {userData?.nativeLanguage} • {userData?.age} years
            </Text>
          </View>
        </View>

        {/* Streak Section */}
        <View style={styles.streakContainer}>
          <View style={styles.streakBox}>
            <Text style={styles.streakNumber}>{userData?.streak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
          <View style={styles.streakBox}>
            <Text style={styles.streakNumber}>
              {userData?.lastOpened ? formatLastActive(userData.lastOpened) : 'N/A'}
            </Text>
            <Text style={styles.streakLabel}>Last Active</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Today's Practice */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Practice</Text>
        <TouchableOpacity 
          style={styles.practiceCard}
          onPress={() => navigation.navigate('ReadingSessionScreen')}
        >
          <LinearGradient
            colors={['#2E3192', '#1BFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name="book-open-variant" size={32} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Reading</Text>
              <Text style={styles.cardDescription}>Improve your comprehension skills</Text>
              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Start Practice</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {[
          { title: 'Business Meeting', time: '2h ago', score: '95%' },
          { title: 'Job Interview', time: '5h ago', score: '88%' },
          { title: 'Small Talk', time: '1d ago', score: '92%' },
        ].map((activity, index) => (
          <TouchableOpacity key={index} style={styles.activityCard}>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
            <View style={styles.activityScore}>
              <Text style={styles.scoreText}>{activity.score}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffff" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerGradient: {
    padding: 20,
    paddingTop: 40,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  streakBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: width * 0.4,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  practiceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    padding: 10,
  },
  cardIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 20,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  activityCard: {
    backgroundColor: '#23243a',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#888',
  },
  activityScore: {
    backgroundColor: 'rgba(36, 107, 253, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  scoreText: {
    color: '#246bfd',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#246bfd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  userDetails: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});