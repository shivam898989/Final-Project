import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';

const demoHistory = [
    {
        id: '1',
        proofType: 'income',
        threshold: '₹10,000',
        verifier: 'SBI Bank — Loan Department',
        result: true,
        date: '2026-03-09',
        time: '14:32',
    },
    {
        id: '2',
        proofType: 'workHours',
        threshold: '100 hours',
        verifier: 'HDFC Microfinance',
        result: true,
        date: '2026-03-05',
        time: '10:15',
    },
    {
        id: '3',
        proofType: 'trustedIssuer',
        threshold: 'BuildCo NGO',
        verifier: 'Govt Welfare Office',
        result: true,
        date: '2026-02-28',
        time: '16:45',
    },
    {
        id: '4',
        proofType: 'income',
        threshold: '₹25,000',
        verifier: 'Axis Bank',
        result: false,
        date: '2026-02-20',
        time: '09:22',
    },
    {
        id: '5',
        proofType: 'workHours',
        threshold: '200 hours',
        verifier: 'Insurance Corp',
        result: true,
        date: '2026-02-15',
        time: '11:00',
    },
];

export default function ProofHistoryScreen() {
    const proofTypeLabels: Record<string, { label: string; icon: string }> = {
        income: { label: 'Income Proof', icon: '💰' },
        workHours: { label: 'Work Hours', icon: '⏱️' },
        trustedIssuer: { label: 'Trusted Issuer', icon: '✅' },
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Proof History</Text>
                <Text style={styles.subtitle}>{demoHistory.length} verifications</Text>
            </View>

            {/* Summary stats */}
            <View style={styles.statsRow}>
                <View style={[styles.statBadge, { backgroundColor: '#00b89420' }]}>
                    <Text style={[styles.statCount, { color: '#00b894' }]}>
                        {demoHistory.filter(h => h.result).length}
                    </Text>
                    <Text style={styles.statLabel}>Verified</Text>
                </View>
                <View style={[styles.statBadge, { backgroundColor: '#6366F120' }]}>
                    <Text style={[styles.statCount, { color: '#6366F1' }]}>
                        {demoHistory.filter(h => !h.result).length}
                    </Text>
                    <Text style={styles.statLabel}>Failed</Text>
                </View>
                <View style={[styles.statBadge, { backgroundColor: '#6366F120' }]}>
                    <Text style={[styles.statCount, { color: '#0f9460' }]}>0</Text>
                    <Text style={styles.statLabel}>Data Leaked</Text>
                </View>
            </View>

            {/* History items */}
            {demoHistory.map((item) => {
                const typeInfo = proofTypeLabels[item.proofType] || { label: item.proofType, icon: '📄' };
                return (
                    <View key={item.id} style={styles.historyItem}>
                        <View style={styles.historyHeader}>
                            <View style={styles.historyTypeRow}>
                                <Text style={styles.historyIcon}>{typeInfo.icon}</Text>
                                <Text style={styles.historyType}>{typeInfo.label}</Text>
                            </View>
                            <View style={[
                                styles.resultBadge,
                                { backgroundColor: item.result ? '#00b89420' : '#6366F120' }
                            ]}>
                                <Text style={[
                                    styles.resultText,
                                    { color: item.result ? '#00b894' : '#6366F1' }
                                ]}>
                                    {item.result ? 'VALID' : 'FAILED'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.historyVerifier}>🏢 {item.verifier}</Text>
                        <Text style={styles.historyThreshold}>Threshold: {item.threshold}</Text>
                        <Text style={styles.historyDate}>📅 {item.date} at {item.time}</Text>

                        <View style={styles.privacyNote}>
                            <Text style={styles.privacyNoteText}>
                                🔒 Zero personal data was shared
                            </Text>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    content: { padding: 20, paddingBottom: 30 },
    header: { marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
    subtitle: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
    statsRow: {
        flexDirection: 'row', gap: 10, marginBottom: 20,
    },
    statBadge: {
        flex: 1, borderRadius: 12, padding: 12, alignItems: 'center',
    },
    statCount: { fontSize: 24, fontWeight: '800' },
    statLabel: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
    historyItem: {
        backgroundColor: '#FFFFFF', borderRadius: 14,
        padding: 16, marginBottom: 10,
    },
    historyHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
    },
    historyTypeRow: { flexDirection: 'row', alignItems: 'center' },
    historyIcon: { fontSize: 20, marginRight: 8 },
    historyType: { color: '#1E293B', fontSize: 15, fontWeight: '700' },
    resultBadge: {
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
    },
    resultText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    historyVerifier: { color: '#475569', fontSize: 13, marginBottom: 3 },
    historyThreshold: { color: '#94A3B8', fontSize: 12, marginBottom: 3 },
    historyDate: { color: '#666', fontSize: 12 },
    privacyNote: {
        marginTop: 8, paddingTop: 8,
        borderTopWidth: 1, borderTopColor: '#E2E8F0',
    },
    privacyNoteText: { color: '#00b894', fontSize: 11 },
});
