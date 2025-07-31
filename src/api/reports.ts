import api from '../utils/api';

export interface PortfolioReportResponse {
  loans: {
    data: Array<{
      loan_id: string;
      application_date: string;
      member_name: string;
      member_nic: string;
      branch_name: string;
      product_name: string;
      loan_amount: number;
      interest_rate: number;
      installments: number;
      rental_value: number;
      status: string;
      repayment_method: string;
      payments_made: number;
      outstanding_balance: number;
    }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  summary: {
    total_loans: number;
    total_amount: number;
    average_interest_rate: number;
    total_outstanding: number;
    total_rental_value: number;
  };
}

export interface LoanDetailsReport {
  loan: {
    loan_id: string;
    member_name: string;
    member_nic: string;
    branch_name: string;
    product_name: string;
    loan_amount: number;
    interest_rate: number;
    installments: number;
    status: string;
    rental_value?: number;
    repayment_method?: string;
    credit_officer?: string;
    phone?: string;
    address?: string;
    full_name?: string;
    nic?: string;
    guarantor1_name?: string;
    guarantor1_nic?: string;
    guarantor1_mobile?: string;
    guarantor1_address?: string;
    guarantor2_name?: string;
    guarantor2_nic?: string;
    guarantor2_mobile?: string;
    guarantor2_address?: string;
  };
  installments: Array<{
    installment_number: number;
    installment_date: string;
    total_due: number;
    paid_amount: number;
    status: string;
    penalty: number;
    capital_due: number;
    interest_due: number;
    paid_date?: string | null;
  }>;
  payments: Array<{
    id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    capital_paid: number;
    interest_paid: number;
  }>;
  summary: {
    agreed_amount: number;
    total_paid: number;
    total_outstanding: number;
    arrears: number;
    total_penalty: number;
  };
}

export interface ArrearsReportResponse {
  arrears: {
    data: Array<{
      loan_id: string;
      member_name: string;
      member_nic: string;
      credit_officer_name: string;
      branch_name: string;
      product_name: string;
      loan_amount: number;
      due_date: string;
      total_due: number;
      days_overdue: number;
      loan_type: string;
    }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  summary: {
    total_arrears: number;
    total_amount_due: number;
    average_days_overdue: number;
  };
}

export const reportsAPI = {
  // Get portfolio report
  async getPortfolioReport(params?: {
    branch_id?: number;
    loan_type?: 'BL' | 'ML' | 'LL';
    status?: string;
    date_from?: string;
    date_to?: string;
    repayment_method?: string;
    credit_officer_name?: string;
    per_page?: number;
    page?: number;
  }): Promise<PortfolioReportResponse> {
    const queryParams = new URLSearchParams();
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());
    if (params?.loan_type) queryParams.append('loan_type', params.loan_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    if (params?.repayment_method) queryParams.append('repayment_method', params.repayment_method);
    if (params?.credit_officer_name) queryParams.append('credit_officer_name', params.credit_officer_name);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await api.get(`/reports/portfolio?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get loan details report
  async getLoanDetails(loanId: string): Promise<LoanDetailsReport> {
    const response = await api.get(`/reports/loan-details/${loanId}`);
    return response.data.data;
  },

  // Get arrears report
  async getArrearsReport(params?: {
    branch_id?: number;
    loan_type?: string;
    repayment_method?: string;
    credit_officer?: string;
    days_overdue?: number;
    date_as_of?: string;
    per_page?: number;
    page?: number;
  }): Promise<ArrearsReportResponse> {
    const queryParams = new URLSearchParams();
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());
    if (params?.loan_type) queryParams.append('loan_type', params.loan_type);
    if (params?.repayment_method) queryParams.append('repayment_method', params.repayment_method);
    if (params?.credit_officer) queryParams.append('credit_officer', params.credit_officer);
    if (params?.days_overdue) queryParams.append('days_overdue', params.days_overdue.toString());
    if (params?.date_as_of) queryParams.append('date_as_of', params.date_as_of);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await api.get(`/reports/arrears?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get dashboard stats
  async getDashboardStats(): Promise<any> {
    const response = await api.get('/reports/dashboard-stats');
    return response.data.data;
  },
};

export const branchesAPI = {
  async getBranches(): Promise<Array<{ id: number; branch_name: string }>> {
    const response = await api.get('/branches');
    return response.data.data.branches;
  },
}; 