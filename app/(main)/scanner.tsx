import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScannerScreen() {
    const [activeTab, setActiveTab] = useState<'producto' | 'ubicacion'>('producto');

    // Campos del formulario
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [location, setLocation] = useState('');

    // Cámara y escáner
    const [isScanning, setIsScanning] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    // Modal QR
    const [showQrModal, setShowQrModal] = useState(false);

    // Abrir escáner
    const handleOpenScanner = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara para escanear.');
                return;
            }
        }
        setScanned(false);
        setIsScanning(true);
    };

    // LÓGICA DE ESCANEO SEGÚN PESTAÑA ACTIVA
    const handleBarcodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        setIsScanning(false);

        try {
            const parsed = JSON.parse(data);

            if (typeof parsed === 'object' && parsed !== null) {
                const normalizedKeys: Record<string, any> = {};
                Object.keys(parsed).forEach((key) => {
                    normalizedKeys[key.toLowerCase()] = parsed[key];
                });

                // MODO UBICACIÓN: Solo extrae datos de ubicación
                if (activeTab === 'ubicacion') {
                    const pasillo = normalizedKeys.pasillo ? `PASILLO ${normalizedKeys.pasillo}` : '';
                    const anaquel = normalizedKeys.anaquel ? `ANAQUEL ${normalizedKeys.anaquel}` : '';
                    const nivel = normalizedKeys.nivel ? `NIVEL ${normalizedKeys.nivel}` : '';

                    const fullLocation =
                        normalizedKeys.ubicacion ||
                        normalizedKeys.location ||
                        [pasillo, anaquel, nivel].filter(Boolean).join(' - ');

                    setLocation(fullLocation || data);
                }
                // MODO PRODUCTO: Solo extrae datos del producto
                else {
                    // 1. EXTRAER ID / CÓDIGO (Prioridad en ID)
                    const extractedCode =
                        normalizedKeys.id ||
                        normalizedKeys.codigo ||
                        normalizedKeys.code ||
                        normalizedKeys.cod ||
                        normalizedKeys.sku;

                    if (extractedCode) {
                        setCode(String(extractedCode));
                    }

                    // 2. EXTRAER DESCRIPCIÓN
                    const extractedDesc =
                        normalizedKeys.descripcion ||
                        normalizedKeys.description ||
                        normalizedKeys.nombre ||
                        normalizedKeys.name ||
                        normalizedKeys.desc ||
                        normalizedKeys.producto;

                    if (extractedDesc) {
                        setDescription(String(extractedDesc));
                    }

                    // 3. EXTRAER CANTIDAD
                    const extractedQty =
                        normalizedKeys.cantidad ||
                        normalizedKeys.quantity ||
                        normalizedKeys.cant ||
                        normalizedKeys.stock;

                    if (extractedQty) {
                        setQuantity(String(extractedQty));
                    }
                }
            }
        } catch (e) {
            if (activeTab === 'ubicacion') {
                setLocation(data);
            } else {
                setCode(data);
            }
        }
    };

    // Vincular (Solo procesa el guardado, sin abrir el modal del QR)
    const handleLink = () => {
        if (activeTab === 'producto' && !code.trim()) {
            Alert.alert('Atención', 'Ingresa o escanea un código de producto.');
            return;
        }

        if (activeTab === 'ubicacion' && !location.trim()) {
            Alert.alert('Atención', 'Ingresa o escanea una ubicación.');
            return;
        }

        Alert.alert(
            'Éxito',
            `${activeTab === 'producto' ? 'Producto' : 'Ubicación'} vinculado correctamente.`
        );
    };

    // Abrir Modal de QR verificando datos previos
    const handleOpenQrModal = () => {
        if (activeTab === 'producto' && !code.trim()) {
            Alert.alert('Atención', 'Ingresa o escanea un código de producto para generar el QR.');
            return;
        }
        if (activeTab === 'ubicacion' && !location.trim()) {
            Alert.alert('Atención', 'Ingresa o escanea una ubicación para generar el QR.');
            return;
        }
        setShowQrModal(true);
    };

    // Construir string que se codifica DENTRO del QR
    const getQrValue = () => {
        if (activeTab === 'ubicacion') {
            return JSON.stringify({ ubicacion: location });
        }
        return JSON.stringify({
            id: code,
            descripcion: description,
            cantidad: quantity,
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Selector Producto / Ubicación */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, activeTab === 'producto' && styles.toggleBtnActive]}
                        onPress={() => setActiveTab('producto')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'producto' && styles.toggleTextActive]}>
                            Producto
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleBtn, activeTab === 'ubicacion' && styles.toggleBtnActive]}
                        onPress={() => setActiveTab('ubicacion')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'ubicacion' && styles.toggleTextActive]}>
                            Ubicación
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Visor / Botón de la cámara */}
                <TouchableOpacity style={styles.cameraBox} onPress={handleOpenScanner} activeOpacity={0.85}>
                    <Ionicons name="camera-outline" size={48} color="#00C853" />
                    <Text style={styles.cameraBoxText}>Toca para abrir la cámara y escanear</Text>
                </TouchableOpacity>

                {/* Formulario */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>código:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Escanea o escribe código"
                        placeholderTextColor="#888888"
                        value={code}
                        onChangeText={setCode}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>descripción:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Descripción del ítem"
                        placeholderTextColor="#888888"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {activeTab === 'producto' && (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>cantidad:</Text>
                        <TextInput
                            style={[styles.input, styles.shortInput]}
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={setQuantity}
                        />
                    </View>
                )}

                <View style={styles.formGroup}>
                    <Text style={styles.label}>ubicación:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="PASILLO X - ANAQUEL Y - NIVEL Z"
                        placeholderTextColor="#888888"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                {/* Botones de Acción */}
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleLink} activeOpacity={0.8}>
                        <Text style={styles.btnPrimaryText}>
                            Vincular {activeTab === 'producto' ? 'Producto' : 'Ubicación'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnSecondary} onPress={handleOpenQrModal} activeOpacity={0.8}>
                        <Ionicons name="qr-code-outline" size={20} color="#000000" style={{ marginRight: 8 }} />
                        <Text style={styles.btnSecondaryText}>Generar Código QR</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* ================= MODAL CÁMARA ================= */}
            <Modal visible={isScanning} animationType="slide" transparent={false}>
                <SafeAreaView style={styles.fullModal}>
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
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsScanning(false)}>
                                <Ionicons name="close" size={30} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </SafeAreaView>
            </Modal>

            {/* ================= MODAL GENERADOR DE QR ================= */}
            <Modal visible={showQrModal} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.qrModalCard}>
                        <Text style={styles.qrModalTitle}>
                            Etiqueta QR - {activeTab === 'producto' ? 'Producto' : 'Ubicación'}
                        </Text>

                        <View style={styles.qrContainer}>
                            <QRCode
                                value={getQrValue()}
                                size={180}
                                color="#000000"
                                backgroundColor="#FFFFFF"
                            />
                        </View>

                        {/* Vista condicional según pestaña activa */}
                        {activeTab === 'producto' ? (
                            <>
                                <Text style={styles.qrCodeText}>ID: {code.toUpperCase()}</Text>
                                {description !== '' && <Text style={styles.qrDescText}>{description}</Text>}
                                <Text style={styles.qrQtyText}>Cantidad: {quantity}</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.qrCodeText}>UBICACIÓN</Text>
                                <Text style={styles.qrDescText}>{location.toUpperCase()}</Text>
                            </>
                        )}

                        <TouchableOpacity style={styles.btnCloseQr} onPress={() => setShowQrModal(false)}>
                            <Text style={styles.btnCloseQrText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        padding: 4,
        marginBottom: 16,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: '#00C853',
    },
    toggleText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#555555',
    },
    toggleTextActive: {
        color: '#FFFFFF',
    },
    cameraBox: {
        height: 160,
        backgroundColor: '#000000',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: '#000000',
    },
    cameraBoxText: {
        color: '#FFFFFF',
        marginTop: 8,
        fontSize: 13,
        fontWeight: '500',
    },
    formGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    label: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000000',
        width: '30%',
    },
    input: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#FFFFFF',
        color: '#000000',
    },
    shortInput: {
        flex: 0.3,
    },
    buttonGroup: {
        marginTop: 15,
        alignItems: 'center',
    },
    btnPrimary: {
        backgroundColor: '#00C853',
        width: '100%',
        height: 48,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    btnPrimaryText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    btnSecondary: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        height: 46,
        borderRadius: 23,
        borderWidth: 1.5,
        borderColor: '#000000',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnSecondaryText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000000',
    },

    /* Modales */
    fullModal: {
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
    },
    closeBtn: {
        position: 'absolute',
        top: 30,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 25,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    qrModalCard: {
        backgroundColor: '#FFFFFF',
        width: '90%',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
    },
    qrModalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 15,
    },
    qrContainer: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    qrCodeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginTop: 12,
    },
    qrDescText: {
        fontSize: 14,
        color: '#555555',
        marginTop: 4,
        textAlign: 'center',
    },
    qrQtyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#00C853',
        marginTop: 4,
    },
    btnCloseQr: {
        marginTop: 20,
        backgroundColor: '#00C853',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#000000',
    },
    btnCloseQrText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000000',
    },
});