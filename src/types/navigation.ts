import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  SearchLoan: undefined;
  Payment: undefined;
  MemberProfile: undefined;
  Members: undefined;
  Reports: undefined;
  PaymentHistory: undefined;
  PortfolioReport: undefined;
  ArrearsReport: undefined;
  LoanDetails: { loanId: string };
  Receipt: { paymentId: number };
  MicroBulkPayment: undefined;
};

export type NavigationProp = StackNavigationProp<RootStackParamList>; 