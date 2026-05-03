import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { WalletStore } from './src/services/walletStore';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import CreateWalletScreen from './src/screens/CreateWalletScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CredentialListScreen from './src/screens/CredentialListScreen';
import ShareProofScreen from './src/screens/ShareProofScreen';
import ProofHistoryScreen from './src/screens/ProofHistoryScreen';
import FindGigsScreen from './src/screens/FindGigsScreen';
import HelpChatScreen from './src/screens/HelpChatScreen';

export type RootStackParamList = {
    Onboarding: undefined;
    CreateWallet: undefined;
    MainTabs: undefined;
};

export type TabParamList = {
    Dashboard: undefined;
    FindGigs: undefined;
    Credentials: undefined;
    ShareProof: undefined;
    History: undefined;
    HelpChat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
    const icons: Record<string, string> = {
        Dashboard: '🏠',
        'Find Gigs': '💼',
        Credentials: '📄',
        'Share Proof': '🔐',
        History: '📋',
        Help: '❓',
    };
    return (
        <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>
            {icons[label] || '📌'}
        </Text>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
                headerTintColor: '#6366F1',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#E2E8F0',
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 5,
                },
                tabBarActiveTintColor: '#6366F1',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="FindGigs" component={FindGigsScreen} options={{ title: 'Find Gigs' }} />
            <Tab.Screen name="Credentials" component={CredentialListScreen} />
            <Tab.Screen name="ShareProof" component={ShareProofScreen} options={{ title: 'Share Proof' }} />
            <Tab.Screen name="History" component={ProofHistoryScreen} />
            <Tab.Screen name="HelpChat" component={HelpChatScreen} options={{ title: 'Help' }} />
        </Tab.Navigator>
    );
}

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasWallet, setHasWallet] = useState(false);

    useEffect(() => {
        // Check if wallet already exists in AsyncStorage
        WalletStore.hasWallet()
            .then((exists) => {
                setHasWallet(exists);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <View style={splashStyles.container}>
                <Text style={splashStyles.logo}>⛓️</Text>
                <Text style={splashStyles.title}>MDTL</Text>
                <Text style={splashStyles.subtitle}>Majdoor Digital Trust-Ledger</Text>
                <ActivityIndicator color="#6366F1" size="large" style={{ marginTop: 24 }} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator
                initialRouteName={hasWallet ? 'MainTabs' : 'Onboarding'}
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F0F2F8' },
                }}
            >
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
                <Stack.Screen name="MainTabs" component={MainTabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const splashStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: { fontSize: 64, marginBottom: 12 },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#6366F1',
        letterSpacing: 4,
    },
    subtitle: {
        color: '#94A3B8',
        fontSize: 14,
        marginTop: 6,
        letterSpacing: 1,
    },
});

