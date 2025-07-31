import api from './api';

export const testConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Try the test endpoint first
    try {
      const response = await api.get('/test');
      console.log('Connection successful:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (testError: any) {
      // If test endpoint doesn't exist, try a health check
      console.log('Test endpoint not found, trying health check...');
      try {
        const healthResponse = await api.get('/health');
        console.log('Health check successful:', healthResponse.data);
        return {
          success: true,
          data: healthResponse.data
        };
      } catch (healthError: any) {
        // If health check also fails, try a simple GET request to verify server is up
        console.log('Health check failed, trying basic server check...');
        const serverResponse = await api.get('/');
        console.log('Server is accessible:', serverResponse.status);
        return {
          success: true,
          data: { message: 'Server is accessible', status: serverResponse.status }
        };
      }
    }
  } catch (error: any) {
    console.error('Connection failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

export const testAuthConnection = async (email: string, password: string) => {
  try {
    console.log('Testing authentication...');
    const response = await api.post('/login', {
      email,
      password,
      device_name: 'Mobile App'
    });
    console.log('Authentication successful:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Authentication failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

export const testSearchLoan = async (searchTerm: string) => {
  try {
    console.log('Testing loan search...');
    
    const response = await api.post('/mobile/search-loan', { search_term: searchTerm });
    console.log('✅ Loan search successful:', response.data.message);
    return response.data;
  } catch (error: any) {
    console.log('❌ Loan search failed:', error.response?.data?.message || error.message);
    return null;
  }
};

// New function to test server availability without specific endpoints
export const testServerAvailability = async () => {
  try {
    console.log('Testing server availability...');
    
    // Try to connect to the server base URL
    const response = await api.get('/');
    console.log('Server is accessible:', response.status);
    return {
      success: true,
      data: { 
        message: 'Server is accessible', 
        status: response.status,
        server: 'Ocean Server (165.22.240.220)'
      }
    };
  } catch (error: any) {
    console.error('Server not accessible:', error.message);
    return {
      success: false,
      error: `Server not accessible: ${error.message}`
    };
  }
}; 