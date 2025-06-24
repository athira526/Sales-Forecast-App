import AsyncStorage from '@react-native-async-storage/async-storage';
// API utility functions for interacting with the backend server
//this is local url, change it to curret server url
const BASE_URL = 'http://192.168.33.1:5000';

interface ApiError {
  error?: string;
  msg?: string;
  status?: number;
}

const apiCall = async (endpoint: string, method: string, body?: any, headers: HeadersInit = {}) => {
  try {
    console.log(`API Request: ${method} ${BASE_URL}${endpoint}`, { body, headers });
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    console.log(`API Response: ${method} ${endpoint}`, { status: response.status, data });

    if (!response.ok) {
      const error: ApiError = {
        error: data.error || data.msg || 'Request failed',
        status: response.status,
      };
      if (response.status === 401) {
        error.error = 'Unauthorized: Invalid or expired token';
      }
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error(`API Error: ${method} ${endpoint}`, { error: error.message, status: error.status });
    throw {
      error: error.error || 'Network error. Is the server running?',
      status: error.status || 500,
    };
  }
};

export const register = async (username: string, password: string, store_name: string) => {
  return apiCall('/register', 'POST', { username, password, store_name });
};

export const login = async (username: string, password: string) => {
  return apiCall('/login', 'POST', { username, password });
};

export const getUser = async () => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };
  return apiCall('/user', 'GET', undefined, { Authorization: `Bearer ${token}` });
};

export const updateUser = async (store_name: string) => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };
  return apiCall('/user/update', 'POST', { store_name }, { Authorization: `Bearer ${token}` });
};

export const addProduct = async (item_nbr: string, name: string, price: number) => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };
  return apiCall('/products', 'POST', { item_nbr, name, price }, { Authorization: `Bearer ${token}` });
};

export const uploadSalesData = async (file: any) => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };

  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('Upload Request:', { file: file.name });
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    console.log('Upload Response:', { status: response.status, data });
    if (!response.ok) {
      throw { error: data.error || data.msg || 'Upload failed', status: response.status };
    }
    return data;
  } catch (error: any) {
    console.error('Upload Error:', error);
    throw { error: error.error || 'Network error', status: error.status || 500 };
  }
};

export const generateForecast = async (forecast_days: number, store_name: string, item_name: string) => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };
  return apiCall('/forecast', 'POST', { forecast_days, store_name, item_name }, {
    Authorization: `Bearer ${token}`,
  });
};

export const getRecentForecast = async () => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };
  return apiCall('/recent_forecast', 'GET', undefined, { Authorization: `Bearer ${token}` });
};

export const getInventory = async () => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };
  return apiCall('/inventory', 'GET', undefined, { Authorization: `Bearer ${token}` });
};

export const getInsights = async () => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };
  return apiCall('/insights', 'GET', undefined, { Authorization: `Bearer ${token}` });
};

export const getSales = async () => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };
  return apiCall('/sales', 'GET', undefined, { Authorization: `Bearer ${token}` });
};

export const getProducts = async () => {
  const token = await AsyncStorage.getItem('access_token');
  if (!token) throw { error: 'No token found', status: 401 };
  return apiCall('/products', 'GET', undefined, { Authorization: `Bearer ${token}` });
};