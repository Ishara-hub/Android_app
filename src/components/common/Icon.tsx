import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 48, color = '#333' }) => {
  const getIconText = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      search: '🔍',
      receipt: '📄',
      people: '👥',
      'bar-chart': '📊',
      payment: '💰',
      member: '👤',
      history: '📋',
      settings: '⚙️',
      logout: '🚪',
      home: '🏠',
      add: '➕',
      edit: '✏️',
      delete: '🗑️',
      check: '✅',
      close: '❌',
      arrow: '➡️',
      back: '⬅️',
    };
    
    return iconMap[iconName] || '📱';
  };

  return (
    <Text style={[styles.icon, { fontSize: size, color }]}>
      {getIconText(name)}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
}); 