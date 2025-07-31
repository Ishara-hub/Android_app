export interface Member {
  id: number;
  full_name?: string;
  nic: string;
  phone?: string;
  address?: string;
  email?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

import { Loan, Payment } from './payment';

export interface MemberProfile {
  member: Member;
  loans: Loan[];
  payment_history: Payment[];
  total_loans: number;
  active_loans: number;
  total_paid: number;
  outstanding_balance: number;
}

export interface MemberLoansResponse {
  member: Member;
  business_loans?: any[];
  lease_loans?: any[];
  micro_loans?: any[];
  total_loans?: number;
  total_due?: number;
}

export interface PaymentHistory {
  id: number;
  loan_number?: string;
  payment_amount?: number;
  payment_date?: string;
  payment_method?: string;
  receipt_number?: string;
  installment_number?: number;
  [key: string]: any;
}

export interface MemberPaymentHistoryResponse {
  member: Member;
  payments: PaymentHistory[];
  statistics?: any;
}

export interface MemberSearchResult {
  members: Member[];
} 