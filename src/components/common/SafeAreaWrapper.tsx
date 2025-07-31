import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
  backgroundColor?: string;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  edges = ['top'],
  backgroundColor = '#f5f5f5',
}) => {
  return (
    <SafeAreaView 
      style={[{ flex: 1, backgroundColor }, style]} 
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaWrapper; 