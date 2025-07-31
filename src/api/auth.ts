import api from '../utils/api';
import { storage } from '../utils/storage';
import { LoginCredentials, LoginResponse, User } from '../types/auth';
import { mockAuthAPI } from './mockAuth';

// Set this to true to use mock authentication for testing
const USE_MOCK_AUTH = false;

export const authAPI = {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (USE_MOCK_AUTH) {
      return await mockAuthAPI.login(credentials);
    }
    
    const response = await api.post('/login', credentials);
    const data = response.data;
    
    // Store token and user data
    await storage.setAuthToken(data.data.token);
    await storage.setUserData(data.data.user);
    
    return data.data;
  },

  // Logout user
  async logout(): Promise<void> {
    if (USE_MOCK_AUTH) {
      return await mockAuthAPI.logout();
    }
    
    try {
      await api.post('/logout');
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      await storage.clearAuthData();
    }
  },

  // Get user profile
  async getProfile(): Promise<User> {
    if (USE_MOCK_AUTH) {
      return await mockAuthAPI.getProfile();
    }
    
    const response = await api.get('/user');
    return response.data;
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    if (USE_MOCK_AUTH) {
      return await mockAuthAPI.isAuthenticated();
    }
    
    const token = await storage.getAuthToken();
    return !!token;
  },

  // Get stored user data
  async getStoredUser(): Promise<User | null> {
    if (USE_MOCK_AUTH) {
      return await mockAuthAPI.getStoredUser();
    }
    
    return await storage.getUserData();
  },
}; 