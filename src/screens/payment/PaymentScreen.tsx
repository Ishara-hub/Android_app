import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootState } from '../../store/store';
import { 
  searchLoan, 
  processPayment, 
  clearSearchResult, 
  clearProcessingError 
} from '../../store/paymentSlice';
import { paymentsAPI } from '../../api/payments';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import DateTimePicker from '@react-native-community/datetimepicker';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const PaymentScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'bank_transfer'>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { 
    searchResult, 
    isSearching: isSearchingRedux, 
    searchError,
    isProcessing,
    processingError,
    lastPayment
  } = useSelector((state: RootState) => state.payment);

  // Check if we have loan data from route params
  const routeParams = route.params as any;
  const initialSearchTerm = routeParams?.searchTerm || '';

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
      handleSearch(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    if (searchError) {
      Alert.alert('Search Error', searchError);
    }
  }, [searchError]);

  useEffect(() => {
    if (processingError) {
      Alert.alert('Payment Error', processingError);
      dispatch(clearProcessingError());
    }
  }, [processingError]);

  useEffect(() => {
    if (lastPayment) {
      Alert.alert(
        'Payment Successful',
        `Payment of $${lastPayment.payment.amount} processed successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSearchTerm('');
              setAmount('');
              setReferenceNumber('');
              setNotes('');
              dispatch(clearSearchResult());
              // Navigate to receipt screen
              (navigation as any).navigate('Receipt', { paymentId: lastPayment.payment.id });
            }
          }
        ]
      );
    }
  }, [lastPayment]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      await dispatch<any>(searchLoan(term));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePayment = async () => {
    if (!searchResult?.loan) {
      Alert.alert('Error', 'Please search for a loan first');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }
    if (!paymentDate) {
      Alert.alert('Error', 'Please select a payment date');
      return;
    }

    const paymentData = {
      loan_id: searchResult.loan.loan_id,
      loan_type: searchResult.loan_type,
      paid_amount: parseFloat(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber,
      notes: notes,
      latitude: 0, // You can add GPS functionality here
      longitude: 0,
    };

    try {
      await dispatch<any>(processPayment(paymentData));
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'mobile_money': return 'Mobile Money';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  };

  const paymentMethods = ['cash', 'mobile_money', 'bank_transfer'] as const;

  return (
    <SafeAreaWrapper style={styles.container} edges={['top', 'bottom']} backgroundColor="#007AFF">
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <View style={styles.header}>
        <Text style={styles.title}>Process Payment</Text>
        <Text style={styles.subtitle}>Search and process loan payments</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <Card title="Search Loan" style={styles.card}>
          <Input
            label="Search by Loan ID or NIC"
            placeholder="Enter loan ID or NIC number"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
          />
          <Button
            title={isSearching ? "Searching..." : "Search Loan"}
            onPress={() => handleSearch(searchTerm)}
            loading={isSearching}
            disabled={!searchTerm.trim()}
            style={styles.searchButton}
          />
        </Card>

        {/* Loan Information */}
        {searchResult && (
          <Card title="Loan Information" style={styles.card}>
            <View style={styles.loanInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Loan ID:</Text>
                <Text style={styles.infoValue}>{searchResult.loan.loan_id}</Text>
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
                <Text style={styles.infoValue}>{formatCurrency(searchResult.loan.loan_amount)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Loan Type:</Text>
                <Text style={styles.infoValue}>{searchResult.loan_type}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{searchResult.loan.status}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Due:</Text>
                <Text style={styles.infoValue}>{formatCurrency(searchResult.total_due)}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Payment Details */}
        {searchResult && (
          <Card title="Payment Details" style={styles.card}>
            <Input
              label="Payment Amount"
              placeholder="Enter payment amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.inputLabel}>Payment Date</Text>
                <View style={styles.dateInput}>
                  <Text style={styles.dateInputText}>{paymentDate}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(paymentDate)}
                mode="date"
                display="default"
                onChange={(event: any, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setPaymentDate(selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
            )}

            <View style={styles.paymentMethodSection}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.paymentMethodOptions}>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === method && styles.selectedPaymentMethod
                    ]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text style={[
                      styles.paymentMethodText,
                      paymentMethod === method && styles.selectedPaymentMethodText
                    ]}>
                      {getPaymentMethodLabel(method)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Reference Number (Optional)"
              placeholder="Enter reference number"
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              autoCapitalize="none"
            />

            <Input
              label="Notes (Optional)"
              placeholder="Enter notes"
              value={notes}
              onChangeText={setNotes}
              autoCapitalize="sentences"
              multiline
              numberOfLines={3}
            />
          </Card>
        )}

        {/* Process Payment Button */}
        {searchResult && (
          <Button
            title="Process Payment"
            onPress={handlePayment}
            loading={isProcessing}
            disabled={!amount || parseFloat(amount) <= 0}
            style={styles.paymentButton}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardContainer: {
    flex: 1,
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
  paymentMethodSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  paymentMethodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodOption: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedPaymentMethod: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  selectedPaymentMethodText: {
    color: '#FFFFFF',
  },
  paymentButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  dateInputText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
});

export default PaymentScreen; 