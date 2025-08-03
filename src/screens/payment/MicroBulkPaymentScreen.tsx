import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { cashierAPI, CboResponse, MicroLoanByCboResponse, BulkPaymentRequest } from '../../api/cashier';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import Button from '../../components/common/Button';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import Loading from '../../components/common/Loading';

const MicroBulkPaymentScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [cbos, setCbos] = useState<CboResponse[]>([]);
  const [selectedCbo, setSelectedCbo] = useState<number | null>(null);
  const [microLoans, setMicroLoans] = useState<MicroLoanByCboResponse[]>([]);
  const [selectedLoans, setSelectedLoans] = useState<{[key: string]: number}>({});
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCbos, setIsLoadingCbos] = useState(false);
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
  ];

  useEffect(() => {
    fetchCbos();
  }, []);

  useEffect(() => {
    if (selectedCbo) {
      fetchMicroLoans(selectedCbo);
    } else {
      setMicroLoans([]);
      setSelectedLoans({});
    }
  }, [selectedCbo]);

  const fetchCbos = async () => {
    setIsLoadingCbos(true);
    try {
      const data = await cashierAPI.getCbos();
      setCbos(data);
    } catch (error: any) {
      console.error('Error fetching CBOs:', error);
      Alert.alert('Error', 'Failed to load CBOs');
    } finally {
      setIsLoadingCbos(false);
    }
  };

  const fetchMicroLoans = async (cboId: number) => {
    setIsLoadingLoans(true);
    try {
      const data = await cashierAPI.getMicroLoansByCbo(cboId);
      setMicroLoans(data);
      setSelectedLoans({});
    } catch (error: any) {
      console.error('Error fetching micro loans:', error);
      Alert.alert('Error', 'Failed to load micro loans');
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const handleLoanSelection = (loanId: string, amount: number) => {
    console.log('Setting loan amount:', { loanId, amount });
    setSelectedLoans(prev => {
      const newState = {
        ...prev,
        [loanId]: amount
      };
      console.log('New selectedLoans state:', newState);
      return newState;
    });
  };

  const handleRemoveLoan = (loanId: string) => {
    const newSelectedLoans = { ...selectedLoans };
    delete newSelectedLoans[loanId];
    setSelectedLoans(newSelectedLoans);
  };

  const handleProcessPayment = async () => {
    if (!selectedCbo) {
      Alert.alert('Error', 'Please select a CBO');
      return;
    }

    if (!paymentDate) {
      Alert.alert('Error', 'Please select a payment date');
      return;
    }

    const selectedLoansArray = Object.entries(selectedLoans)
      .filter(([_, amount]) => amount > 0)
      .map(([loanId, amount]) => {
        // Find the loan to get the actual loan_id for the backend
        const loan = microLoans.find(l => l.id.toString() === loanId);
        return { loan_id: loan?.loan_id || loanId, amount };
      });

    if (selectedLoansArray.length === 0) {
      Alert.alert('Error', 'Please select at least one loan with payment amount');
      return;
    }

    const totalAmount = selectedLoansArray.reduce((sum, loan) => sum + loan.amount, 0);

    Alert.alert(
      'Confirm Bulk Payment',
      `Process ${selectedLoansArray.length} payments totaling ${formatCurrency(totalAmount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Process', onPress: processPayment }
      ]
    );
  };

  const processPayment = async () => {
    setIsProcessing(true);
    try {
      const selectedLoansArray = Object.entries(selectedLoans)
        .filter(([_, amount]) => amount > 0)
        .map(([loanId, amount]) => {
          // Find the loan to get the actual loan_id for the backend
          const loan = microLoans.find(l => l.id.toString() === loanId);
          return { loan_id: loan?.loan_id || loanId, amount };
        });

      const paymentData: BulkPaymentRequest = {
        cbo_id: selectedCbo!,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber || undefined,
        notes: notes || undefined,
        payments: selectedLoansArray,
      };

      const result = await cashierAPI.processBulkPayment(paymentData);
      
      Alert.alert(
        'Success',
        `Successfully processed ${result.success_count} payments totaling ${formatCurrency(result.total_amount)}`,
        [
          { text: 'OK', onPress: () => {
            setSelectedLoans({});
            setPaymentDate('');
            setReferenceNumber('');
            setNotes('');
          }}
        ]
      );
    } catch (error: any) {
      console.error('Error processing bulk payment:', error);
      Alert.alert('Error', error.message || 'Failed to process bulk payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTotalSelectedAmount = () => {
    return Object.values(selectedLoans).reduce((sum, amount) => sum + amount, 0);
  };

  const getLoansWithAmounts = () => {
    return Object.entries(selectedLoans)
      .filter(([_, amount]) => amount > 0)
      .map(([loanId, amount]) => ({ loanId, amount }));
  };

  const getSelectedLoansCount = () => {
    return getLoansWithAmounts().length;
  };

  if (isLoading) {
    return <Loading text="Loading..." fullScreen />;
  }

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Icon name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Micro Bulk Payment</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* CBO Selection */}
        <Card title="Select CBO" style={styles.card}>
          {isLoadingCbos ? (
            <Text style={styles.loadingText}>Loading CBOs...</Text>
          ) : (
            <Picker
              selectedValue={selectedCbo}
              onValueChange={(value) => setSelectedCbo(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a CBO" value={null} />
              {cbos.map(cbo => (
                <Picker.Item 
                  key={cbo.cbo_id} 
                  label={`${cbo.cbo_name} (${cbo.cbo_code})`} 
                  value={cbo.cbo_id} 
                />
              ))}
            </Picker>
          )}
        </Card>

        {/* Payment Details */}
        <Card title="Payment Details" style={styles.card}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateInputText}>
                  {paymentDate || 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              <Picker
                selectedValue={paymentMethod}
                onValueChange={setPaymentMethod}
                style={styles.picker}
              >
                {paymentMethods.map(method => (
                  <Picker.Item 
                    key={method.value} 
                    label={method.label} 
                    value={method.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reference Number</Text>
              <TextInput
                style={styles.textInput}
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                placeholder="Optional"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={styles.textInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional"
                multiline
              />
            </View>
          </View>
        </Card>

        {/* Micro Loans List */}
        {selectedCbo && (
          <Card title="Micro Loans" style={styles.card}>
            {isLoadingLoans ? (
              <Text style={styles.loadingText}>Loading micro loans...</Text>
            ) : microLoans.length === 0 ? (
              <Text style={styles.noDataText}>No micro loans found for this CBO.</Text>
            ) : (
              <>
                {microLoans.map((loan) => (
                  <View key={loan.id} style={styles.loanItem}>
                    <View style={styles.loanInfo}>
                      <Text style={styles.loanId}>{loan.loan_id}</Text>
                      <Text style={styles.memberName}>{loan.member.name}</Text>
                      <Text style={styles.memberNic}>{loan.member.nic}</Text>
                      <Text style={styles.groupInfo}>Group: {loan.group_number}</Text>
                      <Text style={styles.dueAmount}>Due: {formatCurrency(loan.total_due)}</Text>
                    </View>
                    <View style={styles.paymentInput}>
                      <Text style={styles.inputLabel}>Amount</Text>
                      <TextInput
                        style={styles.amountInput}
                        value={selectedLoans[loan.id.toString()]?.toString() || ''}
                        onChangeText={(text) => {
                          const amount = parseFloat(text) || 0;
                          handleLoanSelection(loan.id.toString(), amount);
                        }}
                        placeholder="0.00"
                        keyboardType="numeric"
                      />
                      {selectedLoans[loan.id.toString()] > 0 && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveLoan(loan.id.toString())}
                        >
                          <Icon name="x" size={16} color="#dc3545" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </>
            )}
          </Card>
        )}

        {/* Summary */}
        {getSelectedLoansCount() > 0 && (
          <Card title="Payment Summary" style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Selected Loans:</Text>
              <Text style={styles.summaryValue}>{getSelectedLoansCount()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(getTotalSelectedAmount())}</Text>
            </View>
            {/* Show selected loans details */}
            {getLoansWithAmounts().map(({ loanId, amount }) => {
              const loan = microLoans.find(l => l.id.toString() === loanId);
              return (
                <View key={loanId} style={styles.selectedLoanRow}>
                  <Text style={styles.selectedLoanText}>
                    {loan?.member.name} - {formatCurrency(amount)}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* Process Button */}
        {getSelectedLoansCount() > 0 && (
          <Button
            title={isProcessing ? "Processing..." : "Process Bulk Payment"}
            onPress={handleProcessPayment}
            disabled={isProcessing}
            style={styles.processButton}
          />
        )}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={paymentDate ? new Date(paymentDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setPaymentDate(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1,
    backgroundColor: '#007AFF',
    paddingBottom: 40,
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
  content: { flex: 1, padding: 15 },
  card: { marginBottom: 15 },
  picker: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  inputGroup: { flex: 1, marginRight: 10 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5 },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dateInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  loadingText: { textAlign: 'center', color: '#666', fontStyle: 'italic', padding: 20 },
  noDataText: { textAlign: 'center', color: '#666', fontStyle: 'italic', padding: 20 },
  loanItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loanInfo: { flex: 1, marginRight: 15 },
  loanId: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  memberName: { fontSize: 14, color: '#333', marginBottom: 2 },
  memberNic: { fontSize: 12, color: '#666', marginBottom: 2 },
  groupInfo: { fontSize: 12, color: '#007AFF', marginBottom: 2 },
  dueAmount: { fontSize: 14, fontWeight: '600', color: '#dc3545' },
  paymentInput: { width: 100, alignItems: 'center' },
  amountInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
  },
  removeButton: {
    marginTop: 5,
    padding: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 14, color: '#333' },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#007AFF' },
  selectedLoanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginTop: 8,
  },
  selectedLoanText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  processButton: { marginTop: 10,
    marginBottom: 40,
    backgroundColor: '#dc3545', 
},
});

export default MicroBulkPaymentScreen; 