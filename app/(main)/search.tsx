import React, { useState } from 'react';
import {
    FlatList,
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Tipo de dato para los productos
interface Product {
    id: string;
    codigo: string;
    descripcion: string;
    ubicacion: string;
    cantidad: number;
}

// Datos de prueba
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        codigo: 'FIL-AWA-001',
        descripcion: 'Filtro de aceite AWA',
        ubicacion: 'PASILLO A - ANAQUEL 3 - NIVEL 2',
        cantidad: 20,
    },
    {
        id: '2',
        codigo: 'FIL-RAL-001',
        descripcion: 'Filtro de aceite RALLY',
        ubicacion: 'PASILLO A - ANAQUEL 3 - NIVEL 4',
        cantidad: 5,
    },
    {
        id: '3',
        codigo: 'FIL-AWA-101',
        descripcion: 'Filtro de agua AWA',
        ubicacion: 'PASILLO B - ANAQUEL 2 - NIVEL 4',
        cantidad: 12,
    },
    {
        id: '4',
        codigo: 'FIL-AWA-201',
        descripcion: 'Filtro de aire AWA',
        ubicacion: 'PASILLO B - ANAQUEL 2 - NIVEL 4',
        cantidad: 8,
    },
    {
        id: '5',
        codigo: 'BUJ-NGK-001',
        descripcion: 'Bujía NGK Iridium',
        ubicacion: 'PASILLO C - ANAQUEL 1 - NIVEL 1',
        cantidad: 30,
    },
];

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Función de búsqueda
    const handleSearch = () => {
        Keyboard.dismiss();
        const query = searchQuery.trim().toLowerCase();

        if (query === '') {
            setResults([]);
            setHasSearched(false);
            return;
        }

        const filtered = MOCK_PRODUCTS.filter(
            (item) =>
                item.codigo.toLowerCase().includes(query) ||
                item.descripcion.toLowerCase().includes(query)
        );

        setResults(filtered);
        setHasSearched(true);
    };

    // Render de cada fila de la tabla
    const renderTableRow = ({ item, index }: { item: Product; index: number }) => (
        <View style={[styles.tableRow, index % 2 === 1 && styles.tableRowEven]}>
            <Text style={[styles.tableCell, styles.colCodigo]} numberOfLines={2}>
                {item.codigo}
            </Text>
            <Text style={[styles.tableCell, styles.colDescripcion]} numberOfLines={2}>
                {item.descripcion}
            </Text>
            <Text style={[styles.tableCell, styles.colUbicacion]} numberOfLines={2}>
                {item.ubicacion}
            </Text>
            <Text style={[styles.tableCell, styles.colCantidad]}>
                {item.cantidad}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Verde Superior */}
            <View style={styles.header}>
                <Text style={styles.headerCompany}>RZ IMPORT C.A</Text>
                <Text style={styles.headerUser}>usuario</Text>
            </View>

            {/* Contenido Principal */}
            <View style={styles.content}>
                {!hasSearched && (
                    <Text style={styles.mainTitle}>Buscar Producto</Text>
                )}

                {/* Input de Búsqueda */}
                <View style={styles.searchBoxContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="ingresar codigo o descripción"
                        placeholderTextColor="#8E8E93"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoCapitalize="none"
                    />
                </View>

                {/* Botón Buscar */}
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Buscar</Text>
                </TouchableOpacity>

                {/* Tabla de Resultados */}
                {hasSearched && (
                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, styles.colCodigo]}>código</Text>
                            <Text style={[styles.tableHeaderCell, styles.colDescripcion]}>descripción</Text>
                            <Text style={[styles.tableHeaderCell, styles.colUbicacion]}>ubicación</Text>
                            <Text style={[styles.tableHeaderCell, styles.colCantidad]}>cant.</Text>
                        </View>

                        {results.length > 0 ? (
                            <FlatList
                                data={results}
                                keyExtractor={(item) => item.id}
                                renderItem={renderTableRow}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <View style={styles.noResultsContainer}>
                                <Text style={styles.noResultsText}>No se encontraron productos</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        backgroundColor: '#00C853',
        paddingTop: 45,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerCompany: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerUser: {
        color: '#1B5E20',
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 30,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    searchBoxContainer: {
        width: '85%',
        marginBottom: 15,
    },
    searchInput: {
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#757575',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 14,
        color: '#000',
        textAlign: 'center',
    },
    searchButton: {
        backgroundColor: '#00C853',
        borderWidth: 1.5,
        borderColor: '#000',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 35,
        marginBottom: 20,
    },
    searchButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },

    /* ESTRUCTURA DE LA TABLA */
    tableContainer: {
        width: '100%',
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#000',
        backgroundColor: '#FFF',
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1.5,
        borderColor: '#000',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    tableHeaderCell: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#000',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    tableRowEven: {
        backgroundColor: '#F9F9F9',
    },
    tableCell: {
        fontSize: 11,
        color: '#000',
        paddingHorizontal: 2,
    },

    /* ANCHO DE COLUMNAS */
    colCodigo: {
        flex: 2.2,
        textAlign: 'left',
        paddingLeft: 4,
    },
    colDescripcion: {
        flex: 3,
        textAlign: 'left',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 4,
    },
    colUbicacion: {
        flex: 3.5,
        textAlign: 'left',
        borderRightWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 4,
    },
    colCantidad: {
        flex: 1.2,
        textAlign: 'center',
    },

    noResultsContainer: {
        padding: 30,
        alignItems: 'center',
    },
    noResultsText: {
        color: '#757575',
        fontSize: 14,
        fontStyle: 'italic',
    },
});