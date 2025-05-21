import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useState } from 'react';
import { ActivityIndicator, Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
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
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    opacity: 0.2,
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
    alignItems: 'flex-start',
    width: 300,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'left',
  },
  errorModalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: 'red',
  },
  closeButton: {
    backgroundColor: '#00FF00',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
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
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
  },
});

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

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
        setErrorMessage('Không có token xác thực. Vui lòng đăng nhập lại.');
        setErrorModalVisible(true);
        setScanned(false);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('https://tixclick.site/api/ticket-purchase/decrypt_qr_code', {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ qrCode: result.data }),
        });

        const text = await response.text();

        try {
          const json = JSON.parse(text);

          if (json.code === 200 && json.result) {
            const ticket = json.result;
            console.log('✅ Decrypted Ticket Info:', ticket);
            setTicketInfo(ticket);
            setModalVisible(true);
          } else {
            setErrorMessage(json.message || 'Không thể giải mã mã QR.');
            setErrorModalVisible(true);
          }
        } catch (err) {
          console.error('❌ JSON parse error:', text);
          setErrorMessage('Dữ liệu trả về không hợp lệ.');
          setErrorModalVisible(true);
        }
      } catch (error) {
        console.error('❌ API error:', error);
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        setErrorModalVisible(true);
      }

      setLoading(false);
      setTimeout(() => setScanned(false), 3000); // Reset scan after 3 seconds
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
          <TouchableOpacity onPress={toggleCameraFacing}>
            <MaterialIcons name="flip-camera-ios" size={40} color="#fff" style={{ opacity: 0.8 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scanner readiness status */}
      <Text style={styles.statusText}>
        {scanned ? 'Đang xử lý, vui lòng chờ...' : 'Sẵn sàng quét mã QR'}
      </Text>

      {/* Loading indicator */}
      {loading && <Text style={styles.loadingText}>Đang tải thông tin...</Text>}

      {/* Ticket info modal */}
      {ticketInfo && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>✔ Sự kiện: {ticketInfo.eventName}</Text>
              <Text style={styles.modalText}>👤 Người đặt: {ticketInfo.fullName}</Text>
              <Text style={styles.modalText}>📧 Mã đơn: {ticketInfo.orderCode}</Text>
              {ticketInfo.ticketDetails && ticketInfo.ticketDetails.length > 0 && (
                <>
                  <Text style={[styles.modalText, { fontWeight: 'bold', marginTop: 10 }]}>Danh sách vé:</Text>
                  {ticketInfo.ticketDetails.map((ticket: any, index: number) => (
                    <View key={ticket.ticketPurchaseId} style={{ marginLeft: 10 }}>
                      <Text style={styles.modalText}>🪪 Vé {index + 1}: {ticket.ticketType ?? 'Không có'}</Text>
                      <Text style={styles.modalText}>📍 Khu: {ticket.zoneName ?? 'Không có'}</Text>
                      <Text style={styles.modalText}>🪑 Ghế: {ticket.seatName ?? 'Không có'}</Text>
                    </View>
                  ))}
                </>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Error modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={styles.modalView}>
            <Text style={styles.errorModalText}>❌ Lỗi: {errorMessage}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setErrorModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}