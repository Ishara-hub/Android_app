import api from '../utils/api';

export interface DashboardOverview {
  today_stats: {
    payments_count: number;
    payments_amount: number;
    average_payment: number;
  };
  month_stats: {
    payments_count: number;
    payments_amount: number;
    average_payment: number;
  };
  loans: {
    business_loans: number;
    business_loan_amount: number;
    lease_loans: number;
    lease_loan_amount: number;
    micro_loans: number;
    micro_loan_amount: number;
    total_loans: number;
    total_amount: number;
  };
  members: {
    total_members: number;
    active_members: number;
    inactive_members: number;
  };
  recent_activities: {
    recent_payments: any[];
    recent_loans: any[];
  };
}

export interface BranchStats {
  branches: Array<{
    branch_id: number;
    branch_name: string;
    members: {
      total: number;
      active: number;
      inactive: number;
    };
    loans: {
      business_loans: number;
      micro_loans: number;
      lease_loans: number;
      total_loans: number;
    };
    payments: {
      this_month_count: number;
      this_month_amount: number;
    };
    cbos: {
      total: number;
      active: number;
    };
  }>;
}

export const dashboardAPI = {
  // Get dashboard overview
  async getDashboardOverview(params?: {
    branch_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<DashboardOverview> {
    const queryParams = new URLSearchParams();
    if (params?.branch_id) queryParams.append('branch_id', params.branch_id.toString());
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);

    const response = await api.get(`/dashboard/overview?${queryParams.toString()}`);
    return response.data.data;
  },

  // Get branch statistics
  async getBranchStats(): Promise<BranchStats> {
    const response = await api.get('/dashboard/branch-stats');
    return response.data.data;
  },

  // Get CBO performance
  async getCboPerformance(): Promise<any> {
    const response = await api.get('/dashboard/cbo-performance');
    return response.data.data;
  },

  // Get collection performance
  async getCollectionPerformance(): Promise<any> {
    const response = await api.get('/dashboard/collection-performance');
    return response.data.data;
  },
}; 