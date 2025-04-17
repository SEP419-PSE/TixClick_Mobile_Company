import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import RenderHTML from 'react-native-render-html';

export default function MyDetailEventActivity() {
  const [eventData, setEventData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { eventId, status } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const router = useRouter();

  // Hàm kiểm tra sự kiện đang diễn ra hay không
  const isEventOngoing = (status) => {
    return status === 'Đang diễn ra'; // Kiểm tra nếu status là 'Đang diễn ra'
  };

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const eventResponse = await fetch(`https://tixclick.site/api/event/${eventId}`);
        const eventJson = await eventResponse.json();
        setEventData(eventJson.result);

        if (eventJson.result?.companyId) {
          const companyResponse = await fetch(`https://tixclick.site/api/company/${eventJson.result.companyId}`);
          const companyJson = await companyResponse.json();
          setCompanyData(companyJson.result);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF8A00" />
      </View>
    );
  }

  if (!eventData || !companyData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Dữ liệu không có sẵn</Text>
      </View>
    );
  }

  const descriptionHtml = String(eventData.description || '').trim();

  return (
    <ScrollView style={{ backgroundColor: '#121212', padding: 16 }}>
      {/* Banner */}
      {eventData.bannerURL && (
        <Image
          source={{ uri: eventData.bannerURL }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 16,
            marginBottom: 16,
            resizeMode: 'cover',
          }}
        />
      )}

      {/* QR Scan Button */}
      {isEventOngoing(status) && ( // Chỉ hiển thị khi sự kiện đang diễn ra
        <TouchableOpacity
          onPress={() => router.push(`/screens/ScanQr`)}
          style={{
            backgroundColor: '#FF8A00',
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: 'center',
            marginBottom: 16,
            shadowColor: '#FF8A00',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
            elevation: 5,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Quét Mã QR</Text>
        </TouchableOpacity>
      )}

      {/* Event Card */}
      <View
        style={{
          backgroundColor: '#1E1E1E',
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF8A00' }}>
          {eventData.eventName}
        </Text>

        {eventData.logoURL && (
          <Image
            source={{ uri: eventData.logoURL }}
            style={{
              width: 120,
              height: 160,
              borderRadius: 12,
              marginVertical: 12,
              alignSelf: 'center',
              resizeMode: 'contain',
            }}
          />
        )}

        <View style={{ marginTop: 10 }}>
          {descriptionHtml ? (
            <RenderHTML
              contentWidth={width}
              source={{ html: descriptionHtml }}
              baseStyle={{ color: 'white', fontSize: 16, lineHeight: 24 }}
            />
          ) : (
            <Text style={{ color: 'gray' }}>Không có mô tả sự kiện</Text>
          )}
        </View>
      </View>

      {/* Company Card */}
      <View
        style={{
          backgroundColor: '#1E1E1E',
          borderRadius: 16,
          padding: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FF8A00' }}>
          Đơn vị tổ chức: {companyData.companyName}
        </Text>

        {companyData.logoURL && (
          <Image
            source={{ uri: companyData.logoURL }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 12,
              marginVertical: 12,
              alignSelf: 'center',
            }}
          />
        )}

        <Text style={{ color: 'white', marginBottom: 8 }}>
          {companyData.description || 'Không có mô tả công ty'}
        </Text>

        <Text style={{ color: 'white', marginVertical: 4 }}>
          Liên hệ: {companyData.customAccount?.firstName} {companyData.customAccount?.lastName}
        </Text>
        <Text style={{ color: 'white' }}>
          Email: {companyData.customAccount?.email}
        </Text>
      </View>
    </ScrollView>
  );
}
