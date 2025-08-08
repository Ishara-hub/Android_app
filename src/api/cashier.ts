import api from '../utils/api';

export interface PaymentHistoryResponse {
  payments: Array<{
    id: number;
    loan_type: string;
    loan_id: string;
    member_id: number;
    user_id: number;
    branch_id: number;
    amount: number;
    interest_paid: number;
    capital_paid: number;
    payment_date: string;
    payment_method: string;
    reference_number?: string;
    notes?: string;
    member?: {
      id: number;
      name: string;
      nic: string;
    };
    user?: {
      id: number;
      name: string;
    };
  }>;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CboResponse {
  cbo_id: number;
  cbo_name: string;
  cbo_code: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MicroLoanByCboResponse {
  id: number;
  loan_id: string;
  member_id: number;
  cbo_id: number;
  status: string;
  total_due: number;
  pending_installments: number;
  group_number: number;
  member: {
    id: number;
    initials: string;
    nic: string;
  };
  microLoanDetails: Array<{
    id: number;
    installment_date: string;
    total_due: number;
    interest_due: number;
    capital_due: number;
    status: string;
  }>;
}

export interface BulkPaymentRequest {
  cbo_id: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  payments: Array<{
    loan_id: string;
    amount: number;
  }>;
}

export interface BulkPaymentResponse {
  success_count: number;
  total_amount: number;
  processed_payments: Array<{
    payment_id: number;
    loan_id: string;
    amount: number;
  }>;
}

export const cashierAPI = {
  // Get payment history
  async getPaymentHistory(params?: {
    date_from?: string;
    date_to?: string;
    branch_id?: number;
    payment_method?: string;
    user_id?: number;
    loan_type?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaymentHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.loan_type) queryParams.append('loan_type', params.loan_type);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await api.get(`/cashier/payment-history?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get CBOs
  async getCbos(): Promise<CboResponse[]> {
    const response = await api.get('/cashier/cbos');
    return response.data.data;
  },

  // Get micro loans by CBO
  async getMicroLoansByCbo(cboId: number): Promise<MicroLoanByCboResponse[]> {
    const response = await api.post('/cashier/micro-loans-by-cbo', { cbo_id: cboId });
    return response.data.data;
  },

  // Process bulk payment
  async processBulkPayment(data: BulkPaymentRequest): Promise<BulkPaymentResponse> {
    const response = await api.post('/cashier/process-bulk-payment', data);
    return response.data.data;
  },

  // Get dashboard overview
  async getDashboardOverview(): Promise<any> {
    const response = await api.get('/cashier/dashboard');
    return response.data.data;
  },

  // Get daily summary
  async getDailySummary(params?: {
    date?: string;
    branch_id?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());

    const response = await api.get(`/cashier/daily-summary?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get receipt details
  async getReceipt(paymentId: number): Promise<any> {
    const response = await api.get(`/cashier/receipt/${paymentId}`);
    return response.data.data;
  },

  // Process individual payment
  async processIndividualPayment(data: any): Promise<any> {
    const response = await api.post('/cashier/process-payment', data);
    return response.data.data;
  },

  // Search loan
  async searchLoan(searchTerm: string): Promise<any> {
    const response = await api.post('/cashier/search-loan', { search_term: searchTerm });
    return response.data.data;
  },
}; 