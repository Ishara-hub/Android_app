import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { loansAPI } from '../../api/loans';
import { paymentsAPI } from '../../api/payments';
import { reportsAPI, LoanDetailsReport } from '../../api/reports';
import { Card } from '../../components/common/Card';
import { Loan, Installment, Payment } from '../../types/payment';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const TABS = [
  { key: 'summary', label: 'Summary' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'payments', label: 'Payments' },
  { key: 'guarantors', label: 'Guarantors' },
  { key: 'penalties', label: 'Penalties' },
];

const LoanDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'LoanDetails'>>();
  const { loanId } = route.params;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [loan, setLoan] = useState<Loan | null>(null);
  const [member, setMember] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [guarantors, setGuarantors] = useState<any>({});

  console.log('LoanDetailsScreen loaded with loanId:', loanId);

  useEffect(() => {
    const fetchAll = async () => {
      console.log('Fetching loan details for loanId:', loanId);
      setLoading(true);
      try {
        // Fetch loan details (loan, installments, payments, summary)
        const details = await reportsAPI.getLoanDetails(loanId);
        console.log('Loan Details API response:', details);
        // Debug: Log the loan details
        console.log('Loan Details from API:', details.loan);
        console.log('Loan Amount:', details.loan.loan_amount, 'Type:', typeof details.loan.loan_amount);
        console.log('Rental Value:', details.loan.rental_value, 'Type:', typeof details.loan.rental_value);
        console.log('All loan fields:', Object.keys(details.loan));
        
        // Map loan - use the same approach as PortfolioReportScreen
        setLoan({
          id: 0,
          loan_id: details.loan.loan_id,
          member_id: 0,
          loan_type: undefined,
          loanProduct: undefined,
          total_due: undefined,
          overdue_amount: undefined,
          repaymentSchedule: undefined,
          product_name: details.loan.product_name,
          loan_amount: details.loan.loan_amount || 0,
          interest_rate: details.loan.interest_rate,
          installments: details.loan.installments,
          status: details.loan.status,
          branch_name: details.loan.branch_name,
          rental_value: details.loan.rental_value || 0,
          repayment_method: details.loan.repayment_method,
          credit_officer: details.loan.credit_officer,
        });
        setMember({
          full_name: details.loan.full_name || details.loan.member_name,
          nic: details.loan.nic || details.loan.member_nic,
          phone: details.loan.phone,
          address: details.loan.address,
          branch_name: details.loan.branch_name,
        });
        setGuarantors({
          guarantor1_name: details.loan.guarantor1_name,
          guarantor1_nic: details.loan.guarantor1_nic,
          guarantor1_mobile: details.loan.guarantor1_mobile,
          guarantor1_address: details.loan.guarantor1_address,
          guarantor2_name: details.loan.guarantor2_name,
          guarantor2_nic: details.loan.guarantor2_nic,
          guarantor2_mobile: details.loan.guarantor2_mobile,
          guarantor2_address: details.loan.guarantor2_address,
        });
        setSummary(details.summary || {});
        // Map installments
        setInstallments(
          Array.isArray(details.installments)
            ? details.installments.map((inst, idx) => ({
                id: idx,
                loan_id: 0,
                installment_number: inst.installment_number,
                due_date: inst.installment_date,
                total_due: inst.total_due,
                paid_amount: inst.paid_amount,
                status: inst.status as 'pending' | 'paid' | 'overdue' | undefined,
                interest_due: inst.interest_due,
                capital_due:  inst.capital_due,
                paid_date: typeof inst.paid_date === 'string' ? inst.paid_date : undefined,
                penalty: inst.penalty,
              }))
            : []
        );
        // Map payments
        setPayments(
          Array.isArray(details.payments)
            ? details.payments.map((p) => ({
                id: p.id,
                loan_id: 0,
                amount: p.amount,
                payment_date: p.payment_date,
                payment_method: p.payment_method,
                capital_paid: p.capital_paid,
                interest_paid: p.interest_paid,
                member_id: undefined,
                reference_number: undefined,
                notes: undefined,
                loan_type: undefined,
                receipt_number: undefined,
              }))
            : []
        );
        // Penalties can be derived from installments if needed
        setPenalties([]); // Or map from installments if penalty field exists
      } catch (error: any) {
        console.error('Error fetching loan details:', error);
        // Create mock data for testing navigation
        console.log('Creating mock data for testing...');
        setLoan({
          id: 0,
          loan_id: loanId,
          member_id: 0,
          loan_type: undefined,
          loanProduct: undefined,
          total_due: undefined,
          overdue_amount: undefined,
          repaymentSchedule: undefined,
          product_name: 'Test Loan Product',
          loan_amount: 500000,
          interest_rate: 12.5,
          installments: 24,
          status: 'disbursed',
          branch_name: 'Test Branch',
          rental_value: 0,
          repayment_method: 'Monthly',
          credit_officer: 'Test Officer',
        });
        setMember({
          full_name: 'Test Member',
          nic: '123456789V',
          phone: '+94 123 456 789',
          address: 'Test Address',
          branch_name: 'Test Branch',
        });
        setGuarantors({
          guarantor1_name: 'Test Guarantor 1',
          guarantor1_nic: '987654321V',
          guarantor1_mobile: '+94 987 654 321',
          guarantor1_address: 'Test Guarantor Address 1',
          guarantor2_name: 'Test Guarantor 2',
          guarantor2_nic: '456789123V',
          guarantor2_mobile: '+94 456 789 123',
          guarantor2_address: 'Test Guarantor Address 2',
        });
        setSummary({
          agreed_amount: 500000,
          total_paid: 250000,
          total_outstanding: 250000,
          arrears: 0,
          total_penalty: 0,
        });
        setInstallments([]);
        setPayments([]);
        setPenalties([]);
        
        Alert.alert(
          'API Not Available', 
          'Backend API not available. Showing mock data for testing navigation.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [loanId]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }
  if (!loan) {
    return <View style={styles.centered}><Text>No loan details found.</Text></View>;
  }

  // Summary cards
  const summaryCards = [
    { label: 'Agreed Amount', value: summary?.agreed_amount || loan.loan_amount, color: '#007bff' },
    { label: 'Total Paid', value: summary?.total_paid, color: '#28a745' },
    { label: 'Outstanding', value: summary?.total_outstanding, color: '#ffc107' },
    { label: 'Arrears', value: summary?.arrears, color: '#dc3545' },
    { label: 'Total Penalties', value: summary?.total_penalty, color: '#dc3545' },
  ];

  const formatCurrency = (amount: any) => {
    if (amount === null || amount === undefined || amount === '') return '-';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numAmount) || numAmount === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString() : '-';

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#f5f5f5">
      <ScrollView style={styles.scrollView}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {summaryCards.map((card, idx) => (
            <View key={idx} style={[styles.summaryCard, { borderColor: card.color }]}> 
              <Text style={styles.summaryLabel}>{card.label}</Text>
              <Text style={[styles.summaryValue, { color: card.color }]}>{formatCurrency(card.value)}</Text>
            </View>
          ))}
        </View>
        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'summary' && (
            <>
              <Card title="Member Information" style={styles.card}>
                <Text style={styles.label}>Full Name: <Text style={styles.value}>{member?.full_name}</Text></Text>
                <Text style={styles.label}>NIC Number: <Text style={styles.value}>{member?.nic}</Text></Text>
                <Text style={styles.label}>Contact: <Text style={styles.value}>{member?.phone}</Text></Text>
                <Text style={styles.label}>Address: <Text style={styles.value}>{member?.address || '-'}</Text></Text>
              </Card>
              <Card title="Loan Information" style={styles.card}>
                <Text style={styles.label}>Loan Product: <Text style={styles.value}>{loan.product_name || '-'}</Text></Text>
                <Text style={styles.label}>Loan Amount: <Text style={styles.value}>{formatCurrency(loan.loan_amount)}</Text></Text>
                <Text style={styles.label}>Installments: <Text style={styles.value}>{loan.installments || '-'}</Text></Text>
                <Text style={styles.label}>Interest Rate: <Text style={styles.value}>{loan.interest_rate}%</Text></Text>
                <Text style={styles.label}>Rental Value: <Text style={styles.value}>{formatCurrency(loan.rental_value)}</Text></Text>
                <Text style={styles.label}>Repayment Method: <Text style={styles.value}>{loan.repayment_method || '-'}</Text></Text>
                <Text style={styles.label}>Credit Officer: <Text style={styles.value}>{loan.credit_officer || '-'}</Text></Text>
                <Text style={styles.label}>Branch: <Text style={styles.value}>{loan.branch_name || '-'}</Text></Text>
                <Text style={styles.label}>Status: <Text style={styles.value}>{loan.status}</Text></Text>
              </Card>
            </>
          )}
          {activeTab === 'schedule' && (
            <Card title="Repayment Schedule" style={styles.card}>
              {installments.length > 0 ? (
                <View>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableHeader}>#</Text>
                    <Text style={styles.tableHeader}>Due Date</Text>
                    <Text style={styles.tableHeader}>Total Due</Text>
                    <Text style={styles.tableHeader}>Paid Amount</Text>
                    <Text style={styles.tableHeader}>Status</Text>
                    <Text style={styles.tableHeader}>Payment Date</Text>
                  </View>
                  {installments.map((inst, idx) => (
                    <View key={inst.id || idx} style={[styles.tableRow, inst.status === 'paid' ? styles.tableRowPaid : inst.status === 'overdue' ? styles.tableRowOverdue : null]}>
                      <Text style={styles.tableCell}>{inst.installment_number ?? '-'}</Text>
                      <Text style={styles.tableCell}>{inst.due_date || ''}</Text>
                      <Text style={styles.tableCell}>{inst.total_due}</Text>
                      <Text style={styles.tableCell}>{inst.paid_amount}</Text>
                      <Text style={styles.tableCell}>{inst.status === 'paid' ? 'Paid' : inst.status === 'overdue' ? 'Overdue' : 'Pending'}</Text>
                      <Text style={styles.tableCell}>{inst.status === 'paid' ? (inst.paid_date || '') : '--'}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>Installment schedule will be generated after approval.</Text>
              )}
            </Card>
          )}
          {activeTab === 'payments' && (
            <Card title="Payment History" style={styles.card}>
              {payments.length > 0 ? (
                <View>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableHeader}>Date</Text>
                    <Text style={styles.tableHeader}>Amount</Text>
                    <Text style={styles.tableHeader}>Principal</Text>
                    <Text style={styles.tableHeader}>Interest</Text>
                    <Text style={styles.tableHeader}>Method</Text>
                  </View>
                  {payments.map((p, idx) => (
                    <View key={p.id || idx} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{p.payment_date || ''}</Text>
                      <Text style={styles.tableCell}>{p.amount}</Text>
                      <Text style={styles.tableCell}>{p.capital_paid}</Text>
                      <Text style={styles.tableCell}>{p.interest_paid}</Text>
                      <Text style={styles.tableCell}>{p.payment_method || '-'}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No payments recorded yet.</Text>
              )}
            </Card>
          )}
          {activeTab === 'guarantors' && (
            <View>
              <Card title="Guarantor 1" style={styles.card}>
                <Text style={styles.label}>Name: <Text style={styles.value}>{guarantors.guarantor1_name || 'N/A'}</Text></Text>
                <Text style={styles.label}>NIC: <Text style={styles.value}>{guarantors.guarantor1_nic || 'N/A'}</Text></Text>
                <Text style={styles.label}>Mobile: <Text style={styles.value}>{guarantors.guarantor1_mobile || 'N/A'}</Text></Text>
                <Text style={styles.label}>Address: <Text style={styles.value}>{guarantors.guarantor1_address || 'N/A'}</Text></Text>
              </Card>
              <Card title="Guarantor 2" style={styles.card}>
                <Text style={styles.label}>Name: <Text style={styles.value}>{guarantors.guarantor2_name || 'N/A'}</Text></Text>
                <Text style={styles.label}>NIC: <Text style={styles.value}>{guarantors.guarantor2_nic || 'N/A'}</Text></Text>
                <Text style={styles.label}>Mobile: <Text style={styles.value}>{guarantors.guarantor2_mobile || 'N/A'}</Text></Text>
                <Text style={styles.label}>Address: <Text style={styles.value}>{guarantors.guarantor2_address || 'N/A'}</Text></Text>
              </Card>
            </View>
          )}
          {activeTab === 'penalties' && (
            <Card title="Penalty Charges" style={styles.card}>
              {penalties.length > 0 ? (
                <View>
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableHeader}>Installment #</Text>
                    <Text style={styles.tableHeader}>Due Date</Text>
                    <Text style={styles.tableHeader}>Days Overdue</Text>
                    <Text style={styles.tableHeader}>Outstanding</Text>
                    <Text style={styles.tableHeader}>Penalty</Text>
                    <Text style={styles.tableHeader}>Penalty Rate</Text>
                  </View>
                  {penalties.map((pen, idx) => (
                    <View key={pen.id || idx} style={styles.tableRowOverdue}>
                      <Text style={styles.tableCell}>{pen.installment_number ?? '-'}</Text>
                      <Text style={styles.tableCell}>{formatDate(pen.due_date || '')}</Text>
                      <Text style={styles.tableCell}>{pen.days_overdue ?? '-'}</Text>
                      <Text style={styles.tableCell}>{formatCurrency(typeof pen.outstanding_amount === 'number' ? pen.outstanding_amount : 0)}</Text>
                      <Text style={styles.tableCell}>{formatCurrency(typeof pen.penalty_amount === 'number' ? pen.penalty_amount : 0)}</Text>
                      <Text style={styles.tableCell}>{pen.penalty_rate || '36%/365 daily'}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No penalty charges recorded.</Text>
              )}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', margin: 10 },
  summaryCard: { flex: 1, margin: 4, marginTop: 30, borderWidth: 2, borderRadius: 8, padding: 10, backgroundColor: '#fff', alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#888' },
  summaryValue: { fontSize: 10, fontWeight: 'bold' },
  tabsRow: { flexDirection: 'row', marginVertical: 10, backgroundColor: '#e9ecef', borderRadius: 8, marginHorizontal: 10 },
  tabButton: { flex: 1, padding: 10, alignItems: 'center' },
  tabButtonActive: { backgroundColor: '#007AFF', borderRadius: 8 },
  tabLabel: { color: '#007AFF', fontWeight: 'bold' },
  tabLabelActive: { color: '#fff' },
  tabContent: { margin: 10 },
  card: { marginBottom: 15 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  value: { fontWeight: 'normal', color: '#333' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f1f1f1', padding: 6, borderRadius: 4 },
  tableHeader: { flex: 1, fontWeight: 'bold', color: '#007AFF', fontSize: 12 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableRowPaid: { backgroundColor: '#e6ffe6' },
  tableRowOverdue: { backgroundColor: '#ffe6e6' },
  tableCell: { flex: 1, fontSize: 12, padding: 3, color: '#333',},
  noDataText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
});

export default LoanDetailsScreen; 