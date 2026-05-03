import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';

const demoCredentials = [
    {
        id: '1',
        skill: 'Construction — Masonry (NSQF L3)',
        issuer: 'Jan Shikshan Sansthan, Mumbai',
        workHours: 312,
        income: 46800,
        period: 'Oct 2025 — Mar 2026',
        status: 'active',
        issuedAt: '2026-03-01',
    },
    {
        id: '2',
        skill: 'Plumbing & Sanitation (NSQF L2)',
        issuer: 'PMKVY Training Partner — SkillSonics',
        workHours: 192,
        income: 28800,
        period: 'Jul 2025 — Sep 2025',
        status: 'active',
        issuedAt: '2025-09-30',
    },
    {
        id: '3',
        skill: 'Electrical Wiring — Domestic (NSQF L4)',
        issuer: 'NSDC Skill Centre, Noida Sec-62',
        workHours: 480,
        income: 72000,
        period: 'Jan 2025 — Jun 2025',
        status: 'active',
        issuedAt: '2025-06-30',
    },
    {
        id: '4',
        skill: 'Shuttering Carpentry',
        issuer: 'L&T Construction — Site Supervisor',
        workHours: 216,
        income: 37800,
        period: 'Aug 2025 — Nov 2025',
        status: 'active',
        issuedAt: '2025-11-15',
    },
    {
        id: '5',
        skill: 'Bar Bending & Reinforcement',
        issuer: 'Shapoorji Pallonji — Dharavi Redevelopment',
        workHours: 144,
        income: 25200,
        period: 'Mar 2025 — May 2025',
        status: 'expired',
        issuedAt: '2025-05-15',
    },
];

export default function CredentialListScreen() {
    const statusColors: Record<string, string> = {
        active: '#00b894',
        expired: '#f0a500',
        revoked: '#6366F1',
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>My Credentials</Text>
                <Text style={styles.subtitle}>{demoCredentials.length} verified work records</Text>
            </View>

            {demoCredentials.map((cred) => (
                <TouchableOpacity key={cred.id} style={styles.credCard}>
                    <View style={styles.credHeader}>
                        <Text style={styles.credSkill}>{cred.skill}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors[cred.status] + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColors[cred.status] }]}>
                                {cred.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.credIssuer}>Issued by: {cred.issuer}</Text>
                    <Text style={styles.credPeriod}>📅 {cred.period}</Text>

                    <View style={styles.credStats}>
                        <View style={styles.credStatItem}>
                            <Text style={styles.credStatValue}>{cred.workHours}h</Text>
                            <Text style={styles.credStatLabel}>Hours</Text>
                        </View>
                        <View style={styles.credStatDivider} />
                        <View style={styles.credStatItem}>
                            <Text style={styles.credStatValue}>₹{cred.income.toLocaleString()}</Text>
                            <Text style={styles.credStatLabel}>Income</Text>
                        </View>
                        <View style={styles.credStatDivider} />
                        <View style={styles.credStatItem}>
                            <Text style={styles.credStatValue}>🔗</Text>
                            <Text style={styles.credStatLabel}>On-chain</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
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
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
    },
    subtitle: {
        color: '#94A3B8',
        fontSize: 13,
        marginTop: 4,
    },
    credCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#6366F1',
    },
    credHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    credSkill: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    credIssuer: {
        color: '#6366F1',
        fontSize: 13,
        marginBottom: 4,
    },
    credPeriod: {
        color: '#94A3B8',
        fontSize: 12,
        marginBottom: 12,
    },
    credStats: {
        flexDirection: 'row',
        backgroundColor: '#F0F2F8',
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
    },
    credStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    credStatValue: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '700',
    },
    credStatLabel: {
        color: '#94A3B8',
        fontSize: 11,
        marginTop: 3,
    },
    credStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E2E8F0',
    },
});
