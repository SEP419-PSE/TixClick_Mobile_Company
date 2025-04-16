import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useState } from 'react';
import { ActivityIndicator, Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Nhớ import
import { MaterialIcons } from '@expo/vector-icons';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  cameraWrapper: {
    width: 300,
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ff8a00',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'white', // Màu xanh đẹp hơn cho button
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    opacity: 0.2, // Độ trong suốt cho button
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalView: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'flex-start', // Căn lề trái
    width: 300, // Đảm bảo modal có độ rộng vừa đủ
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'left', // Căn lề trái cho tất cả các dòng
  },
  closeButton: {
    backgroundColor: '#00FF00',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const { token } = useAuth(); // Đặt ở đầu component

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center' }}>We need your permission to show the camera</Text>
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
        setScanned(false);
        return;
      }

      setLoading(true); // Bắt đầu loading khi gọi API

      try {
        const response = await fetch('https://tixclick.site/api/ticket-purchase/decrypt_qr_code', {
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

            setTicketInfo(ticket);
            setModalVisible(true); // Hiển thị modal

          } else {
            console.error('⚠️ Decryption failed:', json.message);
          }
        } catch (err) {
          console.error('❌ JSON parse error:', text);
        }

      } catch (error) {
        console.error('❌ API error:', error);
        // Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
      }

      setLoading(false); // Kết thúc loading sau khi nhận được phản hồi
      setTimeout(() => setScanned(false), 3000); // Cho phép quét lại
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <TouchableOpacity  onPress={toggleCameraFacing}>
            <MaterialIcons name="flip-camera-ios" size={40} color="#fff" style={{opacity: 20, }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal to show ticket information */}
      {ticketInfo && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>✔ Sự kiện: {ticketInfo.event_name}</Text>
              <Text style={styles.modalText}>🪪 Vé: {ticketInfo.ticket_name}</Text>
              <Text style={styles.modalText}>📍 Khu: {ticketInfo.zone_name}</Text>
              <Text style={styles.modalText}>🪑 Ghế: {ticketInfo.seat_code ?? 'Không có'}</Text>
              <Text style={styles.modalText}>👤 Người đặt: {ticketInfo.account_name}</Text>
              <Text style={styles.modalText}>📧 Email: {ticketInfo.email}</Text>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',

              }}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Hiển thị loading khi đang gọi API */}
      {loading && <Text style={styles.loadingText}>Đang tải thông tin...</Text>}
    </View>
  );
}
