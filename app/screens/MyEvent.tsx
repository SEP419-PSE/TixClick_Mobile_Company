import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Button } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Đảm bảo đã cài thư viện này

const EventActivityStatus = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState('all');  // Lọc theo trạng thái: 'all', 'past', 'upcoming', 'ongoing'
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      // Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem('token'); // Đảm bảo key đúng với token bạn lưu trong AsyncStorage

      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://tixclick.site/api/member-activity/my-event-activities', {
          headers: {
            Authorization: `Bearer ${token}` // Thêm token vào header
          }
        });

        if (response.data.code === 200) {
          // Cập nhật dữ liệu sự kiện
          const updatedEvents = response.data.result.map(event => {
            const updatedActivities = event.eventActivities.map(activity => {
              const activityDate = new Date(`${activity.date}T${activity.startTime}`);
              const endDate = new Date(`${activity.date}T${activity.endTime}`);
              let status = '';

              const today = new Date();

              if (activityDate < today) {
                status = 'Đã qua';
              } else if (activityDate.toDateString() === today.toDateString() && today >= activityDate && today <= endDate) {
                status = 'Đang diễn ra';
              } else if (activityDate > today) {
                status = 'Sắp tới';
              }

              return { ...activity, status, formattedDate: formatDate(activity.date) };
            });

            return { ...event, eventActivities: updatedActivities };
          });

          setEvents(updatedEvents);
          setFilteredEvents(updatedEvents); // Show all events initially
        } else {
          console.log("Error fetching events: ", response.data.message);
        }
      } catch (error) {
        console.error("Error calling API: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;  // Đổi định dạng yyyy-mm-dd thành dd-mm-yyyy
  };

  const navigateToDetail = (eventActivityId) => {
    // Chuyển hướng đến trang chi tiết với eventActivityId
    router.push(`/screens/MyDetailEventActivity?eventActivityId=${eventActivityId}`);
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    if (status === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event =>
        event.eventActivities.some(activity => activity.status === status)
      ));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A00" />
      </View>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noEventsText}>Không có sự kiện</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => handleFilterChange('all')} style={[styles.filterButton, filter === 'all' && styles.selectedFilter]}>
          <Text style={styles.filterText}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange('Đã qua')} style={[styles.filterButton, filter === 'Đã qua' && styles.selectedFilter]}>
          <Text style={styles.filterText}>Đã qua</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange('Sắp tới')} style={[styles.filterButton, filter === 'Sắp tới' && styles.selectedFilter]}>
          <Text style={styles.filterText}>Sắp tới</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange('Đang diễn ra')} style={[styles.filterButton, filter === 'Đang diễn ra' && styles.selectedFilter]}>
          <Text style={styles.filterText}>Đang diễn ra</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredEvents.map((event, index) => (
          <View key={index} style={styles.eventContainer}>
            <Image source={{ uri: event.url }} style={styles.eventImage} />
            <Text style={styles.eventName}>{event.eventName}</Text>
            {event.eventActivities.map((activity, idx) => (
              <TouchableOpacity key={idx} onPress={() => navigateToDetail(activity.eventActivityId)} style={styles.activityContainer}>
                <Text style={styles.activityName}>{activity.eventActivityName}</Text>
                <Text style={[styles.activityStatus, { color: getStatusColor(activity.status) }]}>{activity.status}</Text>
                <Text style={styles.activityDate}>{activity.formattedDate} - {activity.startTime} to {activity.endTime}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Đã qua':
      return '#757575'; // Màu xám cho đã qua
    case 'Đang diễn ra':
      return '#FF8A00'; // Màu cam cho đang diễn ra
    case 'Sắp tới':
      return '#4CAF50'; // Màu xanh lá cho sắp tới
    default:
      return '#FFFFFF'; // Mặc định là trắng
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  noEventsText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  filterContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 10,
    backgroundColor: '#1e1e1e',
    paddingVertical: 10,
    zIndex: 1,  // Đảm bảo filter luôn nằm trên nội dung
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#333333',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#444444',
  },
  selectedFilter: {
    backgroundColor: '#FF8A00', // Màu cam khi chọn
    borderColor: '#FF8A00',
  },
  filterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  eventContainer: {
    marginBottom: 20,
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 250, // Kích thước của ảnh thu nhỏ
    borderRadius: 10,
    marginBottom: 12,
  },
  eventName: {
    fontSize: 22,
    color: '#FF8A00',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activityContainer: {
    marginBottom: 16,
    backgroundColor: '#333333',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444444',
  },
  activityName: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  activityStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  activityDate: {
    fontSize: 14,
    color: '#C7C7C7',
  },
});

export default EventActivityStatus;
