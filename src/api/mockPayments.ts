import { storage } from '../utils/storage';
import { 
  SearchLoanResponse, 
  PaymentForm, 
  PaymentResponse, 
  Loan, 
  Installment 
} from '../types/payment';

// Mock loan data
const mockLoans: Loan[] = [
  {
    id: 1,
    loan_number: 'LOAN001',
    member_id: 1,
    member_name: 'Ahmed Hassan',
    member_nic: '1234567890123',
    loan_amount: 50000,
    outstanding_balance: 35000,
    total_installments: 12,
    paid_installments: 5,
    next_installment_date: '2024-02-15',
    next_installment_amount: 5000,
    status: 'active',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
  {
    id: 2,
    loan_number: 'LOAN002',
    member_id: 2,
    member_name: 'Fatima Ali',
    member_nic: '9876543210987',
    loan_amount: 30000,
    outstanding_balance: 20000,
    total_installments: 10,
    paid_installments: 4,
    next_installment_date: '2024-02-20',
    next_installment_amount: 3000,
    status: 'active',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
  },
];

// Mock installments
const mockInstallments: Installment[] = [
  {
    id: 1,
    loan_id: 1,
    installment_number: 6,
    amount: 5000,
    due_date: '2024-02-15',
    paid_amount: 0,
    paid_date: null,
    status: 'pending',
  },
  {
    id: 2,
    loan_id: 1,
    installment_number: 7,
    amount: 5000,
    due_date: '2024-03-15',
    paid_amount: 0,
    paid_date: null,
    status: 'pending',
  },
  {
    id: 3,
    loan_id: 2,
    installment_number: 5,
    amount: 3000,
    due_date: '2024-02-20',
    paid_amount: 0,
    paid_date: null,
    status: 'pending',
  },
];

export const mockPaymentsAPI = {
  // Mock search loan
  async searchLoan(searchTerm: string): Promise<SearchLoanResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Search by loan number or NIC
    const loan = mockLoans.find(l => 
      l.loan_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.member_nic.includes(searchTerm) ||
      l.member_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (!loan) {
      throw new Error('Loan not found');
    }
    
    const installments = mockInstallments.filter(i => i.loan_id === loan.id);
    
    // Add to search history
    await storage.addSearchHistory(searchTerm);
    
    return {
      loan,
      installments,
      message: 'Loan found successfully',
    };
  },

  // Mock get loan details
  async getLoanDetails(loanId: number): Promise<Loan> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const loan = mockLoans.find(l => l.id === loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }
    return loan;
  },

  // Mock get loan installments
  async getLoanInstallments(loanId: number): Promise<Installment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockInstallments.filter(i => i.loan_id === loanId);
  },

  // Mock process payment
  async processPayment(paymentData: PaymentForm): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const payment = {
      id: Date.now(),
      loan_id: paymentData.loan_id,
      installment_id: paymentData.installment_id,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      reference_number: paymentData.reference_number || `REF${Date.now()}`,
      receipt_number: `RCP${Date.now()}`,
      location: 'Field Collection',
      agent_id: 1,
      created_at: new Date().toISOString(),
    };
    
    const receipt = {
      id: Date.now(),
      payment_id: payment.id,
      receipt_number: payment.receipt_number,
      qr_code: `QR_${Date.now()}`,
      payment_details: payment,
      created_at: new Date().toISOString(),
    };
    
    return {
      payment,
      receipt,
      message: 'Payment processed successfully',
    };
  },

  // Mock get payment receipt
  async getPaymentReceipt(paymentId: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      receipt_number: `RCP${paymentId}`,
      payment_date: new Date().toISOString(),
      amount: 5000,
      payment_method: 'cash',
    };
  },

  // Mock get pending loans
  async getPendingLoans(): Promise<Loan[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockLoans.filter(l => l.status === 'active');
  },

  // Mock get overdue loans
  async getOverdueLoans(): Promise<Loan[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockLoans.filter(l => l.status === 'overdue');
  },

  // Mock store offline payment
  async storeOfflinePayment(paymentData: PaymentForm): Promise<void> {
    await storage.addOfflinePayment(paymentData);
  },

  // Mock sync offline payments
  async syncOfflinePayments(): Promise<void> {
    const offlinePayments = await storage.getOfflinePayments();
    console.log('Syncing offline payments:', offlinePayments);
    await storage.clearOfflinePayments();
  },
}; 