import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';

import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Icon library

const EventActivityStatus = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedEvents, setExpandedEvents] = useState([]); // NEW
  const router = useRouter();

  interface EventId {
    eventId: number;
  }

  useEffect(() => {
    const fetchEvents = async () => {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://tixclick.site/api/member-activity/my-event-activities', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.code === 200) {
          const updatedEvents = response.data.result.map(event => {
            const updatedActivities = event.eventActivities.map(activity => {
              const activityDate = new Date(`${activity.date}T${activity.startTime}`);
              const endDate = new Date(`${activity.date}T${activity.endTime}`);
              const now = new Date();
              setEvents(response.data.result.eventId); // Lưu eventId vào state

              let status = '';
              if (activityDate < now && endDate < now) {
                status = 'Đã qua';
              } else if (
                activityDate.toDateString() === now.toDateString() &&
                now >= activityDate &&
                now <= endDate
              ) {
                status = 'Đang diễn ra';
              } else if (activityDate > now) {
                status = 'Sắp tới';
              }

              return {
                ...activity,
                status,
                formattedDate: formatDate(activity.date),
              };
            });

            return { ...event, eventActivities: updatedActivities };
          });

          setEvents(updatedEvents);
          setFilteredEvents(updatedEvents);
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
    if (!date || typeof date !== 'string') return '';
    const parts = date.split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  };

  const navigateToDetail = (eventActivityId, date) => {
    router.push({
      pathname: '/screens/MyDetailEventActivity',
      params: {
        eventActivityId,
        date,
      },
    });
  };

  const navigateToDetailEvent = (eventId, status) => {
    router.push({
      pathname: '/screens/MyEventDetail',
      params: {
        eventId,
        status
      },
    });

  }

  const handleFilterChange = (status) => {
    setFilter(status);
    setExpandedEvents([]); // reset khi đổi bộ lọc

    if (status === 'all') {
      setFilteredEvents(events);
    } else {
      const filtered = events
        .map(event => {
          const matchingActivities = event.eventActivities.filter(activity => activity.status === status);
          return matchingActivities.length > 0
            ? { ...event, eventActivities: matchingActivities }
            : null;
        })
        .filter(e => e !== null);

      setFilteredEvents(filtered);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã qua': return '#757575';
      case 'Đang diễn ra': return '#FF8A00';
      case 'Sắp tới': return '#4CAF50';
      default: return '#FFFFFF';
    }
  };

  const toggleExpand = (index) => {
    if (expandedEvents.includes(index)) {
      setExpandedEvents(expandedEvents.filter(i => i !== index));
    } else {
      setExpandedEvents([...expandedEvents, index]);
    }
  };

  const showEventDetails = (eventId, status) => {
    Alert.alert(
      'Thông tin sự kiện',
      'Bạn muốn xem chi tiết sự kiện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xem chi tiết', onPress: () => navigateToDetailEvent(eventId, status) },
      ]
    );
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8A00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['all', 'Đã qua', 'Sắp tới', 'Đang diễn ra'].map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => handleFilterChange(status)}
            style={[styles.filterButton, filter === status && styles.selectedFilter]}
          >
            <Text style={styles.filterText}>{status === 'all' ? 'Tất cả' : status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredEvents.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>Không có sự kiện {filter === 'all' ? '' : `trạng thái "${filter}"`}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {filteredEvents.map((event, index) => (
            <View key={index} style={styles.eventContainer}>
              <TouchableOpacity onPress={() => toggleExpand(index)}>
                <Image source={{ uri: event.url }} style={styles.eventImage} resizeMode="contain" />
                <Text style={styles.eventName}>{event.eventName}</Text>
                {/* Thêm icon ba chấm để hiển thị menu chi tiết */}
                <TouchableOpacity onPress={() => showEventDetails(event.eventId, event.eventActivities[0]?.status)}
                  style={styles.threeDotsIcon}>
                  <Icon name="more-vert" size={30} color="white" />
                </TouchableOpacity>

              </TouchableOpacity>


              {expandedEvents.includes(index) &&
                event.eventActivities.map((activity, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => navigateToDetail(activity.eventActivityId, activity.date)}
                    style={styles.activityContainer}
                  >
                    <Text style={styles.activityName}>{activity.eventActivityName}</Text>
                    <Text style={[styles.activityStatus, { color: getStatusColor(activity.status) }]}>{activity.status}</Text>
                    <Text style={styles.activityDate}>
                      {activity.formattedDate} - {activity.startTime} đến {activity.endTime}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
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
  noEventsContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30,
  },
  noEventsText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    backgroundColor: '#1e1e1e',
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#333333',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#444444',
    marginHorizontal: 5,
    marginBottom: 5,
  },
  selectedFilter: {
    backgroundColor: '#FF8A00',
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
  },
  eventImage: {
    width: '100%',
    aspectRatio: 720 / 958,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#000',
  },
  eventName: {
    fontSize: 22,
    color: '#FF8A00',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activityContainer: {
    marginTop: 10,
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
  threeDotsIcon: {
    position: 'absolute',
    top: 10,
    right: 10,

  },
});

export default EventActivityStatus;
