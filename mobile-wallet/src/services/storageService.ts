import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage wrapper for the mobile wallet
 * Uses AsyncStorage for the prototype; production would use expo-secure-store
 */

const KEYS = {
    WALLET_DID: '@mdtl_wallet_did',
    WALLET_ADDRESS: '@mdtl_wallet_address',
    PUBLIC_KEY: '@mdtl_public_key',
    CREDENTIALS: '@mdtl_credentials',
    PROOF_HISTORY: '@mdtl_proof_history',
    AUTH_TOKEN: '@mdtl_auth_token',
    SETTINGS: '@mdtl_settings',
};

export class StorageService {
    // ============ Wallet Identity ============

    static async saveWalletIdentity(data: {
        did: string;
        walletAddress: string;
        publicKey: string;
        token: string;
    }): Promise<void> {
        await AsyncStorage.multiSet([
            [KEYS.WALLET_DID, data.did],
            [KEYS.WALLET_ADDRESS, data.walletAddress],
            [KEYS.PUBLIC_KEY, data.publicKey],
            [KEYS.AUTH_TOKEN, data.token],
        ]);
    }

    static async getWalletDID(): Promise<string | null> {
        return AsyncStorage.getItem(KEYS.WALLET_DID);
    }

    static async getAuthToken(): Promise<string | null> {
        return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    }

    static async hasWallet(): Promise<boolean> {
        const did = await AsyncStorage.getItem(KEYS.WALLET_DID);
        return did !== null;
    }

    // ============ Credentials (Offline Storage) ============

    static async saveCredentials(credentials: any[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.CREDENTIALS, JSON.stringify(credentials));
    }

    static async getCredentials(): Promise<any[]> {
        const data = await AsyncStorage.getItem(KEYS.CREDENTIALS);
        return data ? JSON.parse(data) : [];
    }

    static async addCredential(credential: any): Promise<void> {
        const existing = await this.getCredentials();
        existing.unshift(credential);
        await this.saveCredentials(existing);
    }

    // ============ Proof History ============

    static async saveProofHistory(history: any[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.PROOF_HISTORY, JSON.stringify(history));
    }

    static async getProofHistory(): Promise<any[]> {
        const data = await AsyncStorage.getItem(KEYS.PROOF_HISTORY);
        return data ? JSON.parse(data) : [];
    }

    static async addProofRecord(record: any): Promise<void> {
        const existing = await this.getProofHistory();
        existing.unshift(record);
        await this.saveProofHistory(existing);
    }

    // ============ Clear All ============

    static async clearAll(): Promise<void> {
        const keys = Object.values(KEYS);
        await AsyncStorage.multiRemove(keys);
    }
}
