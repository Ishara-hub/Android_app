import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { reportsAPI } from '../../api/reports';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const SearchLoanReportScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Please enter a loan ID or NIC number');
      return;
    }

    setIsSearching(true);
    try {
      // Search for loans using the reports API
      const response = await reportsAPI.searchLoans(searchTerm.trim());
      setSearchResults(response);
      setShowResults(true);
      
      // Add to search history
      if (!searchHistory.includes(searchTerm.trim())) {
        setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 9)]);
      }
    } catch (error: any) {
      Alert.alert('Search Error', error.message || 'No loans found');
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryItemPress = async (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    try {
      const response = await reportsAPI.searchLoans(term);
      setSearchResults(response);
      setShowResults(true);
    } catch (error: any) {
      Alert.alert('Search Error', error.message || 'No loans found');
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleViewLoanDetails = (loanId: string) => {
    console.log('Navigating to LoanDetails with loanId:', loanId);
    try {
      navigation.navigate('LoanDetails', { loanId });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to loan details');
    }
  };

  const formatSearchTerm = (term: string) => {
    if (term.length > 20) {
      return term.substring(0, 20) + '...';
    }
    return term;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'settled': return '#28a745';
      case 'disbursed': return '#007bff';
      case 'approved': return '#ffc107';
      case 'pending': return '#6c757d';
      default: return '#dc3545';
    }
  };

  const renderSearchResult = (loan: any, index: number) => (
    <TouchableOpacity
      key={`${loan.loan_id}-${index}`}
      style={styles.loanItem}
      onPress={() => handleViewLoanDetails(loan.loan_id)}
    >
      <View style={styles.loanInfo}>
        <View style={styles.loanHeader}>
          <Text style={styles.loanId}>{loan.loan_id}</Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.loanType, { backgroundColor: getLoanTypeColor(loan.loan_type) }]}>
              {loan.loan_type || 'Unknown'}
            </Text>
            <Text style={[styles.loanStatus, { color: getStatusColor(loan.status) }]}>
              {loan.status}
            </Text>
          </View>
        </View>
        <Text style={styles.loanMember}>{loan.member_name}</Text>
        <Text style={styles.loanNic}>{loan.member_nic}</Text>
        <View style={styles.loanDetails}>
          <Text style={styles.loanAmount}>{formatCurrency(loan.loan_amount)}</Text>
          <Text style={styles.loanProduct}>{loan.product_name}</Text>
        </View>
        <Text style={styles.loanBranch}>{loan.branch_name}</Text>
      </View>
      <Icon name="arrow" size={16} color="#007AFF" />
    </TouchableOpacity>
  );

  const getLoanTypeColor = (loanType: string) => {
    switch (loanType?.toUpperCase()) {
      case 'BL': return '#007bff';
      case 'LL': return '#28a745';
      case 'ML': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Icon name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Search Loan Details</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isSearching} 
            onRefresh={() => handleSearch()}
          />
        }
      >
        {/* Search Section */}
        <Card title="Search Loan" style={styles.card}>
          <Input
            label="Search Term"
            placeholder="Enter loan ID or NIC number"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
          />

          <Button
            title={isSearching ? "Searching..." : "Search Loan"}
            onPress={handleSearch}
            loading={isSearching}
            disabled={!searchTerm.trim()}
            style={styles.searchButton}
          />
          
          {/* Test Navigation Button */}
          <Button
            title="Test Navigation to Loan Details"
            onPress={() => handleViewLoanDetails('TEST001')}
            style={{ marginTop: 10, backgroundColor: '#28a745' }}
          />
        </Card>

        {/* Search Results */}
        {showResults && (
          <Card title="Search Results" style={styles.card}>
            {searchResults.length > 0 ? (
              <View>
                <Text style={styles.resultsCount}>
                  Found {searchResults.length} loan(s)
                </Text>
                {searchResults.map((loan, index) => renderSearchResult(loan, index))}
              </View>
            ) : (
              <Text style={styles.noResultsText}>No loans found with the search term.</Text>
            )}
          </Card>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <Card title="Recent Searches" style={styles.card}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={handleClearHistory}>
                <Text style={styles.clearHistoryText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            {searchHistory.map((term, index) => (
              <TouchableOpacity
                key={index}
                style={styles.historyItem}
                onPress={() => handleHistoryItemPress(term)}
              >
                <View style={styles.historyItemContent}>
                  <Icon name="search" size={16} color="#007AFF" />
                  <Text style={styles.historyText}>{formatSearchTerm(term)}</Text>
                </View>
                <Text style={styles.historyTime}>Tap to search</Text>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Help Section */}
        <Card title="Search Help" style={styles.card}>
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>How to search:</Text>
            <View style={styles.helpItem}>
              <Icon name="search" size={16} color="#007AFF" />
              <Text style={styles.helpText}>Enter the loan ID (e.g., BL001, LL001, ML001)</Text>
            </View>
            <View style={styles.helpItem}>
              <Icon name="search" size={16} color="#007AFF" />
              <Text style={styles.helpText}>Enter the member's NIC number</Text>
            </View>
            <View style={styles.helpItem}>
              <Icon name="search" size={16} color="#007AFF" />
              <Text style={styles.helpText}>Enter the member's name</Text>
            </View>
            <View style={styles.helpItem}>
              <Icon name="info" size={16} color="#007AFF" />
              <Text style={styles.helpText}>Searches across all loan types (BL, LL, ML)</Text>
            </View>
            <View style={styles.helpItem}>
              <Icon name="info" size={16} color="#007AFF" />
              <Text style={styles.helpText}>Tap on any loan to view detailed report</Text>
            </View>
          </View>
        </Card>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    marginBottom: 15,
  },
  searchButton: {
    marginTop: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  loanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  loanInfo: {
    flex: 1,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  loanId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  loanStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  loanMember: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  loanNic: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  loanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  loanAmount: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  loanProduct: {
    fontSize: 12,
    color: '#666',
  },
  loanBranch: {
    fontSize: 12,
    color: '#666',
  },
  noResultsText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginLeft: 8,
  },
  historyTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  helpSection: {
    marginTop: 10,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  loanType: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
});

export default SearchLoanReportScreen;
