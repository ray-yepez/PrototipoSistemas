import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Header con la franja verde completa corporativa
function CustomHeader() {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <View style={[styles.greenHeaderWrapper, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>RZ IMPORT C.A</Text>
          <Text style={styles.headerSub}>Usuario</Text>
        </View>

        {/* Botón de salida con ícono blanco */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader />,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#00C853',
        tabBarInactiveTintColor: '#000000',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Escáner',
          tabBarIcon: ({ color }) => (
            <Ionicons name="qr-code-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Búsqueda',
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  greenHeaderWrapper: {
    backgroundColor: '#00C853', // Fondo verde sólido para toda la franja
    elevation: 4, // Sombra suave en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // Texto blanco para contrastar con el fondo verde
  },
  headerSub: {
    fontSize: 13,
    color: '#E0F2F1', // Texto secundario suave
  },
  logoutButton: {
    padding: 4,
  },
});