import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import { reportsAPI, PortfolioReportResponse, branchesAPI } from '../../api/reports';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

const loanTypes = [
  { label: 'All Types', value: '' },
  { label: 'Business Loan', value: 'BL' },
  { label: 'Micro Loan', value: 'ML' },
  { label: 'Leasing Loan', value: 'LL' },
];

const statuses = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Disbursed', value: 'disbursed' },
  { label: 'Settled', value: 'settled' },
];

const PortfolioReportScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const user = useSelector((state: RootState) => (state as RootState).auth.user);
  const [portfolio, setPortfolio] = useState<PortfolioReportResponse | null>(null);
  const [portfolioFilters, setPortfolioFilters] = useState({ 
    branch_id: '', 
    loan_type: '', 
    status: '', 
    date_from: '', 
    date_to: '', 
    credit_officer_name: '' 
  });
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{ type: 'from' | 'to' | null, visible: boolean }>({ type: null, visible: false });
  const [branchList, setBranchList] = useState<Array<{ id: number; branch_name: string }>>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  useEffect(() => {
    // Default credit_officer_name to logged-in user on mount
    if (user && !portfolioFilters.credit_officer_name) {
      setPortfolioFilters(f => ({ ...f, credit_officer_name: user.name }));
    }
    fetchPortfolio(true); // Reset to first page
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const fetchPortfolio = async (resetPage: boolean = false) => {
    if (resetPage) {
      setCurrentPage(1);
    }
    
    const pageToFetch = resetPage ? 1 : currentPage;
    
    setIsLoadingPortfolio(true);
    try {
      console.log('Fetching portfolio with filters:', {
        ...portfolioFilters,
        page: pageToFetch,
        credit_officer_name: portfolioFilters.credit_officer_name || (user ? user.name : undefined)
      });

      const res = await reportsAPI.getPortfolioReport({
        branch_id: portfolioFilters.branch_id ? Number(portfolioFilters.branch_id) : undefined,
        loan_type: portfolioFilters.loan_type as any,
        status: portfolioFilters.status,
        date_from: portfolioFilters.date_from,
        date_to: portfolioFilters.date_to,
        credit_officer_name: portfolioFilters.credit_officer_name || (user ? user.name : undefined),
        per_page: 20, // Increased per page to load more loans
        page: pageToFetch,
      });

      console.log('Portfolio response:', res);
      console.log('Loans data type:', typeof res.loans.data, 'Is array:', Array.isArray(res.loans.data));

      // Convert object data to array if needed
      const loansArray = Array.isArray(res.loans.data) 
        ? res.loans.data 
        : Object.values(res.loans.data) as PortfolioReportResponse['loans']['data'];
      
      console.log('Converted loans array length:', loansArray.length);

      if (resetPage) {
        setPortfolio({
          ...res,
          loans: {
            ...res.loans,
            data: loansArray
          }
        });
      } else {
        // Append new data to existing data
        setPortfolio(prev => {
          if (!prev) {
            return {
              ...res,
              loans: {
                ...res.loans,
                data: loansArray
              }
            };
          }
          
          const prevLoansArray = Array.isArray(prev.loans.data) 
            ? prev.loans.data 
            : Object.values(prev.loans.data) as PortfolioReportResponse['loans']['data'];
            
          return {
            ...res,
            loans: {
              ...res.loans,
              data: [...prevLoansArray, ...loansArray]
            }
          };
        });
      }

      // Check if there's more data
      setHasMoreData(pageToFetch < res.loans.last_page);
      
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
      Alert.alert('Error', error.message || 'Failed to load portfolio report');
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  const loadMoreLoans = () => {
    if (!isLoadingPortfolio && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPortfolioWithPage(nextPage);
    }
  };

  const fetchPortfolioWithPage = async (pageNumber: number) => {
    setIsLoadingPortfolio(true);
    try {
      console.log('Fetching portfolio page:', pageNumber, 'with filters:', {
        ...portfolioFilters,
        credit_officer_name: portfolioFilters.credit_officer_name || (user ? user.name : undefined)
      });

      const res = await reportsAPI.getPortfolioReport({
        branch_id: portfolioFilters.branch_id ? Number(portfolioFilters.branch_id) : undefined,
        loan_type: portfolioFilters.loan_type as any,
        status: portfolioFilters.status,
        date_from: portfolioFilters.date_from,
        date_to: portfolioFilters.date_to,
        credit_officer_name: portfolioFilters.credit_officer_name || (user ? user.name : undefined),
        per_page: 20,
        page: pageNumber,
      });

      console.log('Portfolio response for page', pageNumber, ':', res);
      console.log('Page', pageNumber, 'loans data type:', typeof res.loans.data, 'Is array:', Array.isArray(res.loans.data));

      // Convert object data to array if needed
      const loansArray = Array.isArray(res.loans.data) 
        ? res.loans.data 
        : Object.values(res.loans.data) as PortfolioReportResponse['loans']['data'];
      
      console.log('Page', pageNumber, 'converted loans array length:', loansArray.length);

      // Append new data to existing data
      setPortfolio(prev => {
        if (!prev) {
          return {
            ...res,
            loans: {
              ...res.loans,
              data: loansArray
            }
          };
        }
        
        const prevLoansArray = Array.isArray(prev.loans.data) 
          ? prev.loans.data 
          : Object.values(prev.loans.data) as PortfolioReportResponse['loans']['data'];
          
        const newData = {
          ...res,
          loans: {
            ...res.loans,
            data: [...prevLoansArray, ...loansArray]
          }
        };
        console.log(`Page ${pageNumber}: Added ${loansArray.length} new loans. Total loans now: ${newData.loans.data.length}`);
        return newData;
      });

      // Check if there's more data
      setHasMoreData(pageNumber < res.loans.last_page);
      
    } catch (error: any) {
      console.error('Error fetching portfolio page', pageNumber, ':', error);
      Alert.alert('Error', error.message || 'Failed to load more loans');
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setPortfolioFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchPortfolio(true); // Reset to first page when applying filters
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderLoanItem = (loan: any, index: number) => (
    <TouchableOpacity
      key={`${loan.loan_id}-${index}`}
      style={styles.loanItem}
      onPress={() => navigation.navigate('LoanDetails', { loanId: loan.loan_id })}
    >
      <View style={styles.loanInfo}>
        <Text style={styles.loanId}>{loan.loan_id}</Text>
        <Text style={styles.loanMember}>{loan.member_name}</Text>
        <Text style={styles.loanAmount}>{formatCurrency(loan.loan_amount)}</Text>
        <Text style={[styles.loanStatus, { 
          color: loan.status === 'settled' ? '#28a745' : 
                 loan.status === 'disbursed' ? '#007bff' : 
                 loan.status === 'approved' ? '#ffc107' : '#dc3545' 
        }]}>{loan.status}</Text>
      </View>
      <Icon name="arrow" size={16} color="#007AFF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Icon name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Portfolio Report</Text>
      </View>
      
      <ScrollView 
        style={styles.content} 
        refreshControl={
          <RefreshControl 
            refreshing={isLoadingPortfolio && currentPage === 1} 
            onRefresh={() => fetchPortfolio(true)} 
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && !isLoadingPortfolio && hasMoreData) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchPortfolioWithPage(nextPage);
          }
        }}
        scrollEventThrottle={400}
      >
        <Card title="Portfolio Report Filters" style={styles.card}>
          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Branch</Text>
              {isLoadingBranches ? (
                <Text>Loading branches...</Text>
              ) : (
                <Picker
                  selectedValue={String(portfolioFilters.branch_id)}
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
                selectedValue={String(portfolioFilters.loan_type)}
                onValueChange={(v: string) => handleFilterChange('loan_type', v)}
                style={styles.picker}
              >
                {loanTypes.map(l => (
                  <Picker.Item key={l.value} label={l.label} value={l.value} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Status</Text>
              <Picker
                selectedValue={String(portfolioFilters.status)}
                onValueChange={(v: string) => handleFilterChange('status', v)}
                style={styles.picker}
              >
                {statuses.map(s => (
                  <Picker.Item key={s.value} label={s.label} value={s.value} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={[styles.filterInput, { justifyContent: 'center', flex: 1 }]}
              onPress={() => setShowDatePicker({ type: 'from', visible: true })}
            >
              <Input
                label="From"
                placeholder="YYYY-MM-DD"
                value={portfolioFilters.date_from}
                disabled={true}
                onChangeText={() => {}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterInput, { justifyContent: 'center', flex: 1 }]}
              onPress={() => setShowDatePicker({ type: 'to', visible: true })}
            >
              <Input
                label="To"
                placeholder="YYYY-MM-DD"
                value={portfolioFilters.date_to}
                disabled={true}
                onChangeText={() => {}}
              />
            </TouchableOpacity>
          </View>
          
          {showDatePicker.visible && (
            <DateTimePicker
              value={
                showDatePicker.type === 'from'
                  ? (portfolioFilters.date_from ? new Date(portfolioFilters.date_from) : new Date())
                  : (portfolioFilters.date_to ? new Date(portfolioFilters.date_to) : new Date())
              }
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker({ type: null, visible: false });
                if (event.type === 'set' && selectedDate) {
                  const dateStr = selectedDate.toISOString().split('T')[0];
                  if (showDatePicker.type === 'from') {
                    handleFilterChange('date_from', dateStr);
                  } else if (showDatePicker.type === 'to') {
                    handleFilterChange('date_to', dateStr);
                  }
                }
              }}
            />
          )}
          
          <View style={styles.filterRow}>
            <Input 
              style={styles.filterInput} 
              label="Credit Officer" 
              placeholder="Credit Officer" 
              value={portfolioFilters.credit_officer_name} 
              onChangeText={v => handleFilterChange('credit_officer_name', v)} 
            />
          </View>
          
          <Button title="Apply Filters" onPress={applyFilters} style={styles.filterButton} />
        </Card>

        {portfolio && (
          <>
            <Card title="Portfolio Summary" style={styles.card}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Total Loans: {portfolio.summary.total_loans}</Text>
                <Text style={styles.summaryText}>Total Amount: {formatCurrency(portfolio.summary.total_amount)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Outstanding: {formatCurrency(portfolio.summary.total_outstanding)}</Text>
                <Text style={styles.summaryText}>Avg Interest: {portfolio.summary.average_interest_rate}%</Text>
              </View>
            </Card>

            <Card title="Loans" style={styles.card}>
              {Array.isArray(portfolio?.loans?.data) && portfolio.loans.data.length > 0 ? (
                <>
                  <View style={styles.paginationInfo}>
                    <Text style={styles.paginationText}>
                      Showing {portfolio.loans.data.length} of {portfolio.summary.total_loans} loans
                    </Text>
                    <Text style={styles.paginationText}>
                      Page {currentPage} of {portfolio.loans.last_page}
                    </Text>
                  </View>
                  {portfolio.loans.data.map((loan, idx) => renderLoanItem(loan, idx))}
                  {hasMoreData && (
                    <TouchableOpacity 
                      style={styles.loadMoreButton} 
                      onPress={loadMoreLoans}
                      disabled={isLoadingPortfolio}
                    >
                      <Text style={styles.loadMoreText}>
                        {isLoadingPortfolio ? 'Loading...' : `Load More Loans (Page ${currentPage + 1})`}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {isLoadingPortfolio && currentPage > 1 && (
                    <Text style={styles.loadingText}>Loading more loans...</Text>
                  )}
                </>
              ) : (
                <Text style={styles.noDataText}>No loans found with the current filters.</Text>
              )}
            </Card>
          </>
        )}

        {!portfolio && !isLoadingPortfolio && (
          <Card title="No Data" style={styles.card}>
            <Text style={styles.noDataText}>No portfolio data available.</Text>
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    minHeight: 60,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  content: { flex: 1, padding: 15 },
  card: { marginBottom: 15 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  pickerWrapper: { flex: 1, marginRight: 8, borderWidth: 1, borderColor: '#C7C7CC', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#fff', minWidth: 120 },
  pickerLabel: { fontSize: 12, color: '#333', marginBottom: 2 },
  picker: { minWidth: 100, height: 50 },
  filterInput: { flex: 1, marginRight: 8 },
  filterButton: { marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  summaryText: { fontSize: 14, color: '#333', fontWeight: '600' },
  noDataText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  loanItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: '#e9ecef' 
  },
  loanInfo: { flex: 1 },
  loanId: { fontSize: 14, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  loanMember: { fontSize: 14, color: '#333', marginBottom: 2 },
  loanAmount: { fontSize: 14, color: '#28a745', fontWeight: '600', marginBottom: 2 },
  loanStatus: { fontSize: 12, fontWeight: '600' },
  loadMoreButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default PortfolioReportScreen; 