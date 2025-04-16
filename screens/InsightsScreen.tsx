import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

// Navigation types
type RootStackParamList = {
  Auth: undefined;
  Forecast: undefined;
  Insights: {
    forecast: { p10: number[]; p50: number[]; p90: number[] };
    store_name: string;
    item_name: string;
    history: number[];
  };
};

type InsightsRouteProp = RouteProp<RootStackParamList, 'Insights'>;

const InsightsScreen: React.FC = () => {
  const route = useRoute<InsightsRouteProp>();
  
  // Safely access params with fallback
  const {
    forecast = { p10: [], p50: [], p90: [] },
    store_name = 'Default Store',
    item_name = 'Default Item',
    history = [],
  } = route.params || {};

  // Mock data if empty
  const chartData = {
    p10: forecast.p10.length ? forecast.p10 : Array(30).fill(0),
    p50: forecast.p50.length ? forecast.p50 : Array(30).fill(50),
    p90: forecast.p90.length ? forecast.p90 : Array(30).fill(100),
    history: history.length ? history : Array(30).fill(20),
  };

  console.log('InsightsScreen params:', { forecast, store_name, item_name, history });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {store_name} - {item_name}
        </Text>
        <Text style={styles.subtitle}>Historical Sales</Text>
        <LineChart
          data={{
            labels: Array(chartData.history.length).fill(''),
            datasets: [
              {
                data: chartData.history,
                color: () => '#FF00FF', // Neon pink
                strokeWidth: 2,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={200}
          chartConfig={{
            backgroundGradientFrom: '#050A30',
            backgroundGradientTo: '#0B666A',
            decimalPlaces: 0,
            color: () => '#97FEED',
            labelColor: () => '#97FEED',
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#97FEED',
            },
          }}
          style={styles.chart}
        />
        <Text style={styles.subtitle}>Forecast</Text>
        <LineChart
          data={{
            labels: Array(chartData.p50.length).fill(''),
            datasets: [
              {
                data: chartData.p10,
                color: () => '#00FF00', // Neon lime
                strokeWidth: 1,
              },
              {
                data: chartData.p50,
                color: () => '#FF00FF', // Neon pink
                strokeWidth: 2,
              },
              {
                data: chartData.p90,
                color: () => '#00FF00', // Neon lime
                strokeWidth: 1,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={200}
          chartConfig={{
            backgroundGradientFrom: '#050A30',
            backgroundGradientTo: '#0B666A',
            decimalPlaces: 0,
            color: () => '#97FEED',
            labelColor: () => '#97FEED',
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#97FEED',
            },
          }}
          style={styles.chart}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A30',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#97FEED',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textShadowColor: '#97FEED',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: '#97FEED',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default InsightsScreen;