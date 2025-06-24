import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { register } from '../api/api';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  RegisterScreen: undefined;
  LoginScreen: undefined;
  AppTabs: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'RegisterScreen'>;

interface Props {
  navigation: NavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!username || !password || !storeName) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      Alert.alert('Error', 'User can only contain letters, numbers, underscores, or hyphens');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await register(username, password, storeName);
      Alert.alert('Success', response.msg || 'Registration successful', [
        { text: 'OK', onPress: () => navigation.navigate('LoginScreen') },
      ]);
    } catch (error: any) {
      console.error('Register Error Details:', error);
      Alert.alert(
        'Error',
        error.error.includes('already exists') ? 'User already taken' :
        error.error.includes('Database') ? 'Server database issue. Please try again later.' :
        'Registration failed. Please check your network and try again.',
        [
          { text: 'Cancel' },
          { text: 'Retry', onPress: handleRegister }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050A30', '#0B666A']} style={styles.gradient}>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join FMCG Forecasting</Text>
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
        <TextInput
          style={styles.input}
          placeholder="Store Name"
          placeholderTextColor="#97FEED80"
          value={storeName}
          onChangeText={setStoreName}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#97FEED" style={{ marginBottom: 20 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.registerText}>Already have an account? Login</Text>
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

export default RegisterScreen;