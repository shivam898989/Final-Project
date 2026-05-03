import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const API_BASE = 'http://localhost:3000';

export default function ShareProofScreen() {
    const [selectedType, setSelectedType] = useState<string>('income');
    const [threshold, setThreshold] = useState('10000');
    const [proofGenerated, setProofGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [proofData, setProofData] = useState<any>(null);

    const proofTypes = [
        { id: 'income', label: 'Income Proof', icon: '💰', desc: 'Prove income above threshold' },
        { id: 'workHours', label: 'Work Hours', icon: '⏱️', desc: 'Prove hours worked above minimum' },
        { id: 'trustedIssuer', label: 'Trusted Issuer', icon: '✅', desc: 'Prove credential from trusted source' },
    ];

    const generateProof = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/proofs/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proofType: selectedType,
                    publicInputs: selectedType === 'income'
                        ? { threshold: Number(threshold) }
                        : selectedType === 'workHours'
                            ? { minHours: Number(threshold) }
                            : { trustedIssuersRoot: '0x' + 'ab'.repeat(32) },
                    privateInputs: selectedType === 'income'
                        ? { income: Number(threshold) + Math.floor(Math.random() * 5000) }
                        : selectedType === 'workHours'
                            ? { workHours: Number(threshold) + Math.floor(Math.random() * 100) }
                            : { issuerHash: '0x' + 'cd'.repeat(32), pathElements: [], pathIndices: [] },
                    workerDid: 'did:polygon:0x1234...5678',
                }),
            });

            const result = await response.json();

            if (result.success) {
                const qrPayload = JSON.stringify({
                    proofId: result.data.proofId,
                    proofType: selectedType,
                    publicSignals: result.data.publicSignals,
                    proof: result.data.proof,
                });

                setProofData({
                    proofId: result.data.proofId,
                    proofType: selectedType,
                    publicSignals: result.data.publicSignals,
                    generationTimeMs: result.data.generationTimeMs,
                    qrData: qrPayload,
                });
                setProofGenerated(true);
            } else {
                Alert.alert('Error', result.error || 'Failed to generate proof');
            }
        } catch (error) {
            Alert.alert('Connection Error', 'Could not connect to the MDTL backend. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const resetProof = () => {
        setProofGenerated(false);
        setProofData(null);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Share Zero-Knowledge Proof</Text>
            <Text style={styles.subtitle}>
                Prove your credentials without revealing personal data
            </Text>

            {/* Proof Type Selection */}
            <Text style={styles.sectionLabel}>Select Proof Type</Text>
            {proofTypes.map((type) => (
                <TouchableOpacity
                    key={type.id}
                    style={[styles.typeCard, selectedType === type.id && styles.typeCardSelected]}
                    onPress={() => { setSelectedType(type.id); resetProof(); }}
                >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <View style={styles.typeInfo}>
                        <Text style={styles.typeLabel}>{type.label}</Text>
                        <Text style={styles.typeDesc}>{type.desc}</Text>
                    </View>
                    {selectedType === type.id && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
            ))}

            {/* Threshold Input */}
            <Text style={styles.sectionLabel}>
                {selectedType === 'income' ? 'Minimum Income (₹)' :
                    selectedType === 'workHours' ? 'Minimum Hours' : 'Issuer Root Hash'}
            </Text>
            <TextInput
                style={styles.input}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
                placeholderTextColor="#555"
                placeholder="Enter threshold value"
            />

            {/* Generate Button */}
            {!proofGenerated && (
                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateProof}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.generateButtonText}>  Generating ZK Proof...</Text>
                        </View>
                    ) : (
                        <Text style={styles.generateButtonText}>🔐 Generate Proof</Text>
                    )}
                </TouchableOpacity>
            )}

            {/* Proof Result */}
            {proofGenerated && proofData && (
                <View style={styles.proofResult}>
                    <Text style={styles.proofResultTitle}>✅ Proof Generated!</Text>

                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={proofData.qrData}
                                size={180}
                                color="#1E293B"
                                backgroundColor="#ffffff"
                            />
                        </View>
                        <Text style={styles.qrScanLabel}>Scan to verify proof</Text>
                    </View>

                    <View style={styles.proofDetails}>
                        <View style={styles.proofDetailRow}>
                            <Text style={styles.proofDetailLabel}>Proof ID</Text>
                            <Text style={styles.proofDetailValue}>{proofData.proofId}</Text>
                        </View>
                        <View style={styles.proofDetailRow}>
                            <Text style={styles.proofDetailLabel}>Type</Text>
                            <Text style={styles.proofDetailValue}>{proofData.proofType}</Text>
                        </View>
                        <View style={styles.proofDetailRow}>
                            <Text style={styles.proofDetailLabel}>Generated in</Text>
                            <Text style={styles.proofDetailValue}>{proofData.generationTimeMs}ms</Text>
                        </View>
                        <View style={styles.proofDetailRow}>
                            <Text style={styles.proofDetailLabel}>Data revealed</Text>
                            <Text style={[styles.proofDetailValue, { color: '#00b894' }]}>NONE ✓</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.newProofButton} onPress={resetProof}>
                        <Text style={styles.newProofButtonText}>Generate New Proof</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F8' },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    subtitle: { color: '#94A3B8', fontSize: 13, marginBottom: 20 },
    sectionLabel: {
        color: '#6366F1', fontSize: 13, fontWeight: '700',
        marginBottom: 8, marginTop: 12, letterSpacing: 0.5,
    },
    typeCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF', borderRadius: 12,
        padding: 14, marginBottom: 8,
        borderWidth: 1.5, borderColor: 'transparent',
    },
    typeCardSelected: { borderColor: '#6366F1' },
    typeIcon: { fontSize: 28, marginRight: 12 },
    typeInfo: { flex: 1 },
    typeLabel: { color: '#1E293B', fontSize: 15, fontWeight: '700' },
    typeDesc: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
    checkmark: { color: '#6366F1', fontSize: 20, fontWeight: '800' },
    input: {
        backgroundColor: '#FFFFFF', borderRadius: 12,
        padding: 14, color: '#1E293B', fontSize: 16,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    generateButton: {
        backgroundColor: '#6366F1', borderRadius: 14,
        paddingVertical: 16, alignItems: 'center', marginTop: 20,
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    generateButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },
    proofResult: { marginTop: 20 },
    proofResultTitle: {
        fontSize: 20, fontWeight: '800', color: '#00b894',
        textAlign: 'center', marginBottom: 16,
    },
    qrContainer: { alignItems: 'center', marginBottom: 16 },
    qrWrapper: {
        padding: 16, backgroundColor: '#FFFFFF',
        borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    },
    qrScanLabel: { color: '#94A3B8', fontSize: 12, marginTop: 10, fontWeight: '600' },
    proofDetails: {
        backgroundColor: '#FFFFFF', borderRadius: 14,
        padding: 16, marginBottom: 16,
    },
    proofDetailRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    },
    proofDetailLabel: { color: '#94A3B8', fontSize: 13 },
    proofDetailValue: { color: '#1E293B', fontSize: 13, fontWeight: '600' },
    newProofButton: {
        borderWidth: 1.5, borderColor: '#E2E8F0',
        borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    },
    newProofButtonText: { color: '#6366F1', fontSize: 15, fontWeight: '600' },
});
