import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

export default function MyCompany() {
  const router = useRouter();
  const { userName } = useLocalSearchParams();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!userName) return;

      try {
        const encodedUserName = encodeURIComponent(userName as string);
        const response = await axios.get(`https://tixclick.site/api/company/get-companys-by-user-name/${encodedUserName}`);
        if (response.data.code === 200) {
          setCompanies(response.data.result);
        } else {
          setCompanies([]);
        }
      } catch (error) {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [userName]);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Công ty của tôi</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFA500" />
          <Text style={styles.loadingText}>Đang tải công ty...</Text>
        </View>
      ) : companies.length === 0 ? (
        <View style={styles.noCompanyBox}>
          <Text style={styles.noCompanyText}>Bạn chưa có công ty nào được đăng ký.</Text>
        </View>
      ) : (
        <ScrollView style={{ width: '100%' }}>
          {companies.map((company, index) => (
            <View key={index} style={styles.companyCard}>
              <Image source={{ uri: company.logoURL }} style={styles.logo} />
              <Text style={styles.companyName}>{company.companyName}</Text>
              <Text style={styles.info}>🏢 Địa chỉ: <Text style={styles.value}>{company.address}</Text></Text>
              <Text style={styles.info}>👤 Đại diện: <Text style={styles.value}>{company.representativeId}</Text></Text>
              <Text style={styles.info}>⭐ Vai trò: <Text style={styles.value}>{company.subRole}</Text></Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#FFA500',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#CCCCCC',
  },
  companyCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#FFA500',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 275,
    height: 275,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 4,
  },
  value: {
    color: '#ffffff',
    fontWeight: '500',
  },
  noCompanyBox: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCompanyText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontStyle: 'italic',
  },
});
