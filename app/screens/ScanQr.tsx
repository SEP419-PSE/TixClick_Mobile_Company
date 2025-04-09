import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Nhớ import


export default function App() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const { token } = useAuth(); // Đặt ở đầu component

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    };

    const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
        if (!scanned) {
          setScanned(true);
          console.log('📦 QR Data:', result.data);
      
          if (!token) {
            Alert.alert('Lỗi', 'Bạn chưa đăng nhập!');
            setScanned(false);
            return;
          }
      
          try {
            const response = await fetch('http://160.191.175.172:8080/ticket-purchase/decrypt_qr_code', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // ✅ thêm token ở đây
              },
              body: JSON.stringify(result.data),
            });
      
            const text = await response.text(); // Đọc response dạng text
      
            try {
              const json = JSON.parse(text); // Parse JSON thủ công để bắt lỗi định dạng
      
              if (json.code === 200 && json.result) {
                const ticket = json.result;
      
                console.log('✅ Decrypted Ticket Info:', ticket);
      
                Alert.alert(
                  'QR Info',
                  `✔ Sự kiện: ${ticket.event_name}
      🪪 Vé: ${ticket.ticket_name}
      📍 Khu: ${ticket.zone_name}
      🪑 Ghế: ${ticket.seat_code}
      👤 Người đặt: ${ticket.account_name}
      📧 Email: ${ticket.email}`
                );
              } else {
                console.error('⚠️ Decryption failed:', json.message);
                Alert.alert('Lỗi', json.message || 'Không giải mã được QR code');
              }
            } catch (err) {
              console.error('❌ JSON parse error:', text);
              Alert.alert('Lỗi', 'Phản hồi không hợp lệ (không phải JSON)');
            }
      
          } catch (error) {
            console.error('❌ API error:', error);
            Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
          }
      
          setTimeout(() => setScanned(false), 3000); // Cho phép quét lại
        }
      };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <Text style={styles.text}>Flip Camera</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});
