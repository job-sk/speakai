import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { showToast } from '../../utils/toast';
import { userAPI } from 'services/api';

type ReadingResultScreenRouteProp = RouteProp<RootStackParamList, 'ReadingResultScreen'>;

type ReadingResult = RootStackParamList['ReadingResultScreen']['result'];

interface ErrorPosition {
  start: number;
  end: number;
}

interface TextError {
  incorrect: string;
  correction: string;
  type: string;
  position: ErrorPosition;
  context: string;
}

interface TextWithErrorsProps {
  text: string;
  errors: ReadingResult['text_with_errors']['errors'];
}

const TextWithErrors: React.FC<TextWithErrorsProps> = ({ text, errors }) => {
  const [selectedError, setSelectedError] = useState<number | null>(null);

  const renderTextWithErrors = () => {
    if (!errors || errors.length === 0) {
      return <Text style={styles.transcriptionText}>{text}</Text>;
    }

    const parts = [];
    let lastIndex = 0;

    errors.forEach((error, index) => {
      // Add text before the error
      if (error.position.start > lastIndex) {
        parts.push(
          <Text key={`text-${index}`} style={styles.transcriptionText}>
            {text.slice(lastIndex, error.position.start)}
          </Text>
        );
      }

      // Add the error text with correction
      parts.push(
        <Text
          key={`error-${index}`}
          style={[styles.transcriptionText, styles.errorText]}
          onPress={() => setSelectedError(selectedError === index ? null : index)}
        >
          {text.slice(error.position.start, error.position.end)}
          {selectedError === index ? ` → ${error.correction}` : ''}
        </Text>
      );

      lastIndex = error.position.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key="text-end" style={styles.transcriptionText}>
          {text.slice(lastIndex)}
        </Text>
      );
    }

    return parts;
  };

  return <View style={styles.textContainer}>{renderTextWithErrors()}</View>;
};

interface ReadingResultScreenProps {
  route: ReadingResultScreenRouteProp;
}

export const ReadingResultScreen: React.FC<ReadingResultScreenProps> = ({ route }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { result } = route.params;
  console.log('result from reading result screen', result);
  
  const pronunciationScore = result?.pronunciation_score;
  const fluencyScore = result?.fluency_score;
  const feedback = result?.feedback;
  const textWithErrors = result?.text_with_errors;

  useEffect(() => {
    const averageScore = (pronunciationScore + fluencyScore) / 2;
    if (averageScore === 10) {
      showToast.success('Perfect Score! 🎉 You have earned 100 XP');
      handleUpdateXP(100);
    } else if (averageScore >= 8) {
      showToast.success('Great job! 🌟 You have earned 60 XP');
      handleUpdateXP(60);
    } else if (averageScore >= 6) {
      showToast.success('Good effort! 💪 You have earned 30 XP');
      handleUpdateXP(30);
    } else {
      showToast.info('Keep practicing! You can do better next time');
    }
  }, [pronunciationScore, fluencyScore]);

  const handleUpdateXP = async (points: number) => {
    try {
      // Get current user data to get existing XP
      const response = await userAPI.getCurrentUser();
      const currentXP = response.data.xpPoint || 0;
      
      // Add new points to existing XP
      await userAPI.updateUser({ xpPoint: currentXP + points });
    } catch (error) {
      console.error('Error updating XP:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Reading Analysis</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.scoresContainer}>
          <View style={styles.scoreCard}>
            <MaterialCommunityIcons name="microphone" size={24} color="#246bfd" />
            <Text style={styles.scoreValue}>{pronunciationScore}</Text>
            <Text style={styles.scoreLabel}>Pronunciation</Text>
          </View>
          <View style={styles.scoreCard}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#246bfd" />
            <Text style={styles.scoreValue}>{fluencyScore}</Text>
            <Text style={styles.scoreLabel}>Fluency</Text>
          </View>
        </View>

        <View style={styles.feedbackContainer}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>

        <View style={styles.transcriptionSection}>
          <Text style={styles.sectionTitle}>Your Reading</Text>
          <View style={styles.transcriptionContainer}>
            {textWithErrors ? (
              <TextWithErrors 
                text={textWithErrors.full_text}
                errors={textWithErrors.errors}
              />
            ) : (
              <Text style={styles.transcriptionText}>No transcription available.</Text>
            )}
          </View>
        </View>

        <View style={styles.areasToImprove}>
          <Text style={styles.sectionTitle}>Areas to Improve</Text>

          {result.areas_to_improve && Object.entries(result.areas_to_improve).length > 0 ? (
          Object.entries(result.areas_to_improve).map(([area, issues]) => (
              <View key={area} style={styles.improvementArea}>
              <Text style={styles.areaTitle}>
                  {area.replace('_', ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()}
              </Text>
              {issues.map((issue: string, index: number) => (
                  <Text key={index} style={styles.issueText}>• {issue}</Text>
              ))}
              </View>
          ))
          ) : (
          <Text style={styles.issueText}>No areas to improve found.</Text>
          )}

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#246bfd',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
    marginTop: 60, // Height of the header
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#2a2a2a',
    marginTop: 1,
  },
  scoreCard: {
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 12,
    width: '45%',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#246bfd',
    marginVertical: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#888',
  },
  feedbackContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  transcriptionSection: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    marginTop: 1,
  },
  transcriptionContainer: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  errorContainer: {
    position: 'relative',
  },
  errorTextContainer: {
    position: 'relative',
  },
  errorText: {
    color: '#ff4444',
    textDecorationLine: 'underline',
  },
  correctionTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    zIndex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  correctionText: {
    color: '#fff',
    fontSize: 14,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  areasToImprove: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    marginTop: 1,
  },
  improvementArea: {
    marginBottom: 16,
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#246bfd',
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
    marginBottom: 4,
  },
});
