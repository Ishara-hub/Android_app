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
import { membersAPI, MemberSearchResponse, MemberLoansResponse, MemberPaymentsResponse } from '../../api/members';
import SafeAreaWrapper from '../../components/common/SafeAreaWrapper';

const MembersScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [members, setMembers] = useState<MemberSearchResponse['members']['data']>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberLoans, setMemberLoans] = useState<MemberLoansResponse | null>(null);
  const [memberPayments, setMemberPayments] = useState<MemberPaymentsResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);

  useEffect(() => {
    fetchMemberList(1);
  }, []);

  const fetchMemberList = async (page: number) => {
    setIsLoadingList(true);
    try {
      const res = await membersAPI.getMemberList({ page, per_page: 20 });
      setMembers(res.members?.data || []);
      setPagination({
        current_page: res.members?.current_page || 1,
        last_page: res.members?.last_page || 1,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load members');
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Please enter a NIC or name');
      return;
    }
    setIsSearching(true);
    try {
      const res = await membersAPI.searchMembers(searchTerm.trim());
      setMembers(res.members.data);
      setPagination({
        current_page: res.members.current_page,
        last_page: res.members.last_page,
      });
    } catch (error: any) {
      Alert.alert('Search Error', error.message || 'No members found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMemberPress = async (member: any) => {
    setSelectedMember(member);
    setShowMemberModal(true);
    setIsLoadingDetails(true);
    try {
      const loans = await membersAPI.getMemberLoans(member.nic || member.id);
      setMemberLoans(loans);
      const payments = await membersAPI.getMemberPaymentHistory(member.nic || member.id, { per_page: 5 });
      setMemberPayments(payments);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load member details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setShowMemberModal(false);
    setSelectedMember(null);
    setMemberLoans(null);
    setMemberPayments(null);
  };

  const handleLoadMore = () => {
    if (pagination.current_page < pagination.last_page) {
      fetchMemberList(pagination.current_page + 1);
    }
  };

  return (
    <SafeAreaWrapper style={styles.container} edges={['top']} backgroundColor="#007AFF">
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <Text style={styles.subtitle}>Search and view member details</Text>
      </View>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoadingList} onRefresh={() => fetchMemberList(1)} />
        }
      >
        <Card title="Search Member" style={styles.card}>
          <Input
            label="NIC or Name"
            placeholder="Enter NIC or name"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
          />
          <Button
            title={isSearching ? 'Searching...' : 'Search'}
            onPress={handleSearch}
            loading={isSearching}
            disabled={!searchTerm.trim()}
            style={styles.searchButton}
          />
        </Card>

        <Card title="Member List" style={styles.card}>
          {members.length === 0 && (
            <Text style={styles.noDataText}>No members found.</Text>
          )}
          {members.map((member, idx) => (
            <TouchableOpacity
              key={member.id || member.nic || idx}
              style={styles.memberItem}
              onPress={() => handleMemberPress(member)}
            >
              <View style={styles.memberInfo}>
                <Icon name="member" size={20} color="#007AFF" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.memberName}>{member.full_name}</Text>
                  <Text style={styles.memberNic}>{member.nic}</Text>
                  <Text style={styles.memberStatus}>{member.status}</Text>
                </View>
              </View>
              <Icon name="arrow" size={18} color="#007AFF" />
            </TouchableOpacity>
          ))}
          {pagination.current_page < pagination.last_page && (
            <Button
              title="Load More"
              onPress={handleLoadMore}
              style={styles.loadMoreButton}
            />
          )}
        </Card>
      </ScrollView>

      {/* Member Details Modal */}
      <Modal
        visible={showMemberModal}
        animationType="slide"
        onRequestClose={handleCloseModal}
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Member Details</Text>
              {isLoadingDetails ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : selectedMember && (
                <>
                  <Text style={styles.detailLabel}>Name: <Text style={styles.detailValue}>{selectedMember.full_name}</Text></Text>
                  <Text style={styles.detailLabel}>NIC: <Text style={styles.detailValue}>{selectedMember.nic}</Text></Text>
                  <Text style={styles.detailLabel}>Status: <Text style={styles.detailValue}>{selectedMember.status}</Text></Text>
                  <Text style={styles.detailLabel}>Phone: <Text style={styles.detailValue}>{selectedMember.phone}</Text></Text>
                  <Text style={styles.sectionHeader}>Loans</Text>
                  {memberLoans && memberLoans.business_loans.length === 0 && memberLoans.micro_loans.length === 0 && memberLoans.lease_loans.length === 0 && (
                    <Text style={styles.noDataText}>No loans found.</Text>
                  )}
                  {memberLoans && (
                    <>
                      {memberLoans.business_loans.map((loan, idx) => (
                        <Text key={idx} style={styles.loanItem}>Business: {loan.loan_id} - ${loan.loan_amount} ({loan.status})</Text>
                      ))}
                      {memberLoans.micro_loans.map((loan, idx) => (
                        <Text key={idx} style={styles.loanItem}>Micro: {loan.loan_id} - ${loan.loan_amount} ({loan.status})</Text>
                      ))}
                      {memberLoans.lease_loans.map((loan, idx) => (
                        <Text key={idx} style={styles.loanItem}>Lease: {loan.loan_id} - ${loan.loan_amount} ({loan.status})</Text>
                      ))}
                    </>
                  )}
                  <Text style={styles.sectionHeader}>Recent Payments</Text>
                  {memberPayments && memberPayments.payments.data.length === 0 && (
                    <Text style={styles.noDataText}>No payments found.</Text>
                  )}
                  {memberPayments && memberPayments.payments.data.map((payment, idx) => (
                    <Text key={idx} style={styles.paymentItem}>${payment.amount} on {payment.payment_date} ({payment.payment_method})</Text>
                  ))}
                </>
              )}
              <Button title="Close" onPress={handleCloseModal} style={styles.closeButton} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  searchButton: { marginTop: 10 },
  noDataText: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  memberItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e9ecef' },
  memberInfo: { flexDirection: 'row', alignItems: 'center' },
  memberName: { fontSize: 16, fontWeight: '600', color: '#333' },
  memberNic: { fontSize: 14, color: '#888' },
  memberStatus: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  loadMoreButton: { marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 10, textAlign: 'center' },
  detailLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 8 },
  detailValue: { fontWeight: '400', color: '#555' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginTop: 16, marginBottom: 6 },
  loanItem: { fontSize: 14, color: '#333', marginLeft: 8 },
  paymentItem: { fontSize: 14, color: '#333', marginLeft: 8 },
  closeButton: { marginTop: 20 },
  loadingText: { textAlign: 'center', color: '#888', marginVertical: 10 },
});

export default MembersScreen; 