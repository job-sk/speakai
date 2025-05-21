import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

      {/* Today's Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Speaking Practice</Text>
            <Text style={styles.progressTime}>15/20 min</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '75%' }]} />
          </View>
        </View>
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

      {/* Weekly Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Goals</Text>
        <View style={styles.goalsGrid}>
          {[
            { title: 'Practice Sessions', current: 8, target: 10 },
            { title: 'Vocabulary', current: 45, target: 50 },
            { title: 'Speaking Time', current: 85, target: 120 },
          ].map((goal, index) => (
            <View key={index} style={styles.goalCard}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <View style={styles.goalProgress}>
                <Text style={styles.goalNumbers}>
                  {goal.current}/{goal.target}
                </Text>
                <View style={styles.goalBarContainer}>
                  <View 
                    style={[
                      styles.goalBar, 
                      { width: `${(goal.current / goal.target) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
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
  progressCard: {
    backgroundColor: '#23243a',
    borderRadius: 12,
    padding: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  progressTime: {
    fontSize: 16,
    color: '#246bfd',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#2a2d3a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#246bfd',
    borderRadius: 4,
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
  goalsGrid: {
    gap: 10,
  },
  goalCard: {
    backgroundColor: '#23243a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
  },
  goalProgress: {
    gap: 8,
  },
  goalNumbers: {
    fontSize: 14,
    color: '#888',
  },
  goalBarContainer: {
    height: 6,
    backgroundColor: '#2a2d3a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalBar: {
    height: '100%',
    backgroundColor: '#246bfd',
    borderRadius: 3,
  },
});