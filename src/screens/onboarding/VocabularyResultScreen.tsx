import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { BarChart } from 'react-native-chart-kit';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'VocabularyResult'>;
type RouteProps = RouteProp<RootStackParamList, 'VocabularyResult'>;

const MOCK_API = async () => {
  // Simulate API delay
  await new Promise((res) => setTimeout(res, 800));
  return {
    level: 'Beginner A1',
    score: 6,
    outOf: 100,
    activeVocabulary: 57,
    percentile: 65,
    belowAverage: true,
    distribution: [29, 23, 20, 14, 10, 5], // A1, A2, B1, B2, C1, C2
  };
};

export const VocabularyResultScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  // const { selectedWords } = route.params;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await MOCK_API();
      setResult(data);
      setLoading(false);
    })();
  }, []);

  const handleFinish = () => {
    navigation.navigate('Home');
  };

  if (loading || !result) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#246bfd" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Your Vocabulary Level</Text>
        <Text style={styles.level}>
          <Text style={styles.levelMain}>{result.level.split(' ')[0]}</Text>
          <Text style={styles.levelAccent}> {result.level.split(' ')[1]}</Text>
        </Text>
        <Text style={styles.score}>{result.score} out of {result.outOf}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{result.activeVocabulary}</Text>
            <Text style={styles.statLabel}>Active vocabulary</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{result.percentile}%</Text>
            <Text style={styles.statLabel}>Below average for your level</Text>
          </View>
        </View>

        <BarChart
          data={{
            labels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            datasets: [{ data: result.distribution }],
          }}
          width={Dimensions.get('window').width - 48}
          height={180}
          yAxisLabel=""
          yAxisSuffix="%"
          fromZero
          chartConfig={{
            backgroundGradientFrom: '#181a20',
            backgroundGradientTo: '#181a20',
            fillShadowGradient: '#246bfd',
            fillShadowGradientOpacity: 1,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(36, 107, 253, ${opacity})`,
            labelColor: () => '#fff',
            propsForBackgroundLines: { stroke: '#23243a' },
            propsForLabels: { fontSize: 13 },
          }}
          style={{ marginVertical: 12, borderRadius: 12 }}
          withInnerLines={false}
          showBarTops={false}
        />

        <View style={styles.percentRow}>
          {['29%', '23%', '20%', '14%', '10%', '5%'].map((p, i) => (
            <Text key={i} style={styles.percentLabel}>{p}</Text>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: 'bold' }}>This shows only <Text style={{ color: '#fff' }}>25% of your English skills</Text>.</Text>
            {'\n'}To get your complete profile with pronunciation, grammar, and fluency scores, we need to hear you speak!
          </Text>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181a20' },
  scrollContent: { padding: 24, alignItems: 'center' },
  label: { color: '#a0a0a0', fontSize: 15, marginBottom: 6, marginTop: 10 },
  level: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  levelMain: { color: '#fff', fontWeight: 'bold' },
  levelAccent: { color: '#246bfd', fontWeight: 'bold' },
  score: { color: '#fff', fontSize: 18, marginBottom: 18 },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 18 },
  statBox: { backgroundColor: '#23243a', borderRadius: 12, padding: 18, width: '48%', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { color: '#a0a0a0', fontSize: 13, textAlign: 'center' },
  percentRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 10 },
  percentLabel: { color: '#a0a0a0', fontSize: 13, width: 38, textAlign: 'center' },
  infoBox: { backgroundColor: '#23243a', borderRadius: 12, padding: 16, marginTop: 10, marginBottom: 20, width: '100%' },
  infoText: { color: '#a0a0a0', fontSize: 14, textAlign: 'left' },
  finishButton: { backgroundColor: '#246bfd', paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginTop: 10, width: '100%' },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
}); 