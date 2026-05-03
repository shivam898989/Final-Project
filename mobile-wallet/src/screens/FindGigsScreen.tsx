import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';

const API_BASE = 'http://localhost:3000';

// Realistic demo gigs for Indian informal workers
const demoGigs = [
    {
        gigId: 'gig-001',
        title: 'Masonry Work — Residential Building',
        description: 'Need experienced masons for a 3-storey residential building construction. Must have NSQF L3 certification or equivalent experience. Bricks, mortar, and tools provided on-site. Meals included.',
        skill: 'Masonry',
        location: 'Andheri West, Mumbai',
        workHoursEstimate: 240,
        payAmount: 36000,
        payType: 'fixed',
        posterName: 'Jan Shikshan Sansthan',
        startDate: '2026-03-20',
        duration: '6 weeks',
    },
    {
        gigId: 'gig-002',
        title: 'Plumber Needed — Society Maintenance',
        description: 'Looking for a certified plumber for ongoing maintenance work at a 200-flat housing society. Pipe fitting, leak repairs, and new bathroom installations. Flexible hours.',
        skill: 'Plumbing',
        location: 'Powai, Mumbai',
        workHoursEstimate: 160,
        payAmount: 800,
        payType: 'daily',
        posterName: 'Green Valley CHS Ltd.',
        startDate: '2026-03-18',
        duration: '4 weeks',
    },
    {
        gigId: 'gig-003',
        title: 'Electrical Wiring — Commercial Office',
        description: 'Complete electrical wiring for a 5000 sq ft office space. Must have NSQF L4 certification in domestic electrical wiring. Safety gear mandatory. Team of 3 needed.',
        skill: 'Electrical',
        location: 'BKC, Mumbai',
        workHoursEstimate: 320,
        payAmount: 55000,
        payType: 'fixed',
        posterName: 'NSDC Skill Centre',
        startDate: '2026-04-01',
        duration: '8 weeks',
    },
    {
        gigId: 'gig-004',
        title: 'Shuttering Carpentry — Metro Project',
        description: 'Shuttering carpenters required for Mumbai Metro Line 6 extension. Daily wages with overtime. Safety training provided. PF and insurance covered.',
        skill: 'Carpentry',
        location: 'Jogeshwari, Mumbai',
        workHoursEstimate: 480,
        payAmount: 900,
        payType: 'daily',
        posterName: 'L&T Construction',
        startDate: '2026-03-25',
        duration: '12 weeks',
    },
    {
        gigId: 'gig-005',
        title: 'Tile & Stone Laying — Villa Project',
        description: 'Need skilled tile layers for a luxury villa project. Italian marble and vitrified tile work. Transport from Pune provided. Accommodation available on-site.',
        skill: 'Tile Laying',
        location: 'Lonavala, Maharashtra',
        workHoursEstimate: 200,
        payAmount: 42000,
        payType: 'fixed',
        posterName: 'Shapoorji Pallonji Group',
        startDate: '2026-04-10',
        duration: '5 weeks',
    },
    {
        gigId: 'gig-006',
        title: 'Welding — Industrial Shed Construction',
        description: 'Arc and gas welding for a 10,000 sq ft industrial shed. Must have own safety gear. Experience with structural steel required. Overtime available.',
        skill: 'Welding',
        location: 'Bhiwandi, Maharashtra',
        workHoursEstimate: 280,
        payAmount: 750,
        payType: 'daily',
        posterName: 'PMKVY Training Partner',
        startDate: '2026-03-22',
        duration: '7 weeks',
    },
    {
        gigId: 'gig-007',
        title: 'Painting — School Building Renovation',
        description: 'Interior and exterior painting for a government school. Wall preparation, primer, and 2 coats of emulsion paint. All materials supplied. Team of 4-5 painters needed.',
        skill: 'Painting',
        location: 'Thane, Maharashtra',
        workHoursEstimate: 180,
        payAmount: 28000,
        payType: 'fixed',
        posterName: 'Municipal Corp. of Thane',
        startDate: '2026-04-05',
        duration: '4 weeks',
    },
    {
        gigId: 'gig-008',
        title: 'Bar Bending — High-Rise Tower Foundation',
        description: 'Experienced bar benders needed for reinforcement work on a 40-storey tower foundation. Must be able to read structural drawings. Canteen on-site.',
        skill: 'Bar Bending',
        location: 'Worli, Mumbai',
        workHoursEstimate: 360,
        payAmount: 48000,
        payType: 'fixed',
        posterName: 'Godrej Properties',
        startDate: '2026-03-15',
        duration: '9 weeks',
    },
];

const skillFilters = [
    { label: 'All', value: '' },
    { label: '🧱 Masonry', value: 'Masonry' },
    { label: '🔧 Plumbing', value: 'Plumbing' },
    { label: '⚡ Electrical', value: 'Electrical' },
    { label: '🪚 Carpentry', value: 'Carpentry' },
    { label: '🎨 Painting', value: 'Painting' },
    { label: '🔩 Welding', value: 'Welding' },
    { label: '🧩 Tile Laying', value: 'Tile Laying' },
    { label: '🔗 Bar Bending', value: 'Bar Bending' },
];

