import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const DashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* User Profile Section */}
      <LinearGradient
        colors={['#246bfd', '#1a1a1a']}
        style={styles.headerGradient}
      >
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg' }}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>Sarah Wilson</Text>
            <Text style={styles.userLevel}>Advanced • B2 Level</Text>
          </View>
        </View>

        {/* Streak Section */}
        <View style={styles.streakContainer}>
          <View style={styles.streakBox}>
            <Text style={styles.streakNumber}>12</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
          <View style={styles.streakBox}>
            <Text style={styles.streakNumber}>85%</Text>
            <Text style={styles.streakLabel}>Accuracy</Text>
          </View>
          <View style={styles.streakBox}>
            <Text style={styles.streakNumber}>2.5K</Text>
            <Text style={styles.streakLabel}>XP Points</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Today's Practice */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Practice</Text>
        <TouchableOpacity style={styles.practiceCard}>
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
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
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
    justifyContent: 'space-between',
    marginTop: 10,
  },
  streakBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: width * 0.28,
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
});