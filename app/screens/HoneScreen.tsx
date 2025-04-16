import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Home() {
  const router = useRouter(); // Khởi tạo router

 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Tixclick</Text>
      
      {/* Nút để chuyển hướng đến trang đăng nhập */}
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/screens/LoginScreen')}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Nút để chuyển hướng đến trang quét QR */}
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/screens/ScanQr')}>
        <Text style={styles.buttonText}>Go to QR</Text>
      </TouchableOpacity>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
