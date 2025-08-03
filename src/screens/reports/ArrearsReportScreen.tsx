import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import { reportsAPI, branchesAPI, ArrearsReportResponse } from '../../api/reports';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import Loading from '../../components/common/Loading';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loanTypes = [
  { label: 'All Types', value: '' },
  { label: 'Business Loan', value: 'BL' },
  { label: 'Micro Loan', value: 'ML' },
  { label: 'Leasing Loan', value: 'LL' },
];

const daysOverdueOptions = [
  { label: 'All Overdue', value: '' },
  { label: '30+ Days', value: '30' },
  { label: '60+ Days', value: '60' },
  { label: '90+ Days', value: '90' },
  { label: '120+ Days', value: '120' },
];

type ArrearsData = ArrearsReportResponse['arrears'][0];

const ArrearsReportScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [arrears, setArrears] = useState<ArrearsReportResponse | null>(null);
  const [arrearsFilters, setArrearsFilters] = useState({ 
    branch_id: '', 
    loan_type: '', 
    days_overdue: '', 
    date_as_of: '',
    credit_officer_name: ''
  });
  const [isLoadingArrears, setIsLoadingArrears] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{ visible: boolean }>({ visible: false });
  const [branchList, setBranchList] = useState<Array<{ id: number; branch_name: string }>>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  useEffect(() => {
    fetchArrears();
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const branches = await branchesAPI.getBranches();
      setBranchList(branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranchList([]);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const fetchArrears = async () => {
    setIsLoadingArrears(true);
    try {
      console.log('Fetching arrears with filters:', arrearsFilters);

      const res = await reportsAPI.getArrearsReport({
        branch_id: arrearsFilters.branch_id ? Number(arrearsFilters.branch_id) : undefined,
        loan_type: arrearsFilters.loan_type || undefined,
        days_overdue: arrearsFilters.days_overdue ? Number(arrearsFilters.days_overdue) : undefined,
        date_as_of: arrearsFilters.date_as_of || undefined,
        credit_officer: arrearsFilters.credit_officer_name || undefined,
        per_page: 50,
        page: 1,
      });

      console.log('Arrears response:', res);
      setArrears(res);
      
    } catch (error: any) {
      console.error('Error fetching arrears:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to load arrears report';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error (500): Backend service unavailable. Please check server logs.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoadingArrears(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setArrearsFilters(f => ({ ...f, [key]: value }));
  };

  const applyFilters = () => {
    fetchArrears();
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      console.log('=== Auth Debug Info ===');
      console.log('Token exists:', !!token);
      console.log('Token length:', token ? token.length : 0);
      console.log('User data exists:', !!userData);
      
      if (token) {
        console.log('Token preview:', token.substring(0, 50) + '...');
      }
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User info:', user);
      }
      
      Alert.alert(
        'Auth Status', 
        `Token: ${token ? 'Present' : 'Missing'}\nUser: ${userData ? 'Present' : 'Missing'}`
      );
    } catch (error) {
      console.error('Auth check error:', error);
      Alert.alert('Error', 'Failed to check auth status');
    }
  };

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

  const renderArrearsItem = (item: ArrearsData, index: number) => (
    <TouchableOpacity
      key={`${item.loan_id}-${item.max_days_overdue}-${index}`}
      style={styles.loanItem}
      onPress={() => navigation.navigate('LoanDetails', { loanId: item.loan_id })}
    >
      <View style={styles.loanHeader}>
        <Text style={styles.loanId}>{item.loan_id}</Text>
        <View style={styles.overdueBadge}>
          <Text style={styles.overdueText}>
            {item.max_days_overdue} days overdue
          </Text>
        </View>
      </View>
      
      <View style={styles.loanDetails}>
        <Text style={styles.loanMember}>{item.member_name}</Text>
        <Text style={styles.loanNIC}>{item.member_nic}</Text>
      </View>
      
      <View style={styles.loanInfo}>
        <Text style={styles.loanAmount}>
          Amount: {formatCurrency(item.loan_amount)}
        </Text>
        <Text style={styles.totalDue}>
          Due: {formatCurrency(item.total_arrears)}
        </Text>
      </View>
      
      <View style={styles.loanMeta}>
        <Text style={styles.dueDate}>
          Installments: {item.installment_count}
        </Text>
        <Text style={styles.branchName}>{item.branch_name}</Text>
      </View>
      
      <View style={styles.loanFooter}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.creditOfficer}>{item.credit_officer_name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoadingArrears && !arrears) {
    return <Loading text="Loading arrears report..." fullScreen />;
  }

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Icon name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Arrears Report</Text>
        <TouchableOpacity onPress={checkAuthStatus} style={{ marginLeft: 'auto' }}>
          <Text style={styles.debugButton}>Debug</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content} 
        refreshControl={
          <RefreshControl 
            refreshing={isLoadingArrears} 
            onRefresh={fetchArrears} 
          />
        }
      >
        <Card title="Arrears Report Filters" style={styles.card}>
          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Branch</Text>
              {isLoadingBranches ? (
                <Text>Loading branches...</Text>
              ) : (
                <Picker
                  selectedValue={String(arrearsFilters.branch_id)}
                  onValueChange={(v: string) => handleFilterChange('branch_id', v)}
                  style={styles.picker}
                >
                  <Picker.Item key="" label="All Branches" value="" />
                  {branchList.map(b => (
                    <Picker.Item key={b.id} label={b.branch_name} value={String(b.id)} />
                  ))}
                </Picker>
              )}
            </View>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Loan Type</Text>
              <Picker
                selectedValue={String(arrearsFilters.loan_type)}
                onValueChange={(v: string) => handleFilterChange('loan_type', v)}
                style={styles.picker}
              >
                {loanTypes.map(type => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Days Overdue</Text>
              <Picker
                selectedValue={String(arrearsFilters.days_overdue)}
                onValueChange={(v: string) => handleFilterChange('days_overdue', v)}
                style={styles.picker}
              >
                {daysOverdueOptions.map(option => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>As of Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker({ visible: true })}
              >
                <Text style={styles.datePickerText}>
                  {arrearsFilters.date_as_of || 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Credit Officer</Text>
              <Picker
                selectedValue={String(arrearsFilters.credit_officer_name)}
                onValueChange={(v: string) => handleFilterChange('credit_officer_name', v)}
                style={styles.picker}
              >
                <Picker.Item key="" label="All Officers" value="" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </Card>

        {arrears && (
          <>
            {/* Summary Section */}
            <Card title="Summary" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Loans in Arrears</Text>
                  <Text style={styles.summaryValue}>
                    {arrears.summary?.total_loans_in_arrears || 0}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Due</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(arrears.summary?.total_amount_due)}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Avg Days Overdue</Text>
                  <Text style={styles.summaryValue}>
                    {arrears.summary?.average_days_overdue || 0} days
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Paid</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(arrears.summary?.total_paid_amount)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Arrears List */}
            <Card title="Overdue Loans" style={styles.listCard}>
              {(() => {
                const arrearsData = arrears.arrears;
                
                if (!arrearsData || !Array.isArray(arrearsData)) {
                  return (
                    <Text style={styles.noDataText}>
                      No arrears data available or data structure is invalid.
                    </Text>
                  );
                }

                const overdueRows = arrearsData.filter(row => 
                  row.max_days_overdue > 0
                );

                if (overdueRows.length === 0) {
                  return (
                    <Text style={styles.noDataText}>
                      No overdue loans found.
                    </Text>
                  );
                }

                return (
                  <>
                    {overdueRows.map((item, idx) => renderArrearsItem(item, idx))}
                  </>
                );
              })()}
            </Card>
          </>
        )}

        {showDatePicker.visible && (
          <DateTimePicker
            value={arrearsFilters.date_as_of ? new Date(arrearsFilters.date_as_of) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker({ visible: false });
              if (selectedDate) {
                handleFilterChange('date_as_of', selectedDate.toISOString().split('T')[0]);
              }
            }}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  pickerWrapper: {
    flex: 1,
    marginRight: 10,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  datePickerButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listCard: {
    marginBottom: 15,
  },
  loanItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  loanId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  overdueBadge: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loanDetails: {
    marginBottom: 10,
  },
  loanMember: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  loanNIC: {
    fontSize: 12,
    color: '#666',
  },
  loanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  loanAmount: {
    fontSize: 14,
    color: '#333',
  },
  totalDue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc3545',
  },
  loanMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  branchName: {
    fontSize: 12,
    color: '#666',
  },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 12,
    color: '#666',
  },
  creditOfficer: {
    fontSize: 12,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
    padding: 20,
  },
  debugButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ArrearsReportScreen; 