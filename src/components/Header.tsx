import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { shortenAddress } from '../utils/addressUtils';

interface HeaderProps {
  connectedAddress: string | null;
  isConnecting: boolean;
  onAddressPress: () => void;
  onConnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  connectedAddress, 
  isConnecting, 
  onAddressPress, 
  onConnect 
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Solana dApp</Text>
      {connectedAddress ? (
        <TouchableOpacity
          style={styles.addressButton}
          onPress={onAddressPress}
        >
          <Text style={styles.addressButtonText}>{shortenAddress(connectedAddress)}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.connectButton, isConnecting && styles.buttonDisabled]}
          onPress={onConnect}
          disabled={isConnecting}
        >
          <Text style={styles.connectButtonText}>
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
