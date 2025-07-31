import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store/store';
import { searchLoan, clearSearchResult } from '../../store/paymentSlice';
import { loansAPI } from '../../api/loans';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const SearchLoanScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loanDetails, setLoanDetails] = useState<any>(null);
  const [showLoanDetails, setShowLoanDetails] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { searchResult, isSearching: isSearchingRedux, searchError } = useSelector(
    (state: RootState) => state.payment
  );

  useEffect(() => {
    if (searchError) {
      Alert.alert('Search Error', searchError);
    }
  }, [searchError]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Please enter a loan ID or NIC number');
      return;
    }

    setIsSearching(true);
    try {
      // Use the loan search API instead of payment search
      const response = await loansAPI.searchLoan(searchTerm.trim());
      setLoanDetails(response);
      setShowLoanDetails(true);
      
      // Add to search history
      if (!searchHistory.includes(searchTerm.trim())) {
        setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 9)]);
      }
    } catch (error: any) {
      Alert.alert('Search Error', error.message || 'Loan not found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryItemPress = async (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    try {
      const response = await loansAPI.searchLoan(term);
      setLoanDetails(response);
      setShowLoanDetails(true);
    } catch (error: any) {
      Alert.alert('Search Error', error.message || 'Loan not found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleProcessPayment = () => {
    if (loanDetails?.loan) {
      // Set the search term and navigate to payment screen
      setSearchTerm(loanDetails.loan.loan_id);
      // You can implement navigation here or use a callback
      Alert.alert(
        'Process Payment',
        `Navigate to payment screen for loan ${loanDetails.loan.loan_id}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              // Navigate to payment screen
              (navigation as any).navigate('Payment', { 
                searchTerm: loanDetails.loan.loan_id 
              });
            }
          }
        ]
      );
    }
  };

  const handleViewDetails = async () => {
    if (loanDetails?.loan?.loan_id) {
      try {
        const details = await loansAPI.getLoanDetails(loanDetails.loan.loan_id);
        // You can navigate to a detailed view or show in a modal
        Alert.alert('Loan Details', `Loan ID: ${details.loan.loan_id}\nMember: ${details.loan.member_name}\nAmount: $${details.loan.loan_amount}`);
      } catch (error: any) {
        Alert.alert('Error', 'Failed to load loan details');
      }
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
      currency: 'USD',
    }).format(amount);
  };

  const getLoanTypeLabel = (type: string) => {
    switch (type) {
      case 'business_loan': return 'Business Loan';
      case 'micro_loan': return 'Micro Loan';
      case 'lease_loan': return 'Lease Loan';
      default: return type;
    }
  };

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <View style={styles.header}>
        <Text style={styles.title}>Search Loan</Text>
        <Text style={styles.subtitle}>Find loan by ID or NIC number</Text>
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
        </Card>

        {/* Loan Details */}
        {showLoanDetails && loanDetails && (
          <Card title="Loan Information" style={styles.card}>
            <View style={styles.loanInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Loan ID:</Text>
                <Text style={styles.infoValue}>{loanDetails.loan.loan_id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Name:</Text>
                <Text>{searchResult?.member?.full_name || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NIC:</Text>
                <Text>{searchResult?.member?.nic || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Loan Amount:</Text>
                <Text style={styles.infoValue}>{formatCurrency(loanDetails.loan.loan_amount)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{loanDetails.loan.status}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleProcessPayment}
              >
                <Icon name="payment" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Process Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleViewDetails}
              >
                <Icon name="search" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.helpText}>Enter the loan ID (e.g., LOAN001)</Text>
            </View>
            <View style={styles.helpItem}>
              <Icon name="search" size={16} color="#007AFF" />
              <Text style={styles.helpText}>Enter the member's NIC number</Text>
            </View>
            <View style={styles.helpItem}>
              <Icon name="search" size={16} color="#007AFF" />
              <Text style={styles.helpText}>Use barcode scanner for quick search</Text>
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
    padding: 20,
    backgroundColor: 'rgba(19, 134, 150, 0.8)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
  loanInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
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
});

export default SearchLoanScreen; 