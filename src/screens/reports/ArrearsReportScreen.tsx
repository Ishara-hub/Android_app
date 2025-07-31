import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { reportsAPI, ArrearsReportResponse } from '../../api/reports';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../components/common/Icon';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import Loading from '../../components/common/Loading';

const ArrearsReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [arrears, setArrears] = useState<ArrearsReportResponse | null>(null);
  const [arrearsFilters, setArrearsFilters] = useState({ 
    branch_id: '', 
    loan_type: '', 
    days_overdue: '', 
    date_as_of: '' 
  });
  const [isLoadingArrears, setIsLoadingArrears] = useState(false);

  useEffect(() => {
    fetchArrears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchArrears = async () => {
    setIsLoadingArrears(true);
    try {
      console.log('Fetching arrears with filters:', arrearsFilters);
      
      const res = await reportsAPI.getArrearsReport({
        branch_id: arrearsFilters.branch_id ? Number(arrearsFilters.branch_id) : undefined,
        loan_type: arrearsFilters.loan_type || undefined,
        days_overdue: arrearsFilters.days_overdue ? Number(arrearsFilters.days_overdue) : undefined,
        date_as_of: arrearsFilters.date_as_of || undefined,
        per_page: 20,
      });
      
      console.log('Arrears response:', JSON.stringify(res, null, 2));
      setArrears(res);
    } catch (error: any) {
      console.error('Arrears fetch error:', error);
      Alert.alert('Error', error.message || 'Failed to load arrears report');
    } finally {
      setIsLoadingArrears(false);
    }
  };

  const formatCurrency = (amount: number | string | null | undefined): string => {
    const num = Number(amount) || 0;
    return `Rs. ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

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
      </View>
      
      <ScrollView 
        style={styles.content} 
        refreshControl={
          <RefreshControl refreshing={isLoadingArrears} onRefresh={fetchArrears} />
        }
      >
        <Card title="Arrears Report Filters" style={styles.card}>
          <View style={styles.filterRow}>
            <Input 
              style={styles.filterInput} 
              label="Branch ID" 
              placeholder="Enter branch ID" 
              value={arrearsFilters.branch_id} 
              onChangeText={v => setArrearsFilters(f => ({ ...f, branch_id: v }))} 
            />
            <Input 
              style={styles.filterInput} 
              label="Loan Type" 
              placeholder="BL, ML, LL" 
              value={arrearsFilters.loan_type} 
              onChangeText={v => setArrearsFilters(f => ({ ...f, loan_type: v }))} 
            />
          </View>
          <View style={styles.filterRow}>
            <Input 
              style={styles.filterInput} 
              label="Days Overdue" 
              placeholder="30" 
              value={arrearsFilters.days_overdue} 
              onChangeText={v => setArrearsFilters(f => ({ ...f, days_overdue: v }))} 
            />
            <Input 
              style={styles.filterInput} 
              label="As of Date" 
              placeholder="YYYY-MM-DD" 
              value={arrearsFilters.date_as_of} 
              onChangeText={v => setArrearsFilters(f => ({ ...f, date_as_of: v }))} 
            />
          </View>
          <Button 
            title="Apply Filters" 
            onPress={fetchArrears} 
            style={styles.filterButton}
            loading={isLoadingArrears}
          />
        </Card>

        {arrears && (
          <>
            {/* Summary Section */}
            <Card title="Summary" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Arrears</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(arrears.summary?.total_arrears)}
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
                  <Text style={styles.summaryLabel}>Total Records</Text>
                  <Text style={styles.summaryValue}>
                    {arrears.arrears?.total || 0}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Arrears List */}
            <Card title="Overdue Installments" style={styles.listCard}>
              {(() => {
                const arrearsData = arrears.arrears?.data;
                
                if (!arrearsData || !Array.isArray(arrearsData)) {
                  return (
                    <Text style={styles.noDataText}>
                      No arrears data available or data structure is invalid.
                    </Text>
                  );
                }

                const overdueRows = arrearsData.filter(row => 
                  row.days_overdue > 0
                );

                if (overdueRows.length === 0) {
                  return (
                    <Text style={styles.noDataText}>
                      No overdue installments found.
                    </Text>
                  );
                }

                return overdueRows.map((item, idx) => (
                  <View key={`${item.loan_id}-${item.due_date}-${idx}`} style={styles.loanItem}>
                    <View style={styles.loanHeader}>
                      <Text style={styles.loanId}>{item.loan_id}</Text>
                      <Text style={styles.overdueBadge}>
                        {item.days_overdue} days overdue
                      </Text>
                    </View>
                    
                    <View style={styles.loanDetails}>
                      <Text style={styles.loanMember}>{item.member_name}</Text>
                      <Text style={styles.loanNIC}>{item.member_nic}</Text>
                    </View>
                    
                    <View style={styles.loanInfo}>
                      <Text style={styles.loanAmount}>
                        Amount: {formatCurrency(item.loan_amount)}
                      </Text>
                      <Text style={styles.dueDate}>
                        Due: {formatDate(item.due_date)}
                      </Text>
                    </View>
                    
                    <View style={styles.loanMeta}>
                      <Text style={styles.branchName}>{item.branch_name}</Text>
                      <Text style={styles.productName}>{item.product_name}</Text>
                    </View>
                  </View>
                ));
              })()}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#007AFF' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 5 
  },
  content: { 
    flex: 1, 
    padding: 15 
  },
  card: { 
    marginBottom: 15 
  },
  summaryCard: {
    marginBottom: 15,
  },
  listCard: {
    marginBottom: 15,
  },
  filterRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  filterInput: { 
    flex: 1, 
    marginRight: 8 
  },
  filterButton: { 
    marginTop: 8 
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: { 
    fontSize: 12, 
    color: '#666', 
    marginBottom: 4 
  },
  summaryValue: { 
    fontSize: 16, 
    color: '#333', 
    fontWeight: 'bold' 
  },
  noDataText: { 
    color: '#888', 
    fontStyle: 'italic', 
    textAlign: 'center', 
    marginVertical: 20,
    fontSize: 16
  },
  loanItem: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: '#e9ecef' 
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loanId: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#007AFF' 
  },
  overdueBadge: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '600',
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loanDetails: {
    marginBottom: 8,
  },
  loanMember: { 
    fontSize: 14, 
    color: '#333', 
    fontWeight: '500' 
  },
  loanNIC: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loanInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  loanAmount: { 
    fontSize: 14, 
    color: '#28a745', 
    fontWeight: '500' 
  },
  dueDate: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '500',
  },
  loanMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  branchName: {
    fontSize: 12,
    color: '#666',
  },
  productName: {
    fontSize: 12,
    color: '#666',
  },
});

export default ArrearsReportScreen; 