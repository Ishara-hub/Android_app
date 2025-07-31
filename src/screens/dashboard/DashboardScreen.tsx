import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { getDashboardOverview, clearDashboardError } from '../../store/paymentSlice';
import Loading from '../../components/common/Loading';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { logout } from '../../store/authSlice';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const DashboardScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { dashboardData, isLoadingDashboard, dashboardError } = useSelector(
    (state: RootState) => state.payment
  );
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (dashboardError) {
      Alert.alert('Error', dashboardError);
      dispatch(clearDashboardError());
    }
  }, [dashboardError]);

  const loadDashboard = () => {
    dispatch<any>(getDashboardOverview());
  };

  const handleRefresh = () => {
    loadDashboard();
  };

  const navigateToScreen = (screen: string) => {
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    dispatch<any>(logout());
  };

  if (isLoadingDashboard && !dashboardData) {
    return <Loading text="Loading dashboard..." fullScreen />;
  }

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoadingDashboard} onRefresh={handleRefresh} />
        }
      >
      {/* Top Bar: User Info and Logout */}
      
      <View style={styles.header}>
        <Text style={styles.title}>Origin Credit (Pvt) Ltd</Text>
        <Text style={styles.subtitle}>Payment Mobile System - FAFGEN (0717614883)</Text>
      </View>
      <View style={styles.topBar}>
        <View style={styles.userRow}>
          <Text style={styles.userText}>Welcome, {user?.name || 'User'}!</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="log-out" size={22} color="#007AFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToScreen('SearchLoan')}
        >
          <Icon name="search" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Search Loan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToScreen('PaymentHistory')}
        >
          <Icon name="receipt" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Payment History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToScreen('Members')}
        >
          <Icon name="people" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Members</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToScreen('Reports')}
        >
          <Icon name="bar-chart" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Statistics */}
      {dashboardData?.today_stats && (
        <Card title="Today's Statistics" style={styles.card}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData.today_stats.payments_count}</Text>
              <Text style={styles.statLabel}>Payments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                Rs.{dashboardData.today_stats.payments_amount.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Amount</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                Rs.{dashboardData.today_stats.average_payment.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Month's Statistics */}
      {dashboardData?.month_stats && (
        <Card title="This Month" style={styles.card}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData.month_stats.payments_count}</Text>
              <Text style={styles.statLabel}>Payments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                Rs.{dashboardData.month_stats.payments_amount.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Amount</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                Rs.{dashboardData.month_stats.average_payment.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Loans Overview */}
      {dashboardData?.loans && (
        <Card title="Loans Overview" style={styles.card}>
          <View style={styles.loanStats}>
            <View style={styles.loanType}>
              <Text style={styles.loanTypeLabel}>Business Loans</Text>
              <Text style={styles.loanTypeValue}>{dashboardData.loans.business_loans}</Text>
              <Text style={styles.loanTypeAmount}>
                Rs.{dashboardData.loans.business_loan_amount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.loanType}>
              <Text style={styles.loanTypeLabel}>Micro Loans</Text>
              <Text style={styles.loanTypeValue}>{dashboardData.loans.micro_loans}</Text>
              <Text style={styles.loanTypeAmount}>
                Rs.{dashboardData.loans.micro_loan_amount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.loanType}>
              <Text style={styles.loanTypeLabel}>Lease Loans</Text>
              <Text style={styles.loanTypeValue}>{dashboardData.loans.lease_loans}</Text>
              <Text style={styles.loanTypeAmount}>
                Rs.{dashboardData.loans.lease_loan_amount.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.totalLoans}>
            <Text style={styles.totalLabel}>Total Loans</Text>
            <Text style={styles.totalValue}>{dashboardData.loans.total_loans}</Text>
            <Text style={styles.totalAmount}>
              Rs.{dashboardData.loans.total_amount.toLocaleString()}
            </Text>
          </View>
        </Card>
      )}

      {/* Members Overview */}
      {dashboardData?.members && (
        <Card title="Members Overview" style={styles.card}>
          <View style={styles.memberStats}>
            <View style={styles.memberStat}>
              <Text style={styles.memberStatValue}>{dashboardData.members.total_members}</Text>
              <Text style={styles.memberStatLabel}>Total Members</Text>
            </View>
            <View style={styles.memberStat}>
              <Text style={styles.memberStatValue}>{dashboardData.members.active_members}</Text>
              <Text style={styles.memberStatLabel}>Active Members</Text>
            </View>
            <View style={styles.memberStat}>
              <Text style={styles.memberStatValue}>{dashboardData.members.inactive_members}</Text>
              <Text style={styles.memberStatLabel}>Inactive Members</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Recent Activities */}
      {dashboardData?.recent_activities && (
        <Card title="Recent Activities" style={styles.card}>
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Payments</Text>
            {dashboardData.recent_activities.recent_payments?.length > 0 ? (
              dashboardData.recent_activities.recent_payments.slice(0, 3).map((payment: any, index: number) => (
                <View key={index} style={styles.recentItem}>
                  <Text style={styles.recentItemText}>
                    Rs.{payment.amount?.toLocaleString()} - {payment.member_name}
                  </Text>
                  <Text style={styles.recentItemDate}>{payment.payment_date}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No recent payments</Text>
            )}
          </View>
        </Card>
      )}
    </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
    backgroundColor: '#f5f5f5',

  },
  
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  userText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  logoutButton: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { marginLeft: 5, color: '#007AFF', fontWeight: 'bold' },
  header: {
    padding: 30,
    backgroundColor: 'rgba(19, 134, 150, 0.8)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: '1%',
  },
  actionText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    margin: 15,
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loanStats: {
    marginBottom: 15,
  },
  loanType: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  loanTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 2,
  },
  loanTypeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    flex: 1,
    textAlign: 'center',
  },
  loanTypeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    flex: 2,
    textAlign: 'right',
  },
  totalLoans: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberStat: {
    alignItems: 'center',
    flex: 1,
  },
  memberStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  memberStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recentSection: {
    marginTop: 10,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentItemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  recentItemDate: {
    fontSize: 12,
    color: '#666',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default DashboardScreen; 