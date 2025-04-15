import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { login as loginService } from '../../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login: saveToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const res = await loginService(email, password);

      if (res.success && res.data) {
        console.log('Login success');
        setShowSuccessModal(true); // Show success modal
        setTimeout(() => {
          setShowSuccessModal(false); // Hide the modal after 1 second
          router.replace('/screens/ScanQr');
        }, 1000); // Show modal for 1 second

        await saveToken(res.data.accessToken, res.data.role);
        const storedToken = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role');
        console.log('Stored Token in AsyncStorage:', storedToken);
        console.log('Stored Role in AsyncStorage:', storedRole);
      } else {
        Alert.alert('Đăng nhập thất bại', res.message || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      Alert.alert('Lỗi mạng', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.pexels.com/photos/15036701/pexels-photo-15036701/free-photo-of-a-seagull-is-standing-on-a-ledge-in-front-of-a-christmas-tree.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          backgroundColor: 'rgba(0,0,0,0.4)', // overlay mờ màu đen
        }}
      >
        <Text className="text-2xl font-bold mb-8 text-white">Login</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-black bg-white/80"
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <View className="relative mb-6">
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 pr-12 text-black bg-white/80"
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Text className="text-blue-500">{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          className={`bg-blue-500 py-3 rounded-xl ${loading ? 'opacity-50' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-semibold">Đăng nhập</Text>
          )}
        </TouchableOpacity>

        {/* Success Modal */}
        <Modal
          transparent={true}
          visible={showSuccessModal}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <View
              style={{
                backgroundColor: '#4CAF50',
                padding: 20,
                borderRadius: 10,
                width: '80%',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                Đăng nhập thành công!
              </Text>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
