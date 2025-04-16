import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './screens/AuthScreen';
import ForecastScreen from './screens/ForecastScreen';
import InsightsScreen from './screens/InsightsScreen';
import HomeScreen from './screens/HomeScreen';

// Navigation types
type RootStackParamList = {
  Auth: undefined;
  HomeScreen : undefined;
  Forecast: undefined;
  Insights: {
    forecast: { p10: number[]; p50: number[]; p90: number[] };
    store_name: string;
    item_name: string;
    history: number[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerStyle: { backgroundColor: '#050A30' },
          headerTintColor: '#97FEED',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Login' }} />
        <Stack.Screen name = "HomeScreen" component={HomeScreen} options={{title: 'Homescreen'}}/>
        <Stack.Screen name="Forecast" component={ForecastScreen} options={{ title: 'Forecast' }} />
        <Stack.Screen name="Insights" component={InsightsScreen} options={{ title: 'Insights' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;