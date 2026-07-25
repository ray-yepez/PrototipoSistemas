import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanMode, setScanMode] = useState<'product' | 'location'>('product');
    const [scanned, setScanned] = useState(false);

    // Estados del Formulario
    const [productCode, setProductCode] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [locationCode, setLocationCode] = useState<string | null>(null);

    // Estados para el QR de Vinculación
    const [showQRModal, setShowQRModal] = useState(false);
    const [linkedPayload, setLinkedPayload] = useState<string>('');

    // 1. Permisos de Cámara
    if (!permission) return <View style={styles.container} />;
    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    Necesitamos acceso a la cámara para escanear inventario
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Helper para formatear texto de Ubicación
    const formatLocationText = (raw: string | any): string => {
        if (typeof raw === 'object' && raw !== null) {
            const { pasillo, anaquel, nivel } = raw;
            if (pasillo && anaquel && nivel) {
                return `PASILLO ${pasillo} - ANAQUEL ${anaquel} - NIVEL ${nivel}`;
            }
        }
        return String(raw).toUpperCase();
    };

    // 2. Procesador del código escaneado (JSON o String)
    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);

        try {
            const parsedData = JSON.parse(data);

            if (scanMode === 'product') {
                // 1. Extraer Código / ID
                const code = parsedData.id || parsedData.sku || parsedData.codigo || parsedData.code || data;
                setProductCode(String(code));

                // 2. Extraer Descripción (evalúa múltiples claves posibles)
                const desc =
                    parsedData.descripcion ||
                    parsedData.description ||
                    parsedData.desc ||
                    parsedData.nombre ||
                    parsedData.name ||
                    parsedData.title ||
                    '';
                setDescription(String(desc));

                // 3. Extraer Cantidad
                const cant = parsedData.cantidad || parsedData.quantity || parsedData.cant || parsedData.qty;
                if (cant !== undefined) {
                    setQuantity(String(cant));
                }

                Alert.alert(
                    'Producto Detectado',
                    `Código: ${code}\nDescripción: ${desc || 'N/A'}\n\n¿Deseas pasar a escanear la ubicación?`,
                    [
                        { text: 'Escanear Ubicación', onPress: () => setScanMode('location') },
                        { text: 'Seguir aquí', style: 'cancel' },
                    ]
                );
            } else {
                const formattedLoc = formatLocationText(parsedData);
                setLocationCode(formattedLoc);
            }
        } catch {
            // Si NO es JSON, intentar parsear si viene separado por guion, coma o barra (ej: "PROD-1001 - Caja de Tornillos")
            if (scanMode === 'product') {
                const parts = data.split(/[-;,|]/).map((p) => p.trim());
                if (parts.length >= 2) {
                    setProductCode(parts[0]);
                    setDescription(parts[1]);
                    if (parts[2] && !isNaN(Number(parts[2]))) {
                        setQuantity(parts[2]);
                    }
                } else {
                    setProductCode(data);
                }
            } else {
                setLocationCode(formatLocationText(data));
            }
        }
    };
    // 3. Acción al Vincular Producto
    const handleLinkProduct = () => {
        if (!productCode || !locationCode) {
            Alert.alert(
                'Faltan Datos',
                'Debes escanear tanto un producto como una ubicación antes de vincular.'
            );
            return;
        }

        // Armamos la estructura de datos vinculada
        const linkData = {
            type: 'LINKED_INVENTORY',
            producto_id: productCode,
            descripcion: description,
            cantidad: parseInt(quantity, 10) || 1,
            ubicacion: locationCode,
            fecha_vinculacion: new Date().toISOString(),
        };

        // Convertimos a JSON para generar el QR
        setLinkedPayload(JSON.stringify(linkData));
        setShowQRModal(true);
    };

    // Limpiar formulario y reiniciar flujo
    const handleFinishProcess = () => {
        setShowQRModal(false);
        setProductCode(null);
        setDescription('');
        setLocationCode(null);
        setQuantity('1');
        setScanMode('product');
        setScanned(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Verde Superior */}
            <View style={styles.header}>
                <Text style={styles.headerCompany}>RZ IMPORT C.A</Text>
                <Text style={styles.headerUser}>usuario</Text>
            </View>

            <View style={styles.content}>
                {/* Selector de Modo (Producto vs Ubicación) */}
                <View style={styles.modeToggleContainer}>
                    <TouchableOpacity
                        style={[styles.modeButton, scanMode === 'product' && styles.modeButtonActive]}
                        onPress={() => {
                            setScanMode('product');
                            setScanned(false);
                        }}
                    >
                        <Text style={[styles.modeText, scanMode === 'product' && styles.modeTextActive]}>
                            Producto
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.modeButton, scanMode === 'location' && styles.modeButtonActive]}
                        onPress={() => {
                            setScanMode('location');
                            setScanned(false);
                        }}
                    >
                        <Text style={[styles.modeText, scanMode === 'location' && styles.modeTextActive]}>
                            Ubicación
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Visor de Cámara para Escáner */}
                <View style={styles.cameraWrapper}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr', 'code128', 'ean13'],
                        }}
                    />
                    {scanned && (
                        <TouchableOpacity style={styles.rescanOverlay} onPress={() => setScanned(false)}>
                            <Text style={styles.rescanText}>Toca para volver a escanear</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Formulario de Confirmación */}
                <View style={styles.formContainer}>
                    {/* Código de Producto */}
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>código:</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={productCode || ''}
                            onChangeText={setProductCode}
                            placeholder="Escanea o escribe código"
                        />
                    </View>

                    {/* Descripción */}
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>descripción:</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Descripción del ítem"
                        />
                    </View>

                    {/* Cantidad */}
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>cantidad:</Text>
                        <TextInput
                            style={[styles.fieldInput, styles.shortInput]}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Ubicación */}
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>ubicación:</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={locationCode || ''}
                            onChangeText={setLocationCode}
                            placeholder="PASILLO X - ANAQUEL Y - NIVEL Z"
                        />
                    </View>
                </View>

                {/* Botón Vincular */}
                <TouchableOpacity style={styles.linkButton} onPress={handleLinkProduct}>
                    <Text style={styles.linkButtonText}>Vincular Producto</Text>
                </TouchableOpacity>
            </View>

            {/* MODAL CON QR DE VINCULACIÓN GENERADO */}
            <Modal visible={showQRModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>¡Vinculación Exitosa!</Text>
                        <Text style={styles.modalSubtitle}>
                            QR generado para la etiqueta de inventario
                        </Text>

                        {/* Renderizado de Código QR */}
                        {linkedPayload !== '' && (
                            <View style={styles.qrContainer}>
                                <QRCode value={linkedPayload} size={180} />
                            </View>
                        )}

                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryTextBold}>{productCode}</Text>
                            <Text style={styles.summaryText}>{description}</Text>
                            <Text style={styles.summaryText}>Cantidad: {quantity}</Text>
                            <Text style={styles.summaryTextLocation}>{locationCode}</Text>
                        </View>

                        <TouchableOpacity style={styles.closeModalButton} onPress={handleFinishProcess}>
                            <Text style={styles.closeModalButtonText}>Finalizar y Limpiar</Text>
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
        paddingHorizontal: 20,
        paddingTop: 15,
        alignItems: 'center',
    },

    /* CONTROLES MODO DE ESCÁNER */
    modeToggleContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
        padding: 3,
    },
    modeButton: {
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    modeButtonActive: {
        backgroundColor: '#00C853',
    },
    modeText: {
        fontWeight: '600',
        color: '#616161',
    },
    modeTextActive: {
        color: '#FFF',
    },

    /* VISOR DE CÁMARA */
    cameraWrapper: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 15,
    },
    rescanOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rescanText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },

    /* FORMULARIO DE DATOS */
    formContainer: {
        width: '100%',
        marginBottom: 15,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    fieldLabel: {
        width: 100,
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
    },
    fieldInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FFF',
        fontSize: 13,
    },
    shortInput: {
        flex: 0.4,
    },

    /* BOTÓN PRINCIPAL */
    linkButton: {
        backgroundColor: '#00C853',
        borderWidth: 1.5,
        borderColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 5,
    },
    linkButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
    },

    /* MODAL Y ETIQUETA QR */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '90%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#616161',
        marginVertical: 4,
        textAlign: 'center',
    },
    qrContainer: {
        marginVertical: 15,
        padding: 12,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
    },
    summaryBox: {
        alignItems: 'center',
        marginBottom: 15,
    },
    summaryTextBold: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#000',
    },
    summaryText: {
        fontSize: 13,
        color: '#424242',
    },
    summaryTextLocation: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1B5E20',
        marginTop: 4,
    },
    closeModalButton: {
        backgroundColor: '#00C853',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
    },
    closeModalButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },

    /* PERMISOS */
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 16,
    },
    permissionButton: {
        backgroundColor: '#00C853',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});