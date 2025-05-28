import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Alert, BackHandler, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  withTiming,
  useSharedValue,
  cancelAnimation,
  Easing
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';
import { AxiosError } from 'axios';
import { API_BASE_URL } from '@env';
import NetInfo from '@react-native-community/netinfo';
// import * as mime from 'react-native-mime-types';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SelfIntroScreen'>;
};

export const SelfIntroScreen: React.FC<Props> = ({ navigation }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingURI, setRecordingURI] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [hasAnalyzedVoice, setHasAnalyzedVoice] = useState(false);
  
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useSharedValue(1);
  const waveAnim = useSharedValue(0);

  // Check if voice has been analyzed
  useEffect(() => {
    const checkVoiceAnalysis = async () => {
      const analyzed = await AsyncStorage.getItem('hasAnalyzedVoice');
      setHasAnalyzedVoice(analyzed === 'true');
    };
    checkVoiceAnalysis();
  }, []);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!hasAnalyzedVoice) {
        Alert.alert(
          'Cannot Go Back',
          'Please complete your voice analysis before proceeding.',
          [{ text: 'OK' }]
        );
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior
    });

    return () => backHandler.remove();
  }, [hasAnalyzedVoice]);

  // Disable navigation gestures
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false
    });
  }, [navigation]);

  useEffect(() => {
    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      // Clean up existing recording if any
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      durationTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Start animations
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1
      );

      waveAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1
      );

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
    }

    // Stop animations
    cancelAnimation(pulseAnim);
    cancelAnimation(waveAnim);
    pulseAnim.value = withSpring(1);
    waveAnim.value = withSpring(0);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingURI(uri);
      setRecording(null);

      if (uri) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false, progressUpdateIntervalMillis: 100 }
        );
        setSound(newSound);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const playSound = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        const status = await sound.getStatusAsync();
        // Reset position if the sound has finished or is at the end
        if (status.isLoaded && status.durationMillis && 
            (status.didJustFinish || status.positionMillis >= status.durationMillis)) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });
      }
    } catch (err) {
      console.error('Failed to play/pause sound', err);
      setIsPlaying(false);
    }
  };

  const resetRecording = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error('Failed to unload sound:', error);
      }
    }
    setSound(null);
    setRecordingDuration(0);
    setIsPlaying(false);
  };

  const checkNetworkAndServer = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      // Try to ping the server
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error('Server is not responding');
      }
    } catch (error: any) {
      throw new Error(`Network check failed: ${error.message}`);
    }
  };

  const onAnalyzeClick = async () => {
    if (!recordingURI) return;

    // Check if recording duration is at least 30 seconds
    // if (recordingDuration < 30) {
    //   Alert.alert(
    //     'Recording Too Short',
    //     'Please record at least 30 seconds of speech for accurate analysis.',
    //     [{ text: 'OK' }]
    //   );
    //   return;
    // }

    try {
      // Check network and server first
      await checkNetworkAndServer();
      // Call the speech analysis service
      const formData = new FormData();
      const filename = recordingURI.split('/').pop()!;
      const mimeType = 'audio/mp4';

      // Format the file URI properly for the server
      // const fileUri = Platform.OS === 'android' 
      //   ? `file://${recordingURI}`
      //   : recordingURI;

      // Append the file with proper metadata
      formData.append('audio', {
        uri: recordingURI,
        type: mimeType,
        name: filename,
      } as any);

      console.log('FormData:', JSON.stringify(formData, null, 2));
      
      // const response = await authAPI.analyzeSpeech(formData, 'intro');// uncomment this to use the api
      const response = {"data":{
        "transcription": "Hello. Nice to meet you. I am Job. My name is Job. I am from India. I am a software developer. I am a front-end developer. My age is 26. I love to play football and video games. And also I am a bodybuilder.",
        "analysis": "Grammar: 9/10. Speaking Accuracy: 9/10. Your sentence construction and grammar usage are good. Keep practicing your English to improve further. Your vocabulary is appropriate and you express your thoughts clearly. Well done!",
        "metrics": {
            "segments": [
                {
                    "id": 0,
                    "seek": 0,
                    "start": 0,
                    "end": 13,
                    "text": " Hello. Nice to meet you. I am Job. My name is Job. I am from India. I am a software developer.",
                    "tokens": [
                        50364,
                        2425,
                        13,
                        5490,
                        281,
                        1677,
                        291,
                        13,
                        286,
                        669,
                        18602,
                        13,
                        1222,
                        1315,
                        307,
                        18602,
                        13,
                        286,
                        669,
                        490,
                        5282,
                        13,
                        286,
                        669,
                        257,
                        4722,
                        10754,
                        13,
                        51014
                    ],
                    "temperature": 0,
                    "avg_logprob": -0.3535516858100891,
                    "compression_ratio": 1.3937008380889893,
                    "no_speech_prob": 0.746699869632721
                },
                {
                    "id": 1,
                    "seek": 0,
                    "start": 13,
                    "end": 27,
                    "text": " I am a front-end developer. My age is 26. I love to play football and video games.",
                    "tokens": [
                        51014,
                        286,
                        669,
                        257,
                        1868,
                        12,
                        521,
                        10754,
                        13,
                        1222,
                        3205,
                        307,
                        7551,
                        13,
                        286,
                        959,
                        281,
                        862,
                        7346,
                        293,
                        960,
                        2813,
                        13,
                        51714
                    ],
                    "temperature": 0,
                    "avg_logprob": -0.3535516858100891,
                    "compression_ratio": 1.3937008380889893,
                    "no_speech_prob": 0.746699869632721
                },
                {
                    "id": 2,
                    "seek": 2700,
                    "start": 27,
                    "end": 30,
                    "text": " And also I am a bodybuilder.",
                    "tokens": [
                        50364,
                        400,
                        611,
                        286,
                        669,
                        257,
                        1772,
                        11516,
                        260,
                        13,
                        50514
                    ],
                    "temperature": 0,
                    "avg_logprob": -0.32374075055122375,
                    "compression_ratio": 0.7777777910232544,
                    "no_speech_prob": 0.24947382509708405
                }
            ],
            "duration": 36.470001220703125
        }}
    }
      console.log('Analysis result:', response);
      console.log("================================");
      
      console.log('Analysis result:', response?.data);
      
      setAnalysisResult(response.data);
      setShowAlert(true);
      setHasAnalyzedVoice(true);

      // Set the flag that voice has been analyzed
      await AsyncStorage.setItem('hasAnalyzedVoice', 'true');

    } catch (err: any) {
      let errorMessage = 'Failed to analyze your speech. Please try again.';

      if (err instanceof AxiosError) {
        console.error('Axios error details:', {
          message: err.message,
          code: err.code,
          response: err.response?.data,
          request: err.request,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers,
            baseURL: err.config?.baseURL,
          }
        });

        if (err.response?.status === 413) {
          errorMessage = 'The audio file is too large. Please record a shorter message.';
        } else if (err.response?.status === 415) {
          errorMessage = 'The audio format is not supported. Please try again.';
        }
      } else if (err.message?.includes('Network check failed')) {
        errorMessage = err.message;
      }

      Alert.alert(
        'Analysis Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const waveStyle = useAnimatedStyle(() => ({
    opacity: waveAnim.value,
    transform: [{ scale: 1 + waveAnim.value * 0.3 }],
  }));

  return (
    <View style={styles.container}>
      {!analysisResult ? (
        <>
          <Text style={styles.title}>Take the First Step</Text>
          <Text style={styles.subtitle}>Speak for 1 minute on anything you like, We will analyze your speaking and help you improve</Text>

          <View style={styles.recordingContainer}>
            <Animated.View style={[styles.recordingCircle, pulseStyle]}>
              <Animated.View style={[styles.recordingWave, waveStyle]} />
              <TouchableOpacity
                style={styles.recordButton}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <MaterialCommunityIcons
                  name={isRecording ? "stop" : "microphone"}
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Text style={styles.timer}>
            {Math.floor(recordingDuration / 60)}:
            {String(recordingDuration % 60).padStart(2, '0')}
          </Text>

          {sound && !isRecording && (
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={playSound}
              >
                <MaterialCommunityIcons
                  name={isPlaying ? "pause" : "play"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={resetRecording}
              >
                <MaterialCommunityIcons name="refresh" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {sound && !isRecording && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={onAnalyzeClick}
            >
              <Text style={styles.nextButtonText}>Analyze Recording</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
            <Text style={styles.resultsTitle}>Analysis Complete!</Text>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.resultsCard}>
              <View style={styles.scoresContainer}>
                <View style={styles.scoreItem}>
                  <MaterialCommunityIcons name="pencil" size={24} color="#246bfd" />
                  <Text style={styles.scoreValue}>{analysisResult.analysis.split('.')[0].split(': ')[1]}</Text>
                  <Text style={styles.scoreLabel}>Grammar</Text>
                </View>
                <View style={styles.scoreDivider} />
                <View style={styles.scoreItem}>
                  <MaterialCommunityIcons name="microphone" size={24} color="#246bfd" />
                  <Text style={styles.scoreValue}>{analysisResult.analysis.split('.')[1].split(': ')[1]}</Text>
                  <Text style={styles.scoreLabel}>Speaking</Text>
                </View>
              </View>

              <View style={styles.transcriptionSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="text-box" size={20} color="#246bfd" />
                  <Text style={styles.sectionTitle}>Transcription</Text>
                </View>
                <Text style={styles.transcriptionText}>{analysisResult.transcription}</Text>
              </View>

              <View style={styles.feedbackSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="lightbulb" size={20} color="#246bfd" />
                  <Text style={styles.sectionTitle}>Feedback</Text>
                </View>
                <Text style={styles.feedbackText}>
                  {analysisResult.analysis.split('. ').slice(2).join('. ')}
                </Text>
              </View>

              <View style={styles.metricsSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="chart-bar" size={20} color="#246bfd" />
                  <Text style={styles.sectionTitle}>Metrics</Text>
                </View>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{analysisResult.metrics?.segments?.length || 0}</Text>
                    <Text style={styles.metricLabel}>Segments</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{Math.round(analysisResult.metrics?.duration || 0)}s</Text>
                    <Text style={styles.metricLabel}>Duration</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
  },
  recordingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  recordingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#246bfd33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingWave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#246bfd22',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#246bfd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#23243a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#246bfd',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 40,
    width: width * 0.8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  resultsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#444',
  },
  scoreValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  scoreLabel: {
    color: '#888',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  transcriptionSection: {
    marginBottom: 24,
  },
  transcriptionText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
  },
  metricsSection: {
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#888',
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: '#246bfd',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});