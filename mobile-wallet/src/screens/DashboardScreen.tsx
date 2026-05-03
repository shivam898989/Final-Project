import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const API_BASE = 'http://localhost:3000';

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const [syncing, setSyncing] = useState(false);

    // Worker profile — realistic Indian informal worker
    const workerData = {
        name: 'Ravi Kumar Yadav',
        did: 'did:polygon:0xa5dA...8B36',
        credentialCount: 5,
        totalHours: 1344,
        totalIncome: 210600,
        recentActivity: [
            { type: 'credential', text: 'Masonry credential from Jan Shikshan Sansthan', time: '2h ago' },
            { type: 'proof', text: 'Income proof shared with Mudra Loan Officer, SBI', time: '1d ago' },
            { type: 'credential', text: 'NSQF L3 verified: Shuttering Carpentry', time: '3d ago' },
        ],
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await fetch(`${API_BASE}/health`);
            const data = await response.json();
            if (data.status === 'ok') {
                Alert.alert('✅ Sync Complete', `Connected to ${data.service} v${data.version}`);
            } else {
                Alert.alert('⚠️ Sync Issue', 'Server responded but status is not OK.');
            }
        } catch (error) {
            Alert.alert('❌ Sync Failed', 'Could not connect to the MDTL backend. Make sure the server is running.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Welcome Header */}
            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeEmoji}>👷</Text>
                <View>
                <Text style={styles.welcomeText}>Welcome back · स्वागत है,</Text>
                    <Text style={styles.workerName}>{workerData.name}</Text>
                    <Text style={styles.didText}>{workerData.did}</Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { borderLeftColor: '#6366F1' }]}>
                    <Text style={styles.statNumber}>{workerData.credentialCount}</Text>
                    <Text style={styles.statLabel}>Credentials · प्रमाणपत्र</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: '#6366F1' }]}>
                    <Text style={styles.statNumber}>{workerData.totalHours}</Text>
                    <Text style={styles.statLabel}>Total Hours · कुल घंटे</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: '#f0a500' }]}>
                    <Text style={styles.statNumber}>₹{(workerData.totalIncome / 1000).toFixed(0)}K</Text>
                    <Text style={styles.statLabel}>Verified Income · सत्यापित आय</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: '#00b894' }]}>
                    <Text style={styles.statNumber}>3</Text>
                    <Text style={styles.statLabel}>Proofs Shared · साझा प्रमाण</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions · त्वरित कार्य</Text>
            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ShareProof')}>
                    <Text style={styles.actionIcon}>📤</Text>
                    <Text style={styles.actionText}>Share Proof · प्रमाण भेजें</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Credentials')}>
                    <Text style={styles.actionIcon}>📋</Text>
                    <Text style={styles.actionText}>View Creds · प्रमाणपत्र देखें</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleSync} disabled={syncing}>
                    {syncing ? (
                        <ActivityIndicator color="#6366F1" size="small" style={{ marginBottom: 6 }} />
                    ) : (
                        <Text style={styles.actionIcon}>🔄</Text>
                    )}
                    <Text style={styles.actionText}>{syncing ? 'Syncing...' : 'Sync'}</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Activity */}
            <Text style={styles.sectionTitle}>Recent Activity · हालिया गतिविधि</Text>
            {workerData.recentActivity.map((activity, i) => (
                <View key={i} style={styles.activityItem}>
                    <Text style={styles.activityDot}>
                        {activity.type === 'credential' ? '📄' : '🔐'}
                    </Text>
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>{activity.text}</Text>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                </View>
            ))}

            {/* Network status */}
            <View style={styles.networkBadge}>
                <Text style={styles.networkDot}>●</Text>
                <Text style={styles.networkText}>Connected to Polygon Network</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F8',
    },
    content: {
        padding: 20,
        paddingBottom: 30,
    },
    welcomeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    welcomeEmoji: {
        fontSize: 44,
        marginRight: 14,
    },
    welcomeText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    workerName: {
        color: '#6366F1',
        fontSize: 22,
        fontWeight: '800',
    },
    didText: {
        color: '#818CF8',
        fontSize: 11,
        fontFamily: 'monospace',
        marginTop: 3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        width: '48%',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderLeftWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    statNumber: {
        color: '#1E293B',
        fontSize: 26,
        fontWeight: '800',
    },
    statLabel: {
        color: '#64748B',
        fontSize: 12,
        marginTop: 4,
        letterSpacing: 0.5,
    },
    sectionTitle: {
        color: '#4338CA',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    actionIcon: {
        fontSize: 26,
        marginBottom: 6,
    },
    actionText: {
        color: '#334155',
        fontSize: 12,
        fontWeight: '600',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
    },
    activityDot: {
        fontSize: 20,
        marginRight: 12,
        marginTop: 2,
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        color: '#1E293B',
        fontSize: 14,
        fontWeight: '500',
    },
    activityTime: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 3,
    },
    networkBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingVertical: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 20,
    },
    networkDot: {
        color: '#00b894',
        marginRight: 6,
        fontSize: 10,
    },
    networkText: {
        color: '#64748B',
        fontSize: 12,
    },
});
