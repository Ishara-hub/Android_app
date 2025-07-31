import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { paymentsAPI, PaymentSearchResponse, PaymentProcessRequest, PaymentProcessResponse } from '../api/payments';
import { dashboardAPI, DashboardOverview } from '../api/dashboard';

export interface PaymentState {
  // Search state
  searchResult: PaymentSearchResponse | null;
  isSearching: boolean;
  searchError: string | null;
  
  // Payment processing state
  isProcessing: boolean;
  processingError: string | null;
  lastPayment: PaymentProcessResponse | null;
  
  // Dashboard state
  dashboardData: DashboardOverview | null;
  isLoadingDashboard: boolean;
  dashboardError: string | null;
  
  // Payment history
  paymentHistory: any[];
  isLoadingHistory: boolean;
  historyError: string | null;
}

const initialState: PaymentState = {
  searchResult: null,
  isSearching: false,
  searchError: null,
  isProcessing: false,
  processingError: null,
  lastPayment: null,
  dashboardData: null,
  isLoadingDashboard: false,
  dashboardError: null,
  paymentHistory: [],
  isLoadingHistory: false,
  historyError: null,
};

// Async thunks
export const searchLoan = createAsyncThunk(
  'payment/searchLoan',
  async (searchTerm: string) => {
    const response = await paymentsAPI.searchLoan(searchTerm);
    return response;
  }
);

export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async (paymentData: PaymentProcessRequest) => {
    const response = await paymentsAPI.processPayment(paymentData);
    return response;
  }
);

export const getDashboardOverview = createAsyncThunk(
  'payment/getDashboardOverview',
  async (params?: { branch_id?: number; date_from?: string; date_to?: string }) => {
    const response = await dashboardAPI.getDashboardOverview(params);
    return response;
  }
);

export const getPaymentHistory = createAsyncThunk(
  'payment/getPaymentHistory',
  async (params?: { per_page?: number; page?: number }) => {
    const response = await paymentsAPI.getPaymentHistory(params);
    return response;
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearSearchResult: (state) => {
      state.searchResult = null;
      state.searchError = null;
    },
    clearProcessingError: (state) => {
      state.processingError = null;
    },
    clearDashboardError: (state) => {
      state.dashboardError = null;
    },
    clearHistoryError: (state) => {
      state.historyError = null;
    },
  },
  extraReducers: (builder) => {
    // Search loan
    builder
      .addCase(searchLoan.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchLoan.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResult = action.payload;
      })
      .addCase(searchLoan.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.error.message || 'Search failed';
      });

      // Process payment
    builder
      .addCase(processPayment.pending, (state) => {
        state.isProcessing = true;
        state.processingError = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.lastPayment = action.payload;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.processingError = action.error.message || 'Payment failed';
      });

    // Get dashboard overview
    builder
      .addCase(getDashboardOverview.pending, (state) => {
        state.isLoadingDashboard = true;
        state.dashboardError = null;
      })
      .addCase(getDashboardOverview.fulfilled, (state, action) => {
        state.isLoadingDashboard = false;
        state.dashboardData = action.payload;
      })
      .addCase(getDashboardOverview.rejected, (state, action) => {
        state.isLoadingDashboard = false;
        state.dashboardError = action.error.message || 'Failed to load dashboard';
      });

    // Get payment history
    builder
      .addCase(getPaymentHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.paymentHistory = action.payload.payments?.data || [];
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = action.error.message || 'Failed to load payment history';
      });
  },
});

export const { 
  clearSearchResult, 
  clearProcessingError, 
  clearDashboardError,
  clearHistoryError 
} = paymentSlice.actions;

export default paymentSlice.reducer; 