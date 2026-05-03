import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_KEY = '@mdtl_wallet';
const TOKEN_KEY = '@mdtl_token';

export interface WalletData {
    did: string;
    walletAddress: string;
    publicKey: string;
    privateKey: string;
    recovery?: {
        shares: string[];
        threshold: number;
        totalShares: number;
    };
    createdAt: string;
}

/**
 * WalletStore — Persistent wallet storage using AsyncStorage
 * Ensures wallet identity survives app restarts and page refreshes
 */
export class WalletStore {
    /**
     * Save wallet data after creation
     */
    static async saveWallet(data: WalletData): Promise<void> {
        try {
            await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('[WalletStore] Failed to save wallet:', error);
            throw error;
        }
    }

    /**
     * Load existing wallet (returns null if none exists)
     */
    static async loadWallet(): Promise<WalletData | null> {
        try {
            const json = await AsyncStorage.getItem(WALLET_KEY);
            if (!json) return null;
            return JSON.parse(json) as WalletData;
        } catch (error) {
            console.error('[WalletStore] Failed to load wallet:', error);
            return null;
        }
    }

    /**
     * Check if a wallet exists (fast check without parsing)
     */
    static async hasWallet(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(WALLET_KEY);
            return value !== null;
        } catch {
            return false;
        }
    }

    /**
     * Delete wallet data (for wallet reset/recovery flow)
     */
    static async clearWallet(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([WALLET_KEY, TOKEN_KEY]);
        } catch (error) {
            console.error('[WalletStore] Failed to clear wallet:', error);
        }
    }

    /**
     * Save auth token
     */
    static async saveToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('[WalletStore] Failed to save token:', error);
        }
    }

    /**
     * Load auth token
     */
    static async loadToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    }
}
