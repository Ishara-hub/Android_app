import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SEARCH_HISTORY: 'search_history',
  OFFLINE_PAYMENTS: 'offline_payments',
  APP_SETTINGS: 'app_settings',
};

export const storage = {
  // Auth storage
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.AUTH_TOKEN, token);
  },

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(StorageKeys.AUTH_TOKEN);
  },

  async setUserData(user: User): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(user));
  },

  async getUserData(): Promise<User | null> {
    const data = await AsyncStorage.getItem(StorageKeys.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([StorageKeys.AUTH_TOKEN, StorageKeys.USER_DATA]);
  },

  // Search history
  async addSearchHistory(searchTerm: string): Promise<void> {
    const history = await this.getSearchHistory();
    const newHistory = [searchTerm, ...(history || []).filter(item => item !== searchTerm)].slice(0, 10);
    await AsyncStorage.setItem(StorageKeys.SEARCH_HISTORY, JSON.stringify(newHistory));
  },

  async getSearchHistory(): Promise<string[]> {
    const data = await AsyncStorage.getItem(StorageKeys.SEARCH_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  // Offline payments
  async addOfflinePayment(payment: any): Promise<void> {
    const payments = await this.getOfflinePayments();
    payments.push({ ...payment, id: Date.now(), created_at: new Date().toISOString() });
    await AsyncStorage.setItem(StorageKeys.OFFLINE_PAYMENTS, JSON.stringify(payments));
  },

  async getOfflinePayments(): Promise<any[]> {
    const data = await AsyncStorage.getItem(StorageKeys.OFFLINE_PAYMENTS);
    return data ? JSON.parse(data) : [];
  },

  async clearOfflinePayments(): Promise<void> {
    await AsyncStorage.removeItem(StorageKeys.OFFLINE_PAYMENTS);
  },

  // App settings
  async setAppSettings(settings: any): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.APP_SETTINGS, JSON.stringify(settings));
  },

  async getAppSettings(): Promise<any> {
    const data = await AsyncStorage.getItem(StorageKeys.APP_SETTINGS);
    return data ? JSON.parse(data) : {};
  },
}; 