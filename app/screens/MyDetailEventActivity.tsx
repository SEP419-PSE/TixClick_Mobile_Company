import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Stats {
    totalCheckin: number;
    checkedIn: number;
    notCheckedIn: number;
}

export default function EventActivityStats() {
    const router = useRouter();
    const { eventActivityId, date } = useLocalSearchParams();

    const [stats, setStats] = useState<Stats>();
    const [loading, setLoading] = useState(true);

    const fetchCheckinStats = useCallback(async () => {
        console.log("eventActivityId: ", eventActivityId);

        try {
            setLoading(true);
            const response = await axios.get(`https://tixclick.site/api/event/checkin/event-activity/${eventActivityId}`);
            console.log("Response: ", response.data);
            if (response.data.code === 200) {
                setStats(response.data.result);
            } else {
                console.log("Error fetching stats: ", response.data.message);
            }
        } catch (error) {
            console.error("Error calling API: ", error);
        } finally {
            setLoading(false);
        }
    }, [eventActivityId]);

    useFocusEffect(
        useCallback(() => {
            if (eventActivityId) {
                fetchCheckinStats();
            }
        }, [eventActivityId, fetchCheckinStats])
    );

    const handleScanQR = () => {
        router.push('/screens/ScanQr');
    };

    const parsedDate = typeof date === 'string' ? date : '';

    const getStatusByDate = (eventDate: string) => {
        if (!eventDate) return 'Không xác định';

        const today = new Date();
        const [year, month, day] = eventDate.split('-').map(Number);
        const event = new Date(year, month - 1, day);

        if (event > today) return 'Sắp tới';
        if (event.toDateString() === today.toDateString()) return 'Đang diễn ra';
        return 'Đã qua';
    };

    const isToday = (dateStr: string) => {
        if (!dateStr) return false;

        const today = new Date();
        const [year, month, day] = dateStr.split('-').map(Number);
        const compareDate = new Date(year, month - 1, day);

        return today.toDateString() === compareDate.toDateString();
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

    const status = getStatusByDate(parsedDate);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thống kê check-in cho Event Activity</Text>

            <Text style={[styles.statusText, status === 'Đang diễn ra' && styles.statusLive]}>
                Trạng thái: {status}
            </Text>

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

            <TouchableOpacity
                disabled={!isToday(date as string)}
                style={[styles.scanButton, !isToday(date as string) && styles.scanButtonDisabled]}
                onPress={handleScanQR}
            >
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
    statusText: {
        fontSize: 16,
        color: '#CCCCCC',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    statusLive: {
        color: '#00FF99',
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButtonDisabled: {
        backgroundColor: '#555',
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