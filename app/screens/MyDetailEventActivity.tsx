import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router'; // import useRouter and useLocalSearchParams

interface Stats {
    totalCheckin: number,
    checkedIn: number,
    notCheckedIn: number,
}

export default function EventActivityStats() {
    const router = useRouter();
    const { eventActivityId } = useLocalSearchParams(); // Get the eventActivityId from params

    const [stats, setStats] = useState<Stats>();
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchCheckinStats = async () => {

            console.log("eventActivityId: ", eventActivityId); // Log the eventActivityId for debugging

            try {
                const response = await axios.get(`https://tixclick.site/api/event/checkin/event-activity/${eventActivityId}`);
                console.log("Response: ", response.data); // Log the response for debugging
                if (response.data.code === 200) {
                    setStats(response.data.result); // Store entire result object
                } else {
                    console.log("Error fetching stats: ", response.data.message);
                }
            } catch (error) {
                console.error("Error calling API: ", error);
            } finally {
                setLoading(false);
            }
        };

        if (eventActivityId) {
            fetchCheckinStats(); // Fetch stats only if eventActivityId exists
        }
    }, [eventActivityId]);

    const handleScanQR = () => {
        router.push('/screens/ScanQr'); // Navigate to ScanQR screen
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF8A00" />
            </View>
        );
    }

    if (!stats) {
        return (
            <View style={styles.container}>
                <Text style={styles.noStatsText}>Không có thống kê check-in</Text>
            </View>
        );
    }
    console.log(stats)

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thống kê check-in cho Event Activity</Text>

            <View style={styles.dashboardContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statTitle}>Tổng số người phải check-in</Text>
                    <Text style={styles.statValue}>{stats.totalCheckin}</Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={styles.statTitle}>Số người đã check-in</Text>
                    <Text style={styles.statValue}>{stats.checkedIn}</Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={styles.statTitle}>Số người chưa check-in</Text>
                    <Text style={styles.statValue}>{stats.notCheckedIn}</Text>
                </View>

                
            </View>

            <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
                <Text style={styles.scanButtonText}>Quét QR</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    title: {
        fontSize: 22,
        color: '#FF8A00',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    dashboardContainer: {
        marginBottom: 30,
    },
    statItem: {
        backgroundColor: '#1e1e1e',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        alignItems: 'center',
    },
    statTitle: {
        fontSize: 18,
        color: '#FF8A00',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 22,
        color: 'white',
    },
    scanButton: {
        backgroundColor: '#FF8A00',
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
    noStatsText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
    },
});
