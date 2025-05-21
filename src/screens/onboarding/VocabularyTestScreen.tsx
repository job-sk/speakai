import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'VocabularyTest'>;
type RouteProps = RouteProp<RootStackParamList, 'VocabularyTest'>;

// Sample vocabulary words for each step
const vocabularySteps = [
  [
    'achievement', 'acquisition', 'behavior', 'evidence', 'solution', 'majority', 'opportunity', 'recommend', 'assume'
  ],
  [
    "quintessential", "juxtapose", "paradigm", "articulate", "obsolete", "meticulous", "rhetoric", "ubiquitous", "scrutiny", "extrapolate"
  ],
  [ 
    "consequence", "assume", "perspective", "efficient", "significant", "negotiate", "justify", "priority", "controversy", "sustainability"
  ],
  [
    "anachronistic", "circumlocution", "deleterious", "ephemeral", "grandiloquent", "idiosyncratic", "intransigent", "magnanimous", "obfuscate", "perspicacious"
  ]
];

export const VocabularyTestScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { onboardingAnswers } = route.params;
  console.log("onboardingAnswers:",onboardingAnswers);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const handleWordSelection = (word: string) => {
    setSelectedWords(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      } else {
        return [...prev, word];
      }
    });
  };

  const handleNext = () => {
    if (currentStep < vocabularySteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Navigate to results screen with all selected words
      navigation.navigate('VocabularyResult', { selectedWords });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isWordSelected = (word: string) => selectedWords.includes(word);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vocabulary Test</Text>
        <Text style={styles.subtitle}>Step {currentStep + 1} of {vocabularySteps.length}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.instruction}>
          Select all the words you know:
        </Text>
        
        <View style={styles.wordsContainer}>
          {vocabularySteps[currentStep].map((word, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.wordButton,
                isWordSelected(word) && styles.wordButtonSelected
              ]}
              onPress={() => handleWordSelection(word)}
            >
              <Text style={[
                styles.wordText,
                isWordSelected(word) && styles.wordTextSelected
              ]}>
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={handleBack}
          >
            <Text style={[styles.buttonText, styles.backButtonText]}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentStep === vocabularySteps.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181a20',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2d3a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8f9095',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instruction: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordButton: {
    width: '48%',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#2a2d3a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3d4a',
  },
  wordButtonSelected: {
    backgroundColor: '#246bfd',
    borderColor: '#246bfd',
  },
  wordText: {
    fontSize: 16,
    color: '#fff',
  },
  wordTextSelected: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2d3a',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#2a2d3a',
  },
  nextButton: {
    backgroundColor: '#246bfd',
    marginLeft: 'auto',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButtonText: {
    color: '#8f9095',
  },
}); 