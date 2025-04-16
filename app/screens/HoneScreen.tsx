import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        router.replace('/screens/LoginScreen');
        return;
      }

      try {
        const response = await fetch('https://tixclick.site/api/account/my-profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (json.code === 200) {
          setProfile(json.result);
        } else {
          router.replace('/screens/LoginScreen');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        router.replace('/screens/LoginScreen');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={{ marginTop: 10, color: 'white' }}>Đang tải thông tin người dùng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile && (
        <>
          <Image
            source={{ uri: profile.avatarURL }}
            style={styles.avatar}
          />
          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.email}>{profile.email}</Text>
        </>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/screens/MyCompany?userName=${profile?.userName}`)}
      >
        <Text style={styles.buttonText}>Công ty của tôi</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/screens/MyCompany?userName=${profile?.userName}`)}
      >
        <Text style={styles.buttonText}>Sự kiện của tôi</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/screens/LoginScreen')}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
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
    backgroundColor: '#121212',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFA500',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#FF4500',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
