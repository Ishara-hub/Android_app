import { storage } from '../utils/storage';
import { LoginCredentials, LoginResponse, User } from '../types/auth';

// Mock user data for testing
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'field_agent',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'field_agent',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
];

export const mockAuthAPI = {
  // Mock login - accepts any email/password for testing
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For testing, accept any email/password
    const user = mockUsers.find(u => u.email === credentials.email) || mockUsers[0];
    
    const mockToken = 'mock_token_' + Date.now();
    
    // Store token and user data
    await storage.setAuthToken(mockToken);
    await storage.setUserData(user);
    
    return {
      user,
      token: mockToken,
      message: 'Login successful',
    };
  },

  // Mock logout
  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    await storage.clearAuthData();
  },

  // Mock get profile
  async getProfile(): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = await storage.getUserData();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getAuthToken();
    return !!token;
  },

  // Get stored user data
  async getStoredUser(): Promise<User | null> {
    return await storage.getUserData();
  },
}; 