import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import type { ChartData } from 'react-native-chart-kit/dist/HelperTypes';
import { getUser, getRecentForecast, getInventory, getInsights, getSales } from '../api/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  AppTabs: undefined;
  ForecastScreen: undefined;
  ProductsScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [userInfo, setUserInfo] = React.useState<{ user: string; store_name: string } | null>(null);
  const [itemAverages, setItemAverages] = React.useState<{ [key: string]: number }>({});
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [insights, setInsights] = React.useState<{ top_skus: any[]; low_stock: any[] }>({ top_skus: [], low_stock: [] });
  const [sales, setSales] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        console.log('Access Token:', token);
        if (!token) {
          Alert.alert('Error', 'Not logged in. Please log in.', [
            { text: 'OK', onPress: () => navigation.navigate('LoginScreen') },
          ]);
          return;
        }

        // Fetch user info
        try {
          const userResponse = await getUser();
          console.log('User Response:', userResponse);
          setUserInfo(userResponse);
        } catch (error: any) {
          console.error('User Fetch Error:', error);
          if (error.status === 401) {
            Alert.alert('Session Expired', 'Please log in again.', [
              { text: 'OK', onPress: () => navigation.navigate('LoginScreen') },
            ]);
            return;
          }
        }

        // Fetch recent forecast
        try {
          const forecastResponse = await getRecentForecast();
          console.log('Forecast Response:', forecastResponse);
          if (forecastResponse && Array.isArray(forecastResponse) && forecastResponse.length > 0) {
            const averages: { [key: string]: number } = {};
            forecastResponse.forEach((f: any) => {
              if (f.prediction?.p50?.length > 0) {
                const avg = f.prediction.p50.reduce((a: number, b: number) => a + b, 0) / f.prediction.p50.length;
                averages[f.item_name] = avg;
              }
            });
            setItemAverages(averages);
          }
        } catch (error: any) {
          console.error('Forecast Fetch Error:', error);
        }

        // Fetch inventory
        try {
          const inventoryData = await getInventory();
          console.log('Inventory Response:', inventoryData);
          setInventory(inventoryData || []);
        } catch (error: any) {
          console.error('Inventory Fetch Error:', error);
        }

        // Fetch insights
        try {
          const insightsData = await getInsights();
          console.log('Insights Response:', insightsData);
          setInsights(insightsData || { top_skus: [], low_stock: [] });
        } catch (error: any) {
          console.error('Insights Fetch Error:', error);
        }

        // Fetch sales
        try {
          const salesData = await getSales();
          console.log('Sales Response:', salesData);
          setSales(salesData || []);
        } catch (error: any) {
          console.error('Sales Fetch Error:', error);
        }
      } catch (error: any) {
        console.error('Global Fetch Error:', error);
        Alert.alert('Error', error.error || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const barChartData: ChartData = {
    labels: Object.keys(itemAverages).length ? Object.keys(itemAverages) : ['No Items'],
    datasets: [
      {
        data: Object.keys(itemAverages).length
          ? Object.values(itemAverages).map((value) => Number(value))
          : [0],
      },
    ],
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('store_name');
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const renderInventoryItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.stat}>Stock: {item.current_stock}</Text>
      <Text style={styles.stat}>
        Shelf Life: {item.shelf_life_days ? `${item.shelf_life_days} days` : 'N/A'}
      </Text>
    </View>
  );

  const renderSalesItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.stat}>Quantity Sold: {item.qty_sold}</Text>
      <Text style={styles.stat}>Total: ${item.total?.toFixed(2)}</Text>
      <Text style={styles.stat}>Date: {item.date}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        {userInfo && (
          <Text style={styles.subtitle}>
            {userInfo.user} | {userInfo.store_name}
          </Text>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#97FEED" style={styles.loader} />
      ) : (
        <>
          {/* Inventory Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Inventory</Text>
            {inventory.length > 0 ? (
              <FlatList
                data={inventory}
                renderItem={renderInventoryItem}
                keyExtractor={(item) => item.item_nbr}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.flatList}
              />
            ) : (
              <Text style={styles.noData}>No inventory data available.</Text>
            )}
          </View>

          {/* Forecast Section 
<View style={styles.card}>
  <Text style={styles.cardTitle}>Forecast (Top SKUs)</Text>
  {Object.keys(itemAverages).length > 0 ? (
    <BarChart
      data={barChartData}
      width={Dimensions.get('window').width - 40}
      height={250}
      fromZero
      showValuesOnTopOfBars
      chartConfig={{
        backgroundGradientFrom: '#050A30',
        backgroundGradientTo: '#0B666A',
        decimalPlaces: 0,
        color: () => '#97FEED',
        labelColor: () => '#97FEED',
        barPercentage: 0.7,
        propsForLabels: { fontSize: 9, rotation: 45 },
      }}
      verticalLabelRotation={45}
      style={styles.chart}
      yAxisLabel=""
      yAxisSuffix=""
    />
  ) : (
    <Text style={styles.noData}>No forecast data available.</Text>
  )}
</View>

      */}     

          {/* Insights Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Insights</Text>
            <Text style={styles.subCardTitle}>Top SKUs</Text>
            {insights.top_skus.length > 0 ? (
              insights.top_skus.map((sku, index) => (
                <Text key={index} style={styles.stat}>
                  {sku.name}: {sku.qty_sold} units
                </Text>
              ))
            ) : (
              <Text style={styles.noData}>No top SKUs data.</Text>
            )}
            <Text style={styles.subCardTitle}>Low Stock</Text>
            {insights.low_stock.length > 0 ? (
              insights.low_stock.map((item, index) => (
                <Text key={index} style={styles.stat}>
                  {item.name}: {item.current_stock} units
                </Text>
              ))
            ) : (
              <Text style={styles.noData}>No low stock items.</Text>
            )}
          </View>

          {/* Sales Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Sales</Text>
            {sales.length > 0 ? (
              <FlatList
                data={sales.slice(0, 5)}
                renderItem={renderSalesItem}
                keyExtractor={(item) => `${item.item_nbr}-${item.date}`}
                style={styles.flatList}
              />
            ) : (
              <Text style={styles.noData}>No recent sales data.</Text>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ForecastScreen')}
          >
            <Text style={styles.buttonText}>Generate Forecast</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ProductsScreen')}
          >
            <Text style={styles.buttonText}>Manage Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </>
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
  subCardTitle: {
    color: '#97FEED',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  stat: {
    color: '#97FEED',
    fontSize: 16,
    marginVertical: 5,
  },
  noData: {
    color: '#97FEED80',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#97FEED',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 15,
  },
  logoutButton: {
    backgroundColor: '#FF5555',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 15,
  },
  buttonText: {
    color: '#050A30',
    fontSize: 18,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  flatList: {
    marginBottom: 10,
  },
});

export default HomeScreen;