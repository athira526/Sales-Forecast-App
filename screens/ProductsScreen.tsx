import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { addProduct } from '../api/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  AppTabs: undefined;
  ForecastScreen: undefined;
  ProductsScreen: undefined;
  HomeScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProductsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [itemNbr, setItemNbr] = React.useState('');
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [products, setProducts] = React.useState<any[]>([
    { item_nbr: '1001', name: 'Parle-G', price: 10 },
    { item_nbr: '1002', name: 'Dettol 500ml', price: 150 },
    { item_nbr: '1003', name: 'Maggi Noodles', price: 20 },
    { item_nbr: '1004', name: 'Cadbury Dairy Milk', price: 40 },
  ]);

  const handleAddProduct = async () => {
    if (!itemNbr || !name || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        Alert.alert('Error', 'Price must be a valid number');
        return;
      }

      await addProduct(itemNbr, name, priceNum);
      setProducts([...products, { item_nbr: itemNbr, name, price: priceNum }]);
      setItemNbr('');
      setName('');
      setPrice('');
      Alert.alert('Success', 'Product added successfully');
    } catch (error: any) {
      console.error('Add Product Error:', error);
      Alert.alert('Error', error.error || 'Failed to add product');
    }
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.stat}>Item Number: {item.item_nbr}</Text>
      <Text style={styles.stat}>Price: ₹{item.price.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Products</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Item Number"
          placeholderTextColor="#97FEED80"
          value={itemNbr}
          onChangeText={setItemNbr}
        />
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          placeholderTextColor="#97FEED80"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Price (₹)"
          placeholderTextColor="#97FEED80"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.item_nbr}
        style={styles.flatList}
        ListEmptyComponent={<Text style={styles.noData}>No products available.</Text>}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('HomeScreen')}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A30',
    padding: 20,
  },
  title: {
    color: '#97FEED',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0B666A',
    color: '#97FEED',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#97FEED40',
  },
  card: {
    backgroundColor: '#0B666A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#97FEED40',
  },
  cardTitle: {
    color: '#97FEED',
    fontSize: 18,
    fontWeight: '600',
  },
  stat: {
    color: '#97FEED',
    fontSize: 16,
    marginTop: 5,
  },
  noData: {
    color: '#97FEED80',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#97FEED',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#050A30',
    fontSize: 18,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
});

export default ProductsScreen;