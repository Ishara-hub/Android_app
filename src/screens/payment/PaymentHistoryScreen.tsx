import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { paymentsAPI } from '../../api/payments';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import Button from '../../components/common/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const PaymentHistoryScreen: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<{ type: 'from' | 'to' | null, visible: boolean }>({ type: null, visible: false });

  useEffect(() => {
    fetchPayments(1);
  }, []);

  const fetchPayments = async (page: number, filterDates?: { dateFrom?: string; dateTo?: string }) => {
    setIsLoading(true);
    try {
      const res = await paymentsAPI.getPaymentHistory({
        page,
        per_page: 20,
        date_from: filterDates?.dateFrom || dateFrom || undefined,
        date_to: filterDates?.dateTo || dateTo || undefined,
      });
      setPayments(res.data || res.payments?.data || []);
      setPagination({
        current_page: res.current_page || res.payments?.current_page || 1,
        last_page: res.last_page || res.payments?.last_page || 1,
      });
      setSummary(res.statistics || res.summary || null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load payment history');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPayments(1);
  };

  const handleLoadMore = () => {
    if (pagination.current_page < pagination.last_page) {
      fetchPayments(pagination.current_page + 1);
    }
  };

  const handleApplyFilter = () => {
    fetchPayments(1, { dateFrom, dateTo });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RS',
    }).format(amount);
  };

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <View style={styles.header}>
        <Text style={styles.title}>Payment History</Text>
        <Text style={styles.subtitle}>Your processed payments</Text>
      </View>
      {/* Date Range Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterInput}
          onPress={() => setShowDatePicker({ type: 'from', visible: true })}
        >
          <Text style={styles.filterLabel}>From</Text>
          <Text style={styles.filterValue}>{dateFrom || 'YYYY-MM-DD'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterInput}
          onPress={() => setShowDatePicker({ type: 'to', visible: true })}
        >
          <Text style={styles.filterLabel}>To</Text>
          <Text style={styles.filterValue}>{dateTo || 'YYYY-MM-DD'}</Text>
        </TouchableOpacity>
        <Button title="Apply Filter" onPress={handleApplyFilter} style={styles.filterButton} />
      </View>
      {showDatePicker.visible && (
        <DateTimePicker
          value={showDatePicker.type === 'from'
            ? (dateFrom ? new Date(dateFrom) : new Date())
            : (dateTo ? new Date(dateTo) : new Date())}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker({ type: null, visible: false });
            if (event.type === 'set' && selectedDate) {
              const dateStr = selectedDate.toISOString().split('T')[0];
              if (showDatePicker.type === 'from') {
                setDateFrom(dateStr);
              } else if (showDatePicker.type === 'to') {
                setDateTo(dateStr);
              }
            }
          }}
        />
      )}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <Card title="Summary" style={styles.card}>
          {summary ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Total Payments: {summary.total_payments}</Text>
              <Text style={styles.summaryText}>Total Paid: {formatCurrency(summary.total_amount_paid)}</Text>
              <Text style={styles.summaryText}>This Month: {summary.this_month_payments} ({formatCurrency(summary.this_month_amount)})</Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>No summary available.</Text>
          )}
        </Card>
        <Card title="Payments" style={styles.card}>
          {payments.length === 0 && <Text style={styles.noDataText}>No payments found.</Text>}
          {payments.map((payment, idx) => (
            <View key={payment.id || idx} style={styles.paymentItem}>
              <View style={styles.paymentInfo}>
                <Icon name="receipt" size={20} color="#007AFF" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                  <Text style={styles.paymentDate}>{payment.payment_date}</Text>
                  <Text style={styles.paymentMethod}>{payment.payment_method}</Text>
                  <Text style={styles.paymentLoan}>Loan: {payment.loan_id}</Text>
                </View>
              </View>
            </View>
          ))}
          {pagination.current_page < pagination.last_page && (
            <Button
              title="Load More"
              onPress={handleLoadMore}
              style={styles.loadMoreButton}
            />
          )}
        </Card>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, backgroundColor: '#007AFF' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  content: { flex: 1, padding: 15 },
  card: { marginBottom: 15 },
  summaryRow: { flexDirection: 'column', gap: 4, marginBottom: 8 },
  summaryText: { fontSize: 14, color: '#333', fontWeight: '600' },
  noDataText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  paymentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e9ecef' },
  paymentInfo: { flexDirection: 'row', alignItems: 'center' },
  paymentAmount: { fontSize: 16, fontWeight: 'bold', color: '#28a745' },
  paymentDate: { fontSize: 14, color: '#333' },
  paymentMethod: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  paymentLoan: { fontSize: 12, color: '#888' },
  loadMoreButton: { marginTop: 10 },
  filterRow: { flexDirection: 'row', alignItems: 'center', margin: 10 },
  filterInput: { flex: 1, marginRight: 8, borderWidth: 1, borderColor: '#C7C7CC', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#fff', minWidth: 120 },
  filterLabel: { fontSize: 12, color: '#333', marginBottom: 2 },
  filterValue: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  filterButton: { marginLeft: 8 },
});

export default PaymentHistoryScreen; 