import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

export default function OnboardingScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>🛡️</Text>
                <Text style={styles.title}>MDTL</Text>
                <Text style={styles.subtitle}>Majdoor Digital Trust-Ledger · मजदूर डिजिटल ट्रस्ट-लेजर</Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🪪</Text>
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Digital Identity · डिजिटल पहचान</Text>
                        <Text style={styles.featureDesc}>Create your decentralized ID — you own your data · अपनी विकेन्द्रीकृत ID बनाएं</Text>
                    </View>
                </View>

                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>📄</Text>
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Work Credentials · कार्य प्रमाणपत्र</Text>
                        <Text style={styles.featureDesc}>Store verified proof of your work history · अपने कार्य इतिहास का सत्यापित प्रमाण संग्रहित करें</Text>
                    </View>
                </View>

                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🔒</Text>
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Privacy First · गोपनीयता सर्वप्रथम</Text>
                        <Text style={styles.featureDesc}>Prove your skills without revealing personal data · निजी डेटा बिना कौशल साबित करें</Text>
                    </View>
                </View>

                <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🏦</Text>
                    <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>Financial Access · वित्तीय पहुंच</Text>
                        <Text style={styles.featureDesc}>Access banking and loans with verified credentials · सत्यापित प्रमाणपत्रों से बैंकिंग और ऋण प्राप्त करें</Text>
                    </View>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('CreateWallet')}
                >
                    <Text style={styles.primaryButtonText}>Create New Wallet · नया वॉलेट बनाएं</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('CreateWallet')}
                >
                    <Text style={styles.secondaryButtonText}>Recover Existing Wallet · मौजूदा वॉलेट पुनर्प्राप्त करें</Text>
                </TouchableOpacity>
            </View>

            {/* Language selector hint */}
            <Text style={styles.languageHint}>🌐 हिंदी | English | বাংলা | தமிழ்</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F8',
        paddingHorizontal: 24,
        paddingTop: 60,
        justifyContent: 'space-between',
        paddingBottom: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        fontSize: 64,
        marginBottom: 12,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#6366F1',
        letterSpacing: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 6,
        letterSpacing: 1,
    },
    features: {
        flex: 1,
        justifyContent: 'center',
        gap: 18,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#6366F1',
    },
    featureIcon: {
        fontSize: 30,
        marginRight: 14,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 3,
    },
    featureDesc: {
        color: '#475569',
        fontSize: 13,
        lineHeight: 18,
    },
    actions: {
        gap: 12,
        marginTop: 20,
    },
    primaryButton: {
        backgroundColor: '#6366F1',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#6366F1',
        fontSize: 16,
        fontWeight: '600',
    },
    languageHint: {
        textAlign: 'center',
        color: '#94A3B8',
        marginTop: 14,
        fontSize: 12,
    },
});
