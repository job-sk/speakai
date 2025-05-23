import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
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
  
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useSharedValue(1);
  const waveAnim = useSharedValue(0);

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
      
      const analysisResult = await authAPI.analyzeSpeech(formData);
      console.log('Analysis result:', analysisResult);
      
      setAnalysisResult(analysisResult);
      setShowAlert(true);

      // Set the flag that voice has been analyzed
      await AsyncStorage.setItem('hasAnalyzedVoice', 'true');

      // Navigate after 10 seconds
      setTimeout(() => {
        navigation.navigate('MainTabs');
      }, 10000);

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
      <Text style={styles.title}>Please provide a 1 minute self introduction</Text>
      <Text style={styles.subtitle}>We'll analyze your language proficiency</Text>

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

      {/* Custom Alert */}
      {showAlert && analysisResult && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Analysis Complete!</Text>
            
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Transcription</Text>
              <Text style={styles.transcriptionText}>{analysisResult.transcription}</Text>
            </View>

            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Analysis</Text>
              <Text style={styles.analysisText}>{analysisResult.analysis}</Text>
            </View>

            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>Metrics</Text>
              <Text style={styles.metricText}>Language: {analysisResult.metrics.language}</Text>
              <Text style={styles.metricText}>Segments: {analysisResult.metrics.segments.length}</Text>
            </View>

            <Text style={styles.redirecting}>Redirecting to dashboard...</Text>
          </View>
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
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  analysisSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  transcriptionText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  analysisText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
  },
  metricsSection: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  metricText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  redirecting: {
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});