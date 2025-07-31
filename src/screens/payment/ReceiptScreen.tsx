import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { paymentsAPI } from '../../api/payments';
import RNPrint from 'react-native-print';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const ReceiptScreen: React.FC = () => {
  const route = useRoute();
  const { paymentId } = route.params as { paymentId: number };
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await paymentsAPI.getReceipt(paymentId);
        setReceipt(res);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to load receipt');
      }
    };
    fetchReceipt();
  }, [paymentId]);

  const handlePrint = async () => {
    if (!receipt) return;
    // Create HTML for the receipt
    const html = `
      <h2>Payment Receipt</h2>
      <p><strong>Receipt No:</strong> ${receipt.receipt_number}</p>
      <p><strong>Member Name:</strong> ${receipt.member_name}</p>
      <p><strong>NIC:</strong> ${receipt.member_nic}</p>
      <p><strong>Loan ID:</strong> ${receipt.loan_id}</p>
      <p><strong>Amount:</strong> ${receipt.amount}</p>
      <p><strong>Interest Paid:</strong> ${receipt.interest_paid}</p>
      <p><strong>Capital Paid:</strong> ${receipt.capital_paid}</p>
      <p><strong>Payment Date:</strong> ${receipt.payment_date}</p>
      <p><strong>Method:</strong> ${receipt.payment_method}</p>
      <p><strong>Reference:</strong> ${receipt.reference_number}</p>
      <p><strong>Processed By:</strong> ${receipt.processed_by}</p>
    `;
    // Generate PDF
    const pdf = await RNHTMLtoPDF.convert({ html, fileName: 'receipt', base64: true });
    // Print PDF
    if (pdf.filePath) {
      await RNPrint.print({ filePath: pdf.filePath });
    } else {
      Alert.alert('Error', 'Failed to generate PDF file for printing.');
    }
  };

  if (!receipt) {
    return <View style={styles.centered}><Text>Loading receipt...</Text></View>;
  }

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#f5f5f5">
      <ScrollView style={styles.scrollView}>
      <Text style={styles.title}>Payment Receipt</Text>
      <Text>Receipt No: {receipt.receipt_number}</Text>
      <Text>Member Name: {receipt.member_name}</Text>
      <Text>NIC: {receipt.member_nic}</Text>
      <Text>Loan ID: {receipt.loan_id}</Text>
      <Text>Amount: {receipt.amount}</Text>
      <Text>Interest Paid: {receipt.interest_paid}</Text>
      <Text>Capital Paid: {receipt.capital_paid}</Text>
      <Text>Payment Date: {receipt.payment_date}</Text>
      <Text>Method: {receipt.payment_method}</Text>
      <Text>Reference: {receipt.reference_number}</Text>
      <Text>Processed By: {receipt.processed_by}</Text>
      <Button title="Print Receipt" onPress={handlePrint} />
    </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ReceiptScreen; 