import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { sendImproveSelection } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';



const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!fontsLoaded) {
    return null;
  }

  const handleImprove = async () => {
    if (selectedOption) {
      navigation.navigate('OnboardingQuestionnaire');
      // const res = await sendImproveSelection(selectedOption);
      // if (res) {
        // navigation.navigate('OnboardingQuestionnaire');
      // }
    } else {
      Alert.alert('Please select an option');
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>
          What would you like to <Text style={styles.highlight}>improve</Text> in your
          English?
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, selectedOption === 'pronunciation' && styles.selectedOption]}
            onPress={() => setSelectedOption('pronunciation')}
          >
            <MaterialCommunityIcons name="microphone" size={24} color={selectedOption === 'pronunciation' ? '#ffffff' : '#FF9800'} />
            <Text style={[styles.optionText, selectedOption === 'pronunciation' && styles.selectedOptionText]}>pronunciation</Text>
            <View style={styles.radioButton}>
              {selectedOption === 'pronunciation' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, selectedOption === 'grammar' && styles.selectedOption]}
            onPress={() => setSelectedOption('grammar')}
          >
            <MaterialCommunityIcons name="pencil" size={24} color={selectedOption === 'grammar' ? '#ffffff' : '#E91E63'} />
            <Text style={[styles.optionText, selectedOption === 'grammar' && styles.selectedOptionText]}>grammar</Text>
            <View style={styles.radioButton}>
              {selectedOption === 'grammar' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, selectedOption === 'vocabulary' && styles.selectedOption]}
            onPress={() => setSelectedOption('vocabulary')}
          >
            <Ionicons name="book" size={24} color={selectedOption === 'vocabulary' ? '#ffffff' : '#2196F3'} />
            <Text style={[styles.optionText, selectedOption === 'vocabulary' && styles.selectedOptionText]}>vocabulary</Text>
            <View style={styles.radioButton}>
              {selectedOption === 'vocabulary' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, selectedOption === 'fluency' && styles.selectedOption]}
            onPress={() => setSelectedOption('fluency')}
          >
            <FontAwesome5 name="wave-square" size={24} color={selectedOption === 'fluency' ? '#ffffff' : '#00BCD4'} />
            <Text style={[styles.optionText, selectedOption === 'fluency' && styles.selectedOptionText]}>fluency</Text>
            <View style={styles.radioButton}>
              {selectedOption === 'fluency' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.improveButton}
          onPress={handleImprove}
        >
          <Text style={styles.improveButtonText}>Let's improve</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    // flex: 1,
    padding: 20,
    paddingTop: 40, // Adjust padding top for header
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'left',
    lineHeight: 38,
  },
  highlight: {
    color: '#007AFF', // Highlight color
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderColor: '#444',
    borderWidth: 1,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: '#a0a0a0',
    flex: 1,
    marginLeft: 15,
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#a0a0a0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  improveButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40, // Add space below the button
  },
  improveButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  }
}); 