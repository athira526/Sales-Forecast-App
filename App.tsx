import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ForecastScreen from './screens/ForecastScreen';
import ProductsScreen from './screens/ProductsScreen';

type RootStackParamList = {
  Auth: undefined;
  AppTabs: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

type AppTabParamList = {
  HomeScreen: undefined;
  ForecastScreen: undefined;
  ProductsScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

const AppTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (route.name === 'HomeScreen') iconName = 'home';
          else if (route.name === 'ForecastScreen') iconName = 'stats-chart';
          else iconName = 'cube';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#97FEED',
        tabBarInactiveTintColor: '#97FEED66',
        tabBarStyle: {
          backgroundColor: '#050A30',
          borderTopColor: '#97FEED40',
          borderTopWidth: 1,
        },
        headerStyle: { backgroundColor: '#050A30' },
        headerTintColor: '#97FEED',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="ForecastScreen" component={ForecastScreen} options={{ title: 'Forecast' }} />
      <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="ProductsScreen" component={ProductsScreen} options={{ title: 'Products' }} />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="AppTabs" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;