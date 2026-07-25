import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Datos de prueba (puedes reemplazarlos por tu backend/estado)
const INITIAL_PRODUCTS = [
  { id: '1', name: 'Tornillo de Acero 1/2', code: 'PRD-001', qty: 150, location: 'A-01-1' },
  { id: '2', name: 'Empacadura Cilindro', code: 'PRD-002', qty: 45, location: 'B-03-2' },
  { id: '3', name: 'Filtro de Aceite', code: 'PRD-003', qty: 20, location: 'A-02-4' },
];

export default function ProductSearchScreen() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Filtrado en tiempo real por código o descripción
  const filteredProducts = products.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Superior */}
      <View style={styles.header}>
        <Text style={styles.headerText}>RZ IMPORT C.A</Text>
        <Text style={styles.headerUser}>Usuario</Text>
      </View>

      {/* Contenido Principal */}
      <View style={styles.content}>
        <Text style={styles.title}>Buscar Producto</Text>

        <TextInput
          placeholder="Ingresar código o descripción"
          placeholderTextColor="#888"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
        />

        {/* Lista de resultados en tabla/tarjetas */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCode}>{item.code}</Text>
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.detailText}>Cant: <Text style={styles.bold}>{item.qty}</Text></Text>
                <Text style={styles.detailText}>Ubicación: <Text style={styles.bold}>{item.location}</Text></Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#00C853',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerUser: {
    color: '#000',
    opacity: 0.7,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#888',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
  },
  list: {
    width: '100%',
  },
  card: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  productCode: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
    fontSize: 15,
  },
});