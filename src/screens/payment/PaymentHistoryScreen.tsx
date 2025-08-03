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
import { cashierAPI, PaymentHistoryResponse } from '../../api/cashier';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import Button from '../../components/common/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import Loading from '../../components/common/Loading';

const PaymentHistoryScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [payments, setPayments] = useState<PaymentHistoryResponse['payments']>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<{ type: 'from' | 'to' | null, visible: boolean }>({ type: null, visible: false });

  useEffect(() => {
    fetchPayments(1);
    fetchDashboardData();
  }, []);

  const fetchPayments = async (page: number, filterDates?: { dateFrom?: string; dateTo?: string }) => {
    setIsLoading(true);
    try {
      const res = await cashierAPI.getPaymentHistory({
        page,
        per_page: 20,
        date_from: filterDates?.dateFrom || dateFrom || undefined,
        date_to: filterDates?.dateTo || dateTo || undefined,
      });
      setPayments(res.payments || []);
      setPagination({
        current_page: res.pagination.current_page,
        last_page: res.pagination.last_page,
        total: res.pagination.total,
      });
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      Alert.alert('Error', error.message || 'Failed to load payment history');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const data = await cashierAPI.getDashboardOverview();
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      // Set default dashboard data if API is not available
      setDashboardData({
        today_stats: { total_payments: 0, total_amount: 0 },
        month_stats: { total_payments: 0, total_amount: 0 }
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPayments(1);
    fetchDashboardData();
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
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading && !payments.length) {
    return <Loading text="Loading payment history..." fullScreen />;
  }

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <View style={styles.header}>
        <Text style={styles.title}>Payment History</Text>
        <Text style={styles.subtitle}>Your processed payments</Text>
      </View>

      {/* Dashboard Overview Card */}
      {dashboardData && (
        <Card title="Today's Overview" style={styles.dashboardCard}>
          <View style={styles.dashboardRow}>
            <View style={styles.dashboardItem}>
              <Text style={styles.dashboardLabel}>Today's Payments</Text>
              <Text style={styles.dashboardValue}>{dashboardData.today_stats?.total_payments || 0}</Text>
              <Text style={styles.dashboardAmount}>{formatCurrency(dashboardData.today_stats?.total_amount || 0)}</Text>
            </View>
            <View style={styles.dashboardItem}>
              <Text style={styles.dashboardLabel}>This Month</Text>
              <Text style={styles.dashboardValue}>{dashboardData.month_stats?.total_payments || 0}</Text>
              <Text style={styles.dashboardAmount}>{formatCurrency(dashboardData.month_stats?.total_amount || 0)}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Date Range Filter */}
      <Card title="Filter Payments" style={styles.filterCard}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterInput}
            onPress={() => setShowDatePicker({ type: 'from', visible: true })}
          >
            <Text style={styles.filterLabel}>From</Text>
            <Text style={styles.filterValue}>{dateFrom || 'Select Date'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterInput}
            onPress={() => setShowDatePicker({ type: 'to', visible: true })}
          >
            <Text style={styles.filterLabel}>To</Text>
            <Text style={styles.filterValue}>{dateTo || 'Select Date'}</Text>
          </TouchableOpacity>
        </View>
        <Button title="Apply Filter" onPress={handleApplyFilter} style={styles.filterButton} />
      </Card>

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
        <Card title={`Payments (${pagination.total})`} style={styles.card}>
          {payments.length === 0 ? (
            <Text style={styles.noDataText}>No payments found.</Text>
          ) : (
            <>
              {payments.map((payment, idx) => (
                <View key={payment.id || idx} style={styles.paymentItem}>
                  <View style={styles.paymentInfo}>
                    <Icon name="receipt" size={20} color="#007AFF" />
                    <View style={styles.paymentDetails}>
                      <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                      <Text style={styles.paymentDate}>{formatDate(payment.payment_date)}</Text>
                      <Text style={styles.paymentMethod}>{payment.payment_method?.toUpperCase()}</Text>
                      <Text style={styles.paymentLoan}>Loan: {payment.loan_id}</Text>
                      {payment.member && (
                        <Text style={styles.paymentMember}>Member: {payment.member.name}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.paymentBreakdown}>
                    <Text style={styles.breakdownText}>Interest: {formatCurrency(payment.interest_paid)}</Text>
                    <Text style={styles.breakdownText}>Capital: {formatCurrency(payment.capital_paid)}</Text>
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
            </>
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
  dashboardCard: { margin: 15, marginBottom: 10 },
  dashboardRow: { flexDirection: 'row', marginBottom: 15 },
  dashboardItem: { flex: 1, alignItems: 'center' },
  dashboardLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  dashboardValue: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  dashboardAmount: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  bulkPaymentCard: { 
    backgroundColor: '#f8f9fa', 
    borderRadius: 8, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#e9ecef' 
  },
  bulkPaymentContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  bulkPaymentText: { 
    flex: 1, 
    marginLeft: 12 
  },
  bulkPaymentTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  bulkPaymentSubtitle: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 2 
  },
  filterCard: { margin: 15, marginBottom: 10 },
  card: { marginBottom: 15 },
  filterRow: { flexDirection: 'row', marginBottom: 10 },
  filterInput: { 
    flex: 1, 
    marginRight: 8, 
    borderWidth: 1, 
    borderColor: '#C7C7CC', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    backgroundColor: '#fff' 
  },
  filterLabel: { fontSize: 12, color: '#333', marginBottom: 2 },
  filterValue: { fontSize: 14, color: '#007AFF', fontWeight: 'bold' },
  filterButton: { marginTop: 5 },
  noDataText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
  paymentItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 15, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#e9ecef' 
  },
  paymentInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  paymentDetails: { 
    marginLeft: 12, 
    flex: 1 
  },
  paymentAmount: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginBottom: 2 },
  paymentDate: { fontSize: 14, color: '#333', marginBottom: 2 },
  paymentMethod: { fontSize: 12, color: '#007AFF', fontWeight: '600', marginBottom: 2 },
  paymentLoan: { fontSize: 12, color: '#666', marginBottom: 2 },
  paymentMember: { fontSize: 12, color: '#666' },
  paymentBreakdown: { 
    alignItems: 'flex-end' 
  },
  breakdownText: { 
    fontSize: 11, 
    color: '#666', 
    marginBottom: 2 
  },
  loadMoreButton: { marginTop: 10 },
});

export default PaymentHistoryScreen; 