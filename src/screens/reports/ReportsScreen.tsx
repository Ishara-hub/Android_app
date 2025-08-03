import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { reportsAPI, PortfolioReportResponse, LoanDetailsReport, ArrearsReportResponse, branchesAPI } from '../../api/reports';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types/navigation';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Select a report to view details</Text>
      </View>
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PortfolioReport')}>
            <Text style={styles.menuTitle}>Portfolio Report</Text>
            <Text style={styles.menuDesc}>View portfolio summary and details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ArrearsReport')}>
            <Text style={styles.menuTitle}>Arrears Report</Text>
            <Text style={styles.menuDesc}>View overdue loans and arrears</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PaymentHistory')}>
            <Text style={styles.menuTitle}>Payment History</Text>
            <Text style={styles.menuDesc}>View payment history and statistics</Text>
          </TouchableOpacity>
          {/* Add more reports as needed */}
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
  header: { padding: 20, backgroundColor: 'rgba(19, 134, 150, 0.8)' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  content: { flex: 1, padding: 15 },
  card: { marginBottom: 15 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  filterInput: { flex: 1, marginRight: 8 },
  filterButton: { marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  summaryText: { fontSize: 14, color: '#333', fontWeight: '600' },
  noDataText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  loanItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e9ecef' },
  loanId: { fontSize: 14, fontWeight: 'bold', color: '#007AFF', flex: 1 },
  loanMember: { fontSize: 14, color: '#333', flex: 2 },
  loanAmount: { fontSize: 14, color: '#28a745', flex: 1 },
  loanStatus: { fontSize: 12, color: '#dc3545', fontWeight: '600', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 10, textAlign: 'center' },
  detailLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 8 },
  detailValue: { fontWeight: '400', color: '#555' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginTop: 16, marginBottom: 6 },
  paymentItem: { fontSize: 14, color: '#333', marginLeft: 8 },
  closeButton: { marginTop: 20 },
  loadingText: { textAlign: 'center', color: '#888', marginVertical: 10 },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 14,
    color: '#555',
  },
});

export default ReportsScreen; 