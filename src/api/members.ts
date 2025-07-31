import api from '../utils/api';

export interface MemberSearchResponse {
  members: {
    data: Array<{
      id: number;
      full_name: string;
      nic: string;
      phone: string;
      status: string;
    }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface MemberLoansResponse {
  member: {
    id: number;
    full_name: string;
    nic: string;
  };
  business_loans: Array<{
    loan_id: string;
    loan_amount: number;
    status: string;
    total_due: number;
    loan_type: string;
  }>;
  micro_loans: Array<{
    loan_id: string;
    loan_amount: number;
    status: string;
    total_due: number;
    loan_type: string;
  }>;
  lease_loans: Array<{
    loan_id: string;
    loan_amount: number;
    status: string;
    total_due: number;
    loan_type: string;
  }>;
  total_loans: number;
  total_due: number;
}

export interface MemberPaymentsResponse {
  member: {
    id: number;
    full_name: string;
    nic: string;
  };
  payments: {
    data: Array<{
      id: number;
      amount: number;
      payment_date: string;
      payment_method: string;
      loan_id: string;
    }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  statistics: {
    total_payments: number;
    total_amount_paid: number;
    this_month_payments: number;
    this_month_amount: number;
  };
}

export const membersAPI = {
  // Search members
  async searchMembers(searchTerm: string): Promise<MemberSearchResponse> {
    const response = await api.post('/members/search', {
      search_term: searchTerm
    });
    return response.data.data;
  },

  // Get member loans
  async getMemberLoans(memberIdOrNic: string): Promise<MemberLoansResponse> {
    const response = await api.get(`/members/${memberIdOrNic}/loans`);
    return response.data.data;
  },

  // Get member payment history
  async getMemberPaymentHistory(memberIdOrNic: string, params?: {
    per_page?: number;
    page?: number;
  }): Promise<MemberPaymentsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await api.get(`/members/${memberIdOrNic}/payments?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get member list
  async getMemberList(params?: {
    per_page?: number;
    page?: number;
    status?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await api.get(`/members/list?${queryParams.toString()}`);
    return response.data.data;
  },
}; 