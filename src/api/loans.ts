import api from '../utils/api';

export interface LoanSearchResponse {
  loan: {
    loan_id: string;
    member_name: string;
    member_nic: string;
    loan_amount: number;
    status: string;
  };
  member: {
    id: number;
    full_name: string;
    nic: string;
    phone: string;
  };
}

export interface LoanDetails {
  loan: {
    loan_id: string;
    member_name: string;
    member_nic: string;
    loan_amount: number;
    interest_rate: number;
    status: string;
  };
  member: {
    id: number;
    full_name: string;
    nic: string;
    phone: string;
  };
}

export interface LoanListResponse {
  loans: Array<{
    loan_id: string;
    member_name: string;
    member_nic: string;
    loan_amount: number;
    status: string;
    loan_type: string;
  }>;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const loansAPI = {
  // Search loan
  async searchLoan(searchTerm: string): Promise<LoanSearchResponse> {
    const response = await api.post('/loans/search', {
      search_term: searchTerm
    });
    return response.data.data;
  },

  // Get loan details
  async getLoanDetails(loanId: string): Promise<LoanDetails> {
    const response = await api.get(`/loans/details/${loanId}`);
    return response.data.data;
  },

  // Get loan list
  async getLoanList(params?: {
    loan_type?: 'business_loan' | 'micro_loan' | 'lease_loan';
    status?: string;
    branch_id?: number;
    per_page?: number;
    page?: number;
  }): Promise<LoanListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.loan_type) queryParams.append('loan_type', params.loan_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await api.get(`/loans/list?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get loan installments
  async getLoanInstallments(loanId: string): Promise<any> {
    const response = await api.get(`/loans/${loanId}/installments`);
    return response.data.data;
  },
}; 