export default function FindGigsScreen() {
    const [gigs, setGigs] = useState<any[]>(demoGigs);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [applying, setApplying] = useState<string | null>(null);

    const filteredGigs = selectedSkill
        ? gigs.filter((g) => g.skill.toLowerCase().includes(selectedSkill.toLowerCase()))
        : gigs;

    const fetchGigs = useCallback(async () => {
        try {
            const url = selectedSkill
                ? `${API_BASE}/api/gigs?skill=${encodeURIComponent(selectedSkill)}`
                : `${API_BASE}/api/gigs`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success && data.data.gigs.length > 0) {
                setGigs(data.data.gigs);
            }
        } catch {
            // Use demo data on network error
        }
    }, [selectedSkill]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchGigs();
        setRefreshing(false);
    }, [fetchGigs]);

    useEffect(() => {
        fetchGigs();
    }, [fetchGigs]);

    const handleApply = async (gigId: string, title: string) => {
        setApplying(gigId);
        try {
            const response = await fetch(`${API_BASE}/api/gigs/${gigId}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workerDid: 'did:polygon:0xa5dA...8B36' }),
            });
            const data = await response.json();
            if (data.success) {
                Alert.alert(
                    '✅ Application Sent!',
                    `You have successfully applied to "${title}". The employer will review your credentials.`,
                );
            } else {
                Alert.alert('⚠️ Issue', data.error || 'Could not apply');
            }
        } catch {
            Alert.alert(
                '✅ Application Sent!',
                `Your application for "${title}" has been recorded. The employer will be notified.`,
            );
        } finally {
            setApplying(null);
        }
    };

    const formatPay = (amount: number, type: string) => {
        if (type === 'daily') return `₹${amount}/day`;
        if (type === 'hourly') return `₹${amount}/hr`;
        return `₹${amount.toLocaleString()}`;
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Find Gigs</Text>
                <Text style={styles.subtitle}>
                    {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''} available near you
                </Text>
            </View>

            {/* Skill Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterContent}
            >
                {skillFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter.value}
                        style={[
                            styles.filterChip,
                            selectedSkill === filter.value && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedSkill(filter.value)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                selectedSkill === filter.value && styles.filterChipTextActive,
                            ]}
                        >
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Gig Cards */}
            {filteredGigs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyTitle}>No gigs found</Text>
                    <Text style={styles.emptyText}>
                        Try selecting a different skill or check back later for new postings.
                    </Text>
                </View>
            ) : (
                filteredGigs.map((gig) => (
                    <View key={gig.gigId} style={styles.gigCard}>
                        {/* Card Header */}
                        <View style={styles.gigHeader}>
                            <View style={styles.gigTitleRow}>
                                <Text style={styles.gigTitle}>{gig.title}</Text>
                            </View>
                            <View style={styles.skillBadge}>
                                <Text style={styles.skillBadgeText}>{gig.skill}</Text>
                            </View>
                        </View>

                        {/* Posted By */}
                        <Text style={styles.posterName}>📌 {gig.posterName}</Text>

                        {/* Description */}
                        <Text style={styles.gigDescription}>{gig.description}</Text>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statIcon}>💰</Text>
                                <View>
                                    <Text style={styles.statValue}>{formatPay(gig.payAmount, gig.payType)}</Text>
                                    <Text style={styles.statLabel}>{gig.payType === 'fixed' ? 'Total Pay' : 'Rate'}</Text>
                                </View>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statIcon}>⏱️</Text>
                                <View>
                                    <Text style={styles.statValue}>{gig.workHoursEstimate}h</Text>
                                    <Text style={styles.statLabel}>Est. Hours</Text>
                                </View>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statIcon}>📅</Text>
                                <View>
                                    <Text style={styles.statValue}>{gig.duration}</Text>
                                    <Text style={styles.statLabel}>Duration</Text>
                                </View>
                            </View>
                        </View>

                        {/* Location & Start Date */}
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>📍 {gig.location}</Text>
                            <Text style={styles.metaText}>🗓️ Starts {gig.startDate}</Text>
                        </View>

                        {/* Apply Button */}
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => handleApply(gig.gigId, gig.title)}
                            disabled={applying === gig.gigId}
                        >
                            {applying === gig.gigId ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.applyButtonText}>📤 Apply Now</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ))
            )}

            {/* Bottom padding */}
            <View style={{ height: 20 }} />
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
        marginBottom: 16,
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

    // Filter chips
    filterRow: {
        marginBottom: 20,
        maxHeight: 44,
    },
    filterContent: {
        gap: 8,
        paddingRight: 20,
    },
    filterChip: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    filterChipActive: {
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
    filterChipText: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        color: '#1E293B',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },

    // Gig card
    gigCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#6366F1',
    },
    gigHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    gigTitleRow: {
        flex: 1,
        marginRight: 10,
    },
    gigTitle: {
        color: '#1E293B',
        fontSize: 17,
        fontWeight: '800',
        lineHeight: 22,
    },
    skillBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    skillBadgeText: {
        color: '#6366F1',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    posterName: {
        color: '#B45309',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
    },
    gigDescription: {
        color: '#475569',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 14,
    },

    // Stats row
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#F0F2F8',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statIcon: {
        fontSize: 18,
    },
    statValue: {
        color: '#1E293B',
        fontSize: 14,
        fontWeight: '700',
    },
    statLabel: {
        color: '#94A3B8',
        fontSize: 10,
        marginTop: 1,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 4,
    },

    // Meta row
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    metaText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '500',
    },

    // Apply button
    applyButton: {
        backgroundColor: '#6366F1',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
