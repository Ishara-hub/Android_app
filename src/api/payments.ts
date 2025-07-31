import api from '../utils/api';

export interface PaymentSearchResponse {
  loan: {
    loan_id: string;
    member_name: string;
    member_nic: string;
    loan_amount: number;
    status: string;
  };
  loan_type: string;
  total_due: number;
  member: {
    id: number;
    full_name: string;
    nic: string;
  };
}

export interface PaymentProcessRequest {
  loan_id: string;
  loan_type: string;
  paid_amount: number;
  payment_date: string;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer';
  reference_number?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface PaymentProcessResponse {
  payment: {
    id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
  };
  receipt_url: string;
}

export interface PaymentReceipt {
  payment_id: number;
  member_name: string;
  member_nic: string;
  loan_id: string;
  loan_type: string;
  amount: number;
  interest_paid: number;
  capital_paid: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  processed_by: string;
  receipt_number: string;
}

export const paymentsAPI = {
  // Search loan for payment
  async searchLoan(searchTerm: string): Promise<PaymentSearchResponse> {
    const response = await api.post('/payments/search-loan', {
      search_term: searchTerm
    });
    return response.data.data;
  },

  // Get loan details
  async getLoanDetails(loanId: string): Promise<any> {
    const response = await api.get(`/payments/loan-details/${loanId}`);
    return response.data.data;
  },

  // Get loan installments
  async getInstallments(loanId: string): Promise<any> {
    const response = await api.get(`/payments/${loanId}/installments`);
    return response.data.data;
  },

  // Process payment
  async processPayment(paymentData: PaymentProcessRequest): Promise<PaymentProcessResponse> {
    const response = await api.post('/payments/process', paymentData);
    return response.data.data;
  },

  // Get payment receipt
  async getReceipt(paymentId: number): Promise<PaymentReceipt> {
    const response = await api.get(`/payments/receipt/${paymentId}`);
    return response.data.data;
  },

  // Get payment history
  async getPaymentHistory(params?: {
    per_page?: number;
    page?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const response = await api.get(`/payments/history?${queryParams.toString()}`);
    return response.data.data;
  },
}; 