import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { uploadSalesData, generateForecast } from '../api/api';

const ForecastScreen: React.FC = () => {
  const [storeName, setStoreName] = React.useState<string>('');
  const [itemName, setItemName] = React.useState<string>('Parle-G');
  const [forecastDays, setForecastDays] = React.useState<string>('7');
  const [fileName, setFileName] = React.useState<string>('No file selected');
  const [file, setFile] = React.useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [forecast, setForecast] = React.useState<any>(null);

  React.useEffect(() => {
    const loadStoreName = async () => {
      const storedStoreName = await AsyncStorage.getItem('store_name');
      if (storedStoreName) setStoreName(storedStoreName);
    };
    loadStoreName();
  }, []);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      if (!result.canceled && result.assets.length > 0) {
        setFile(result);
        setFileName(result.assets[0].name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleUpload = async () => {
    if (!file || file.canceled || !file.assets[0]) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }

    try {
      const fileData = {
        uri: file.assets[0].uri,
        type: file.assets[0].mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: file.assets[0].name,
      };
      const response = await uploadSalesData(fileData);
      Alert.alert('Success', 'File uploaded successfully');
      setFile(null);
      setFileName('No file selected');
    } catch (error: any) {
      Alert.alert('Error', error.error || 'File upload failed');
    }
  };

  const handleForecast = async () => {
    if (!storeName || !itemName || !forecastDays) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const days = parseInt(forecastDays, 10);
    if (isNaN(days) || days < 1 || days > 30) {
      Alert.alert('Error', 'Forecast days must be between 1 and 30');
      return;
    }

    try {
      const response = await generateForecast(days, storeName, itemName);
      setForecast(response);
      Alert.alert('Success', `Forecast generated for ${itemName}`);
    } catch (error: any) {
      Alert.alert('Error', error.error || 'Forecast generation failed');
    }
  };

  const chartData = forecast
    ? {
        labels: Array.from({ length: forecast.forecast.p50.length }, (_, i) => `Day ${i + 1}`),
        datasets: [
          { data: forecast.forecast.p10, color: () => '#FF5555', strokeWidth: 2 },
          { data: forecast.forecast.p50, color: () => '#97FEED', strokeWidth: 2 },
          { data: forecast.forecast.p90, color: () => '#55FF55', strokeWidth: 2 },
        ],
        legend: ['P10', 'P50', 'P90'],
      }
    : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forecasting</Text>
        <Text style={styles.subtitle}>Upload data and generate forecasts</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload Sales Data</Text>
        <TouchableOpacity style={styles.button} onPress={handleFilePick}>
          <Text style={styles.buttonText}>Select Excel File</Text>
        </TouchableOpacity>
        <Text style={styles.fileName}>{fileName}</Text>
        <TouchableOpacity style={styles.button} onPress={handleUpload}>
          <Text style={styles.buttonText}>Upload File</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Generate Forecast</Text>
        <TextInput
          style={styles.input}
          placeholder="Store Name"
          placeholderTextColor="#97FEED80"
          value={storeName}
          onChangeText={setStoreName}
        />
        <TextInput
          style={styles.input}
          placeholder="Item Name (e.g., Parle-G)"
          placeholderTextColor="#97FEED80"
          value={itemName}
          onChangeText={setItemName}
        />
        <TextInput
          style={styles.input}
          placeholder="Forecast Days (1-30)"
          placeholderTextColor="#97FEED80"
          value={forecastDays}
          onChangeText={setForecastDays}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleForecast}>
          <Text style={styles.buttonText}>Generate Forecast</Text>
        </TouchableOpacity>
      </View>
      {forecast && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Forecast Results</Text>
          <LineChart
            data={chartData!}
            width={Dimensions.get('window').width - 60}
            height={220}
            yAxisSuffix=" units"
            chartConfig={{
              backgroundColor: '#050A30',
              backgroundGradientFrom: '#050A30',
              backgroundGradientTo: '#0B666A',
              decimalPlaces: 0,
              color: () => '#97FEED',
              labelColor: () => '#97FEED',
              style: { borderRadius: 16 },
            }}
            style={styles.chart}
          />
          <Text style={styles.suggestion}>
            {forecast.suggestions[0]?.message || 'No suggestions available'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A30',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#97FEED',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#97FEED80',
    fontSize: 16,
    marginTop: 5,
  },
  card: {
    backgroundColor: '#0B666A',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#97FEED40',
  },
  cardTitle: {
    color: '#97FEED',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#050A30AA',
    color: '#97FEED',
    borderWidth: 1,
    borderColor: '#97FEED66',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#97FEED',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#050A30',
    fontSize: 18,
    fontWeight: '600',
  },
  fileName: {
    color: '#97FEED',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  suggestion: {
    color: '#97FEED',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ForecastScreen;