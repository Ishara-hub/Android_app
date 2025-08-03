import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { checkAuth } from '../store/authSlice';
import { RootStackParamList } from '../types/navigation';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SearchLoanScreen from '../screens/payment/SearchLoanScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import MemberProfileScreen from '../screens/member/MemberProfileScreen';
import PaymentHistoryScreen from '../screens/payment/PaymentHistoryScreen';

import MembersScreen from '../screens/member/MembersScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import PortfolioReportScreen from '../screens/reports/PortfolioReportScreen';
import ArrearsReportScreen from '../screens/reports/ArrearsReportScreen';
import LoanDetailsScreen from '../screens/reports/LoanDetailsScreen';
import ReceiptScreen from '../screens/payment/ReceiptScreen';
import MicroBulkPaymentScreen from '../screens/payment/MicroBulkPaymentScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return null; // You can show a splash screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="SearchLoan" component={SearchLoanScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
            <Stack.Screen name="Members" component={MembersScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="PortfolioReport" component={PortfolioReportScreen} />
            <Stack.Screen name="ArrearsReport" component={ArrearsReportScreen} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
            <Stack.Screen name="MicroBulkPayment" component={MicroBulkPaymentScreen} />
            <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
            <Stack.Screen name="Receipt" component={ReceiptScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 