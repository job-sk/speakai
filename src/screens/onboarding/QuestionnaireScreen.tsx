import React, { useState } from 'react';
import { View, StyleSheet, Image, ImageBackground, TextInput as RNTextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Button, ProgressBar, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from 'navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const logo = require('../../assets/avatar-images/onboarding-girl-img.png');
const backgroundImage = require('../../assets/background-images/signin-background.jpg');
const { width } = Dimensions.get('window');

const languageOptions = [
  'Hindi',
  'English',
  'Malayalam',
  'Telugu',
  'Kannada',
  'Other',
];
const englishLevels = [
  "I'm new to English",
  'I know some basic words',
  'I can have basic conversations',
  'I can discuss most topics in detail',
];

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuestionnaireScreen'>;
};

export const QuestionnaireScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [ageError, setAgeError] = useState('');
  const [language, setLanguage] = useState('');
  const [englishLevel, setEnglishLevel] = useState('');

  const totalSteps = 3;

  const validateAge = (value: string) => {
    const numAge = parseInt(value);
    if (value === '') {
      setAgeError('');
      return false;
    }
    if (isNaN(numAge)) {
      setAgeError('Please enter a valid number');
      return false;
    }
    if (numAge < 1 || numAge > 99) {
      setAgeError('Age must be between 1 and 99');
      return false;
    }
    setAgeError('');
    return true;
  };

  const handleAgeChange = (value: string) => {
    setAge(value);
    validateAge(value);
  };

  const handleNext = () => {
    if (step === 0 && !validateAge(age)) {
      return;
    }
    if (step < totalSteps - 1) setStep(step + 1);
    else navigation.navigate('UserSignup');
  };
  
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigation.goBack();
  };

  let question, inputArea;
  if (step === 0) {
    question = 'What is your age?';
    inputArea = (
      <View>
        <RNTextInput
          style={[styles.input, ageError ? styles.inputError : null]}
          value={age}
          onChangeText={handleAgeChange}
          keyboardType="numeric"
          maxLength={2}
        />
        {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
      </View>
    );
  } else if (step === 1) {
    question = 'What language do you speak?';
    inputArea = (
      <View style={styles.optionsContainer}>
        {languageOptions.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.option, language === opt && styles.optionSelected]}
            onPress={() => setLanguage(opt)}
          >
            <Text style={[styles.optionText, language === opt && styles.optionTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  } else if (step === 2) {
    question = 'How much English do you know?';
    inputArea = (
      <View style={styles.optionsContainer}>
        {englishLevels.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.option, englishLevel === opt && styles.optionSelected]}
            onPress={() => setEnglishLevel(opt)}
          >
            <Text style={[styles.optionText, englishLevel === opt && styles.optionTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.progressBarContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backArrow}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${((step + 1) / totalSteps) * 100}%` }]}> 
                <View style={styles.progressBarHighlight} />
              </View>
            </View>
          </View>
        </View>
        <View style={styles.avatarContainer}>
          <Image source={logo} style={styles.avatar} />
        </View>
        <Card style={styles.card} elevation={4}>
          <Text style={styles.question}>{question}</Text>
          {inputArea}
          <Button
            mode="contained"
            style={styles.button}
            onPress={handleNext}
            disabled={
              (step === 0 && (!age || !!ageError)) ||
              (step === 1 && !language) ||
              (step === 2 && !englishLevel)
            }
          >
            {step === totalSteps - 1 ? 'Finish' : 'Next'}
          </Button>
        </Card>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'stretch',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(24, 26, 32, 0.85)',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.85,
    marginTop: 48,
    marginBottom: 20,
  },
  backArrow: {
    marginRight: 12,
    zIndex: 10,
    padding: 4,
  },
  progressBarWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 22,
    backgroundColor: '#2d3a3f',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(103, 80, 164, 1)',
    borderRadius: 16,
    justifyContent: 'center',
  },
  progressBarHighlight: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 6,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  card: {
    width: width * 0.85,
    borderRadius: 18,
    backgroundColor: 'rgb(248, 249, 250)',
    padding: 28,
    alignItems: 'stretch',
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    width: 280,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    marginBottom: 24,
    backgroundColor: '#fff',
    color: '#222',
    textAlign: 'center',
    alignSelf: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'stretch',
  },
  option: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  optionSelected: {
    borderColor: '#246bfd',
    backgroundColor: '#e6f0ff',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  optionTextSelected: {
    color: '#246bfd',
    fontWeight: 'bold',
  },
  button: {
    width: 280,
    borderRadius: 10,
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#246bfd',
    alignSelf: 'center',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: -20,
    marginBottom: 20,
    textAlign: 'center',
  },
});


