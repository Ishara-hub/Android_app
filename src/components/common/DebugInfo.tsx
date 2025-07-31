import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { getApiConfig } from '../../config/api';

interface DebugInfoProps {
  visible: boolean;
  onClose: () => void;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ visible, onClose }) => {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [apiConfig, setApiConfig] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      // Get API configuration
      const config = getApiConfig();
      setApiConfig(config);

      // Test network connectivity
      testNetworkConnectivity();
    }
  }, [visible]);

  const testNetworkConnectivity = async () => {
    try {
      const response = await fetch(`${apiConfig.baseURL}/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();
      setNetworkInfo({
        status: response.status,
        ok: response.ok,
        data: data,
        error: null
      });
    } catch (error: any) {
      setNetworkInfo({
        status: 'ERROR',
        ok: false,
        data: null,
        error: error.message
      });
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Information</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <Card title="API Configuration" style={styles.card}>
            <Text style={styles.label}>Base URL:</Text>
            <Text style={styles.value}>{apiConfig?.baseURL || 'Not set'}</Text>
            
            <Text style={styles.label}>Timeout:</Text>
            <Text style={styles.value}>{apiConfig?.timeout || 'Not set'}ms</Text>
          </Card>

          <Card title="Network Test" style={styles.card}>
            {networkInfo ? (
              <>
                <Text style={styles.label}>Status:</Text>
                <Text style={[styles.value, { color: networkInfo.ok ? '#28a745' : '#dc3545' }]}>
                  {networkInfo.status}
                </Text>
                
                <Text style={styles.label}>Response:</Text>
                <Text style={styles.value}>
                  {networkInfo.error || JSON.stringify(networkInfo.data, null, 2)}
                </Text>
              </>
            ) : (
              <Text style={styles.value}>Testing...</Text>
            )}
          </Card>

          <Card title="Device Info" style={styles.card}>
            <Text style={styles.label}>Platform:</Text>
            <Text style={styles.value}>Android</Text>
            
            <Text style={styles.label}>Build Type:</Text>
            <Text style={styles.value}>Production APK</Text>
          </Card>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  card: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: '#333',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
});

export default DebugInfo; 