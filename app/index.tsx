import { useRouter } from 'expo-router';
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const router = useRouter();

  const handleLogin = () => {
    // Validación rápida opcional antes de navegar
    if (!usuario.trim() || !contrasena.trim()) {
      // Por ahora puedes dejarlo pasar o validar aquí
    }

    // Usamos replace para que no se pueda volver al Login con el botón "Atrás"
    router.replace('/(main)/scanner');
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      {/* Tarjeta contenedora de Login */}
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>

        {/* Campo Usuario */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="ingresa un usuario"
            placeholderTextColor="#888"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />
        </View>

        {/* Campo Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="ingresa una contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            value={contrasena}
            onChangeText={setContrasena}
          />
        </View>

        {/* Botón Entrar */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#f9f9f9',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 25,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#888',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#000',
  },
  button: {
    backgroundColor: '#00C853',
    width: '85%',
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});