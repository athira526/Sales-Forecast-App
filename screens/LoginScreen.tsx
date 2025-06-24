import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../api/api';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  AppTabs: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'LoginScreen'>;

interface Props {
  navigation: NavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(username, password);
      await AsyncStorage.setItem('access_token', response.access_token);
      await AsyncStorage.setItem('store_name', response.store_name);
      navigation.navigate('AppTabs');
    } catch (error: any) {
      console.error('Login Error Details:', error);
      Alert.alert(
        'Error',
        error.error.includes('Invalid') ? 'Invalid user or password' :
        'Login failed. Please check your network and try again.',
        [
          { text: 'Cancel' },
          { text: 'Retry', onPress: handleLogin }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050A30', '#0B666A']} style={styles.gradient}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to FMCG Forecasting</Text>
        <TextInput
          style={styles.input}
          placeholder="User"
          placeholderTextColor="#97FEED80"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#97FEED80"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#97FEED" style={{ marginBottom: 20 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('RegisterScreen')}
        >
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#97FEED',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#97FEED',
    fontSize: 18,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#050A30AA',
    color: '#97FEED',
    borderWidth: 1,
    borderColor: '#97FEED66',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#97FEED',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '60%',
  },
  buttonText: {
    color: '#050A30',
    fontSize: 18,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    color: '#97FEED',
    fontSize: 14,
  },
});

export default LoginScreen;