// API Configuration for different environments
export const API_CONFIG = {
  // Development (Local Laravel server)
  development: {
    baseURL: 'http://192.168.1.179:8000/api',
    timeout: 15000,
  },
  
  // Staging (Ocean server)
  staging: {
    baseURL: 'http://139.59.234.79/microfinance/api',
    timeout: 30000,
  },
  
  // Production (Ocean server - same as staging for now)
  production: {
    baseURL: 'http://139.59.234.79/microfinance/api', // Using Ocean server for production
    timeout: 30000,
  },
};

// Current environment - change this to switch environments
export const CURRENT_ENV = 'production'; // Changed to production for published app

// Get current API configuration
export const getApiConfig = () => {
  return API_CONFIG[CURRENT_ENV as keyof typeof API_CONFIG] || API_CONFIG.production;
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  LOGOUT: '/logout',
  PROFILE: '/user',
  
  // Payment processing
  SEARCH_LOAN: '/payments/search-loan',
  LOAN_DETAILS: '/payments/loan-details',
  INSTALLMENTS: '/payments',
  PROCESS_PAYMENT: '/payments/process',
  PAYMENT_RECEIPT: '/payments/receipt',
  PAYMENT_HISTORY: '/payments/history',
  
  // Reports
  PORTFOLIO_REPORT: '/reports/portfolio',
  ARREARS_REPORT: '/reports/arrears',
  LOAN_DETAILS_REPORT: '/reports/loan-details',
  DASHBOARD_STATS: '/reports/dashboard',
  
  // Members
  MEMBER_LIST: '/members/list',
  MEMBER_PROFILE: '/members/profile',
  MEMBER_LOANS: '/members/loans',
  MEMBER_PAYMENT_HISTORY: '/members/payment-history',
  
  // Branches and CBOs
  BRANCHES: '/branches',
  CBOS: '/cbos',
  CREDIT_OFFICERS: '/credit-officers',
  
  // Test
  TEST_CONNECTION: '/test',
}; 