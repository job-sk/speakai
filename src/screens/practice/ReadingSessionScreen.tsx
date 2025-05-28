import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
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
  interpolate,
} from 'react-native-reanimated';
import { authAPI } from 'services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReadingResultScreen'>;

const { width } = Dimensions.get('window');

// Sample article - In a real app, this would come from an API
const sampleArticle = {
  title: "The Future of Technology",
  content: "Artificial Intelligence is transforming our world in unprecedented ways. From virtual assistants to self-driving cars, AI is becoming an integral part of our daily lives. Machine learning algorithms are helping doctors diagnose diseases more accurately, while natural language processing is revolutionizing how we interact with computers. As we move forward, the ethical implications of AI development become increasingly important. We must ensure that these powerful technologies are developed and used responsibly, with consideration for their impact on society and individuals.",
  wordCount: 89
};

type BoundaryEvent = {
  charIndex?: number;
  charLength?: number;
  utterance?: string;
};

export const ReadingSessionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingURI, setRecordingURI] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState<number[]>([]);
  const waveAnimation = useSharedValue(0);
  const [isReading, setIsReading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const words = sampleArticle.content.split(' ');

  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useSharedValue(1);
  const waveAnim = useSharedValue(0);

  const resetScreen = useCallback(() => {
    setRecording(null);
    setRecordingURI(null);
    setIsRecording(false);
    setIsPlaying(false);
    setSound(null);
  }, []);

  // Reset screen when it comes into focus
  useFocusEffect(
    useCallback(() => {
      resetScreen();
      return () => {
        // Cleanup when screen loses focus
        if (recording) {
          recording.stopAndUnloadAsync();
        }
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [])
  );

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
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Stop any ongoing speech
      if (isReading) {
        await Speech.stop();
        setIsReading(false);
        setCurrentWordIndex(-1);
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

    cancelAnimation(pulseAnim);
    cancelAnimation(waveAnim);
    pulseAnim.value = withSpring(1);
    waveAnim.value = withSpring(0);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingURI(uri);
      setRecording(null);
      generateWaveform();

      if (uri) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
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
        if (status.isLoaded && status.durationMillis && 
            (status.didJustFinish || status.positionMillis >= status.durationMillis)) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (err) {
      console.error('Failed to play/pause sound', err);
      setIsPlaying(false);
    }
  };

  const analyzeRecording = async () => {
    if (!recordingURI) return;
    
    try {
      const formData = new FormData();
      const filename = recordingURI.split('/').pop()!;
      const mimeType = 'audio/mp4';
      formData.append('audio', {
        uri: recordingURI,
        type: mimeType,
        name: filename,
      } as any);
      
      //Todo: uncomment this to use the api
      // const response = await authAPI.analyzeSpeech(formData, 'reading');
      // console.log('data from reading session screen',response.data);
      
      //! moke data
      const response = {"data":
        {
          "pronunciation_score": 8,
          "fluency_score": 7,
          "feedback": "Good attempt with minor grammatical errors",
          "text_with_errors": {
            "full_text": "Consistency are the key to master any skill. Whether it's learning new language, coding or fitness, small daily effort builds lasting progress. Instead waiting for motivation, create routine that keeps you move forward. Over time, this habits compound, leading to big improvement. Even in tough days, showing up matter more than perfection.",
            "errors": [
              {
                "incorrect": "are",
                "correction": "is",
                "type": "verb_form",
                "position": {
                  "start": 12,
                  "end": 15
                },
                "context": "Consistency are the key"
              },
              {
                "incorrect": "master",
                "correction": "mastering",
                "type": "verb_form",
                "position": {
                  "start": 25,
                  "end": 31
                },
                "context": "to master any skill"
              },
              {
                "incorrect": "this",
                "correction": "these",
                "type": "word_choice",
                "position": {
                  "start": 172,
                  "end": 176
                },
                "context": "Over time, this habits compound"
              },
              {
                "incorrect": "big",
                "correction": "significant",
                "type": "word_choice",
                "position": {
                  "start": 191,
                  "end": 194
                },
                "context": "leading to big improvement"
              }
            ]
          },
          "areas_to_improve": {
            "articles": ["learning new language", "create routine", "in tough days"],
            "plurals": ["small daily effort builds", "this habits compound", "showing up matter"],
            "verb_forms": ["Consistency are the key", "to master any skill", "keeps you move forward"],
            "word_choice": ["Over time, this habits compound", "leading to big improvement"]
          },
          "key_errors": ["Incorrect verb form 'are' instead of 'is'", "Incorrect verb form 'master' instead of 'mastering'", "Incorrect word 'this' instead of 'these'", "Incorrect word 'big' instead of 'significant'"]
        }
        
      }
      navigation.navigate('ReadingResultScreen', { result: response.data });
    } catch (error) {
      Alert.alert('Failed to analyze recording')
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(waveAnimation.value, [0, 1], [1, 1.2]) }],
  }));

  const generateWaveform = () => {
    const waveform = Array.from({ length: 50 }, () => Math.random() * 0.5 + 0.1);
    setAudioWaveform(waveform);
  };

  const resetRecording = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setRecordingURI(null);
    setAudioWaveform([]);
  };

  useEffect(() => {
    if (isPlaying) {
      waveAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      waveAnimation.value = withTiming(0);
    }
  }, [isPlaying]);

  const readAloud = async () => {
    try {
      if (isReading) {
        await Speech.stop();
        setIsReading(false);
        setCurrentWordIndex(-1);
      } else {
        setIsReading(true);
        setCurrentWordIndex(-1);
        await Speech.speak(sampleArticle.content, {
          voice: "en-us-x-iol-local",
          rate: 0.85,
          onBoundary: (event: BoundaryEvent) => {
            if (event.charIndex !== undefined) {
              // Find the word index based on character position
              let charCount = 0;
              for (let i = 0; i < words.length; i++) {
                charCount += words[i].length + 1; // +1 for space
                if (charCount > event.charIndex) {
                  setCurrentWordIndex(i);
                  break;
                }
              }
            }
          },
          onDone: () => {
            setIsReading(false);
            setCurrentWordIndex(-1);
          },
          onError: () => {
            setIsReading(false);
            setCurrentWordIndex(-1);
          },
        });
      }
    } catch (error) {
      console.error('Failed to read aloud:', error);
      setIsReading(false);
      setCurrentWordIndex(-1);
    }
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup function
      const cleanup = async () => {
        try {
          // Stop any ongoing speech
          if (isReading) {
            await Speech.stop();
            setIsReading(false);
            setCurrentWordIndex(-1);
          }

          // Stop and unload any recording
          if (recording) {
            const status = await recording.getStatusAsync();
            if (status.isRecording) {
              await recording.stopAndUnloadAsync();
              console.log("recording stopped");
              setRecording(null);
            }
          }

          // Stop and unload any playback
          if (sound) {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              await sound.stopAsync();
              await sound.unloadAsync();
              setSound(null);
            }
          }

          // Clear any timers
          if (durationTimer.current) {
            clearInterval(durationTimer.current);
          }
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      };

      cleanup();
    };
  }, [isReading, recording, sound]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Reading Practice</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.articleContainer}>
          <Text style={styles.articleTitle}>{sampleArticle.title}</Text>
          <Text style={styles.articleContent}>
            {words.map((word, index) => (
              <Text
                key={index}
                style={[
                  styles.word,
                  currentWordIndex === index && styles.highlightedWord,
                ]}
              >
                {word}{' '}
              </Text>
            ))}
          </Text>
          <View style={styles.wordCountContainer}>
            <TouchableOpacity
              style={styles.readAloudButton}
              onPress={readAloud}
            >
              <MaterialCommunityIcons
                name={isReading ? "stop" : "play"}
                size={20}
                color="#246bfd"
              />
              <Text style={styles.readAloudText}>
                {isReading ? "Stop" : "Read"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.wordCount}>{sampleArticle.wordCount} words</Text>
          </View>
        </View>

        {sound && recordingURI && (
          <View style={styles.audioWaveContainer}>
            <View style={styles.waveformContainer}>
              {audioWaveform.map((height, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveformBar,
                    {
                      height: `${height * 100}%`,
                    },
                    waveStyle,
                  ]}
                />
              ))}
            </View>
            <View style={styles.audioControls}>
              <TouchableOpacity
                style={styles.audioControlButton}
                onPress={playSound}
              >
                <MaterialCommunityIcons
                  name={isPlaying ? "pause" : "play"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.audioControlButton}
                onPress={resetRecording}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.controlsContainer}>
        {!isRecording && !sound ? (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startRecording}
          >
            <MaterialCommunityIcons name="microphone" size={24} color="#fff" />
            <Text style={styles.buttonText}>Start Reading</Text>
          </TouchableOpacity>
        ) : isRecording ? (
          <TouchableOpacity
            style={[styles.recordButton, styles.stopButton]}
            onPress={stopRecording}
          >
            <MaterialCommunityIcons name="stop" size={24} color="#fff" />
            <Text style={styles.buttonText}>Stop Reading</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={analyzeRecording}
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Analyze</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  articleContainer: {
    backgroundColor: '#2a2a2a',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  articleContent: {
    fontSize: 18,
    color: '#ccc',
    lineHeight: 24,
  },
  wordCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  readAloudButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(36, 107, 253, 0.1)',
  },
  readAloudText: {
    color: '#246bfd',
    fontSize: 14,
    fontWeight: '600',
  },
  wordCount: {
    fontSize: 14,
    color: '#888',
  },
  controlsContainer: {
    height: 90,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  recordButton: {
    backgroundColor: '#246bfd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 30,
    gap: 8,
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    backgroundColor: '#333',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#246bfd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    height: "100%",
    borderRadius: 30,
    flexDirection: 'row',
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  audioWaveContainer: {
    backgroundColor: '#2a2a2a',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    height: 120,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#246bfd',
    borderRadius: 3,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  audioControlButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    color: '#ccc',
  },
  highlightedWord: {
    color: '#246bfd'
  },
});
