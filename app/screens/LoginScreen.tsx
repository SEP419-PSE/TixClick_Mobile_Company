import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Video } from 'expo-av';
import { login as loginService } from '../../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login: saveToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        Alert.alert('Đăng nhập thành công');
        await saveToken(res.data.accessToken, res.data.role);
        const storedToken = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role');
        console.log('Stored Token in AsyncStorage:', storedToken);
        console.log('Stored Role in AsyncStorage:', storedRole);
        router.replace('/screens/HoneScreen');
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
    <View style={styles.container}>
      <Video
        source={{
          uri: 'https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_30fps.mp4',
        }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="cover" // Video background will cover the screen
        shouldPlay
        isLooping
        style={styles.backgroundVideo}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlayContainer}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Please log in to continue</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Text style={styles.eyeIconText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.button, { opacity: loading ? 0.5 : 1 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay black color
    borderRadius: 20,
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 16,
    color: '#333',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 24,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -20}],
    
    
  },
  eyeIconText: {
    fontSize: 20,
    color: '#007BFF',
    

  },
  button: {
    backgroundColor: '#FF8C00',
    paddingVertical: 14, // Adjust padding to match input size
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16, // Add margin for spacing between button and register link
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerLink: {
    marginTop: 16,
  },
  registerText: {
    color: '#FF8C00',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
