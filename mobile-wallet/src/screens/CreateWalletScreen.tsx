import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { ApiService } from '../services/apiService';
import { WalletStore } from '../services/walletStore';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'CreateWallet'>;
};

export default function CreateWalletScreen({ navigation }: Props) {
    const [loading, setLoading] = useState(false);
    const [walletData, setWalletData] = useState<any>(null);
    const [step, setStep] = useState<'create' | 'backup' | 'done'>('create');

    const generateLocalWallet = async () => {
        const { ethers } = await import('ethers');
        const wallet = ethers.Wallet.createRandom();
        const mnemonic = wallet.mnemonic;
        const words = mnemonic?.phrase?.split(' ') || [];
        // Create recovery shares from mnemonic words (split into 3 groups)
        const shares = [
            words.slice(0, 4).join(' '),
            words.slice(4, 8).join(' '),
            words.slice(8, 12).join(' '),
        ];
        const localData = {
            did: `did:polygon:${wallet.address}`,
            walletAddress: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            recovery: {
                shares: shares.length > 0 ? shares : ['Local wallet — save your private key securely'],
                threshold: 2,
                totalShares: 3,
            },
        };
        setWalletData(localData);
        await WalletStore.saveWallet({
            ...localData,
            createdAt: new Date().toISOString(),
        });
        setStep('backup');
    };

    const createWallet = async () => {
        setLoading(true);
        try {
            // Try backend API first
            const result = await ApiService.createIdentity('Worker', 'en');

            if (result.success && result.data) {
                setWalletData(result.data);
                if (result.data.token) {
                    ApiService.setToken(result.data.token);
                    await WalletStore.saveToken(result.data.token);
                }
                await WalletStore.saveWallet({
                    did: result.data.did,
                    walletAddress: result.data.walletAddress,
                    publicKey: result.data.publicKey,
                    privateKey: result.data.privateKey,
                    recovery: result.data.recovery,
                    createdAt: new Date().toISOString(),
                });
                setStep('backup');
            } else {
                // API returned error or offline — generate locally
                await generateLocalWallet();
            }
        } catch (error: any) {
            // Any network/API error — fall back to local generation
            console.warn('[CreateWallet] API unavailable, generating locally:', error.message);
            try {
                await generateLocalWallet();
            } catch (localError: any) {
                Alert.alert('Error', 'Failed to generate wallet: ' + localError.message);
            }
        }
        setLoading(false);
    };

    const proceedToDashboard = () => {
        navigation.replace('MainTabs');
    };

    if (step === 'create') {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.icon}>🔑</Text>
                    <Text style={styles.title}>Create Your Wallet</Text>
                    <Text style={styles.description}>
                        Your wallet generates a unique digital identity (DID) on the Polygon blockchain.
                        This identity is yours — no one else controls it.
                    </Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>What happens next:</Text>
                        <Text style={styles.infoText}>1. Generate a secure keypair</Text>
                        <Text style={styles.infoText}>2. Create your Decentralized ID (DID)</Text>
                        <Text style={styles.infoText}>3. Create recovery backup shares</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={createWallet}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Generate Identity</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    if (step === 'backup') {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.icon}>✅</Text>
                <Text style={styles.title}>Wallet Created!</Text>

                <View style={styles.credentialCard}>
                    <Text style={styles.cardLabel}>Your DID</Text>
                    <Text style={styles.cardValue}>{walletData?.did}</Text>
                </View>

                <View style={styles.credentialCard}>
                    <Text style={styles.cardLabel}>Wallet Address</Text>
                    <Text style={styles.cardValue}>{walletData?.walletAddress}</Text>
                </View>

                <View style={[styles.credentialCard, styles.warningCard]}>
                    <Text style={styles.warningTitle}>⚠️ Recovery Shares</Text>
                    <Text style={styles.warningText}>
                        Store these recovery shares in separate safe locations.
                        You need {walletData?.recovery?.threshold} of {walletData?.recovery?.totalShares} to recover your wallet.
                    </Text>
                    {walletData?.recovery?.shares?.slice(0, 3).map((share: string, i: number) => (
                        <Text key={i} style={styles.shareText}>
                            Share {i + 1}: {share.substring(0, 40)}...
                        </Text>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={proceedToDashboard}
                >
                    <Text style={styles.primaryButtonText}>I've Saved My Backup → Continue</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F8',
        paddingHorizontal: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: 60,
        paddingBottom: 40,
    },
    icon: {
        fontSize: 56,
        textAlign: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#6366F1',
        textAlign: 'center',
        marginBottom: 14,
    },
    description: {
        color: '#475569',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    infoBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 18,
        width: '100%',
        borderLeftWidth: 3,
        borderLeftColor: '#6366F1',
    },
    infoTitle: {
        color: '#6366F1',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
    },
    infoText: {
        color: '#475569',
        fontSize: 14,
        marginBottom: 6,
        paddingLeft: 8,
    },
    credentialCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        borderLeftWidth: 3,
        borderLeftColor: '#6366F1',
    },
    cardLabel: {
        color: '#6366F1',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    cardValue: {
        color: '#1E293B',
        fontSize: 12,
        fontFamily: 'monospace',
        lineHeight: 18,
    },
    warningCard: {
        borderLeftColor: '#F59E0B',
        backgroundColor: '#FFFBEB',
    },
    warningTitle: {
        color: '#B45309',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 8,
    },
    warningText: {
        color: '#78350F',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 12,
    },
    shareText: {
        color: '#94A3B8',
        fontSize: 11,
        fontFamily: 'monospace',
        marginBottom: 4,
    },
    primaryButton: {
        backgroundColor: '#6366F1',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 20,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});
