import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen() {
    // Datos mock de la orden
    const [currentOrder] = useState({
        id: '#PF-99482',
        code: 'FIL-AWA-001',
        description: 'Filtro de aciete AWA',
        quantity: 1,
        location: 'PASILLO A - ANAQUEL 3 - NIVEL 2',
    });

    // Estado del escáner para completar orden
    const [isScanning, setIsScanning] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    // Estados del reporte de incidencias
    const [showErrorReport, setShowErrorReport] = useState(false);
    const [errorDescription, setErrorDescription] = useState('');
    const [evidenceImage, setEvidenceImage] = useState<string | null>(null);

    // Abrir la cámara para validar QR
    const handleOpenScanner = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para escanear el QR.');
                return;
            }
        }
        setScanned(false);
        setIsScanning(true);
    };

    // Lógica al detectar un código QR
    const handleBarcodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        setIsScanning(false);

        if (data === currentOrder.code) {
            Alert.alert(
                '¡Orden Completada!',
                `El código ${data} coincide exitosamente con la orden ${currentOrder.id}.`
            );
        } else {
            Alert.alert(
                'Código Incorrecto',
                `El código escaneado (${data}) no coincide con el producto esperado (${currentOrder.code}).`
            );
        }
    };

    // Adjuntar evidencia fotográfica
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la galería.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setEvidenceImage(result.assets[0].uri);
        }
    };

    // Enviar reporte de error
    const handleSaveReport = () => {
        if (!errorDescription.trim()) {
            Alert.alert('Atención', 'Por favor, escriba una descripción del error.');
            return;
        }

        Alert.alert('Incidencia Registrada', 'El reporte fue enviado correctamente.', [
            {
                text: 'OK',
                onPress: () => {
                    setShowErrorReport(false);
                    setErrorDescription('');
                    setEvidenceImage(null);
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {!showErrorReport ? (
                    /* ================= VISTA DE LA ORDEN ================= */
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Orden N°</Text>
                            <Text style={styles.valueBold}>{currentOrder.id}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Código</Text>
                            <Text style={styles.value}>{currentOrder.code}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Descripción</Text>
                            <Text style={styles.value}>{currentOrder.description}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Cantidad</Text>
                            <Text style={styles.value}>{currentOrder.quantity}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Ubicación</Text>
                            <Text style={styles.valueLocation}>{currentOrder.location}</Text>
                        </View>

                        {/* Acciones */}
                        <View style={styles.actionsContainer}>
                            <Text style={styles.sectionTitle}>Completar orden</Text>
                            <TouchableOpacity
                                style={styles.btnScan}
                                onPress={handleOpenScanner}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="qr-code-outline" size={28} color="#000000" />
                            </TouchableOpacity>

                            <Text style={styles.sectionTitle}>Notificar error</Text>
                            <TouchableOpacity
                                style={styles.btnError}
                                onPress={() => setShowErrorReport(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.btnErrorIcon}>!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    /* ================= VISTA NOTIFICAR ERROR ================= */
                    <View style={styles.reportContainer}>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describa el error:"
                            placeholderTextColor="#888888"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={errorDescription}
                            onChangeText={setErrorDescription}
                        />

                        <TouchableOpacity style={styles.evidencePicker} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={22} color="#555" />
                            <Text style={styles.evidenceText}>
                                {evidenceImage ? 'Cambiar evidencia' : 'Adjuntar foto / evidencia'}
                            </Text>
                        </TouchableOpacity>

                        {evidenceImage && (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: evidenceImage }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    onPress={() => setEvidenceImage(null)}
                                    style={styles.removeImageBtn}
                                >
                                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.reportButtonsRow}>
                            <TouchableOpacity
                                style={[styles.btnAction, styles.btnGreen]}
                                onPress={handleSaveReport}
                            >
                                <Text style={styles.btnActionText}>Guardar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btnAction, styles.btnRed]}
                                onPress={() => {
                                    setShowErrorReport(false);
                                    setErrorDescription('');
                                    setEvidenceImage(null);
                                }}
                            >
                                <Text style={styles.btnActionText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* ================= MODAL ESCÁNER DE CÁMARA ================= */}
            <Modal visible={isScanning} animationType="slide" transparent={false}>
                <SafeAreaView style={styles.cameraContainer}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr', 'code128', 'ean13'],
                        }}
                    >
                        <View style={styles.cameraOverlay}>
                            <View style={styles.targetBox} />
                            <TouchableOpacity
                                style={styles.closeCameraButton}
                                onPress={() => setIsScanning(false)}
                            >
                                <Ionicons name="close" size={30} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        width: '35%',
    },
    valueBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        width: '65%',
        textAlign: 'right',
    },
    value: {
        fontSize: 15,
        color: '#444444',
        width: '65%',
        textAlign: 'right',
    },
    valueLocation: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333333',
        width: '65%',
        textAlign: 'right',
    },
    actionsContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#000000',
    },
    btnScan: {
        backgroundColor: '#00C853',
        width: 120,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    btnError: {
        backgroundColor: '#FF3B30',
        width: 120,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnErrorIcon: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },

    /* Reporte de Error */
    reportContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
    },
    textArea: {
        borderWidth: 1.5,
        borderColor: '#888888',
        borderRadius: 8,
        padding: 14,
        fontSize: 15,
        backgroundColor: '#FFFFFF',
        minHeight: 180,
        marginBottom: 15,
    },
    evidencePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderStyle: 'dashed',
        marginBottom: 15,
    },
    evidenceText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#555555',
    },
    imagePreviewContainer: {
        position: 'relative',
        alignSelf: 'center',
        marginBottom: 20,
    },
    imagePreview: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    reportButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    btnAction: {
        width: 120,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnGreen: {
        backgroundColor: '#00C853',
    },
    btnRed: {
        backgroundColor: '#FF3B30',
    },
    btnActionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },

    /* Cámara Modal */
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    targetBox: {
        width: 240,
        height: 240,
        borderWidth: 2,
        borderColor: '#00C853',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    closeCameraButton: {
        position: 'absolute',
        top: 30,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 25,
    },
});
