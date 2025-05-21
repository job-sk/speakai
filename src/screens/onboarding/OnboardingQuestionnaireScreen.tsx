import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, BackHandler } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useFocusEffect } from '@react-navigation/native';

const QUESTIONS = [
  {
    question: 'What part of your English do you want to improve the most?',
    options: [
      '🗣️ Speaking with confidence',
      '👄 Improving pronunciation',
      '💪 Expanding vocabulary',
      '✍️ Using grammar correctly',
      '👂 Understanding native speakers',
      '📝 Writing more fluently',
    ],
    multi: true,
  },
  {
    question: 'How often do you speak English in your daily life?',
    options: [
      'Every day',
      'A few times a week',
      'A few times a month',
      'Rarely or never',
    ],
    multi: false,
  },
  {
    question: 'When do you usually use English?',
    options: [
      'At work',
      'While studying',
      'While traveling',
      'On social media',
      'With friends or family',
    ],
    multi: true,
  },
  {
    question: 'What is your current English level?',
    options: [
      'Beginner',
      'Intermediate',
      'Advanced',
      "I'm not sure",
    ],
    multi: false,
  },
  {
    question: 'How confident are you when speaking English?',
    options: [
      'Very confident',
      'Somewhat confident',
      'Not confident at all',
    ],
    multi: false,
  },
  {
    question: 'Do you struggle with understanding native English speakers?',
    options: [
      'Yes, often',
      'Sometimes',
      'Rarely',
      'Not at all',
    ],
    multi: false,
  },
  {
    question: 'What kind of English content do you consume?',
    options: [
      'YouTube videos',
      'News articles',
      'Podcasts',
      'Movies/TV shows',
      'Books or novels',
    ],
    multi: true,
  },
  {
    question: 'Do you ever write in English?',
    options: [
      'Yes, regularly',
      'Occasionally',
      'Only when necessary',
      'Not really',
    ],
    multi: false,
  },
  {
    question: 'What is your goal with this app?',
    options: [
      'Improve speaking fluency',
      'Prepare for exams (IELTS, TOEFL)',
      'Better job opportunities',
      'General self-improvement',
    ],
    multi: true,
  },
  {
    question: 'Are you comfortable recording your voice for pronunciation feedback?',
    options: [
      'Yes',
      'Maybe later',
      'No',
    ],
    multi: false,
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingQuestionnaire'>;

export const OnboardingQuestionnaireScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  const current = QUESTIONS[step];
  const selected = answers[step] || (current.multi ? [] : null);

  const handleSelect = (option: string) => {
    if (current.multi) {
      setAnswers((prev) => {
        const arr = prev[step] || [];
        return [
          ...prev.slice(0, step),
          arr.includes(option) ? arr.filter((o: string) => o !== option) : [...arr, option],
          ...prev.slice(step + 1),
        ];
      });
    } else {
      setAnswers((prev) => [
        ...prev.slice(0, step),
        option,
        ...prev.slice(step + 1),
      ]);
    }
  };

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // pass data to api
      navigation.replace('VocabularyTest', { onboardingAnswers: answers });
    }
  };

  const handleBack = () => {
    if (step === 0) {
      // navigation.replace('Dashboard');
    } else {
      setStep(step - 1);
    }
  };

  // Handle Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (step === 0) {
          // navigation.replace('Dashboard');
        } else {
          setStep((prev) => prev - 1);
        }
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [step, navigation])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.progress}>{`Question ${step + 1} of ${QUESTIONS.length}`}</Text>
      <Text style={styles.question}>{current.question}</Text>
      {current.options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            (current.multi ? selected.includes(option) : selected === option) && styles.selectedOption,
          ]}
          onPress={() => handleSelect(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.nextButton,
          (!selected || (Array.isArray(selected) && selected.length === 0)) && { opacity: 0.5 },
        ]}
        onPress={handleNext}
        disabled={!selected || (Array.isArray(selected) && selected.length === 0)}
      >
        <Text style={styles.nextButtonText}>{step === QUESTIONS.length - 1 ? 'Start Test' : 'Next'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'flex-start', padding: 24, backgroundColor: '#181a20' },
  progress: { color: '#a0a0a0', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  question: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#fff', textAlign: 'center' },
  option: {
    backgroundColor: '#23243a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: { color: '#fff', fontSize: 16 },
  nextButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  nextButtonText: { color: '#1a1a1a', fontWeight: 'bold', fontSize: 18 },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#23243a',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
}); 