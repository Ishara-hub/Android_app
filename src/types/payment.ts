export interface Loan {
  id: number;
  loan_id?: string; // for business/lease loans
  member_id: number;
  loan_type?: 'business_loan' | 'lease_loan' | 'micro_loan' | 'interest_only';
  loanProduct?: any;
  total_due?: number;
  overdue_amount?: number;
  repaymentSchedule?: any[];
  [key: string]: any;
}

export interface Installment {
  id: number;
  loan_id: number;
  installment_number?: number;
  amount?: number;
  due_date?: string;
  paid_amount?: number;
  paid_date?: string | null;
  status?: 'pending' | 'paid' | 'overdue';
  total_due?: number;
  interest_due?: number;
  capital_due?: number;
}

export interface Payment {
  id: number;
  loan_id: number;
  member_id?: number;
  amount: number;
  interest_paid?: number;
  capital_paid?: number;
  payment_date?: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  loan_type?: string;
  receipt_number?: string;
  [key: string]: any;
}

export interface PaymentForm {
  loan_id: number | string;
  loan_type: 'business_loan' | 'lease_loan' | 'micro_loan' | 'interest_only';
  paid_amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface PaymentResponse {
  payment: Payment;
  receipt_url?: string;
  message?: string;
}

export interface Receipt {
  payment_id: number;
  member_name?: string;
  member_nic?: string;
  loan_id: number | string;
  loan_type?: string;
  amount: number;
  interest_paid?: number;
  capital_paid?: number;
  payment_date?: string;
  payment_method?: string;
  reference_number?: string;
  processed_by?: string;
  receipt_number?: string;
}

export interface SearchLoanResponse {
  loan: Loan;
  loan_type?: string;
  total_due?: number;
  member?: any;
  message?: string;
} 