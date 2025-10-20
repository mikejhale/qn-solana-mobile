import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useSolBalance } from '../src/hooks/useSolBalance';
import { connectWallet } from '../src/services/walletService';
import { Header } from '../src/components/Header';
import { BalanceDisplay } from '../src/components/BalanceDisplay';
import { ConnectScreen } from '../src/components/ConnectScreen';
import { DisconnectModal } from '../src/components/DisconnectModal';
import { styles } from '../src/styles';

export default function App() {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState<number | null>(null);
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  
  // Use the custom hook to fetch SOL balance
  const { balance, loading: balanceLoading, error: balanceError } = useSolBalance(connectedAddress);

  const disconnectWallet = () => {
    setConnectedAddress(null);
    setShowDisconnectMenu(false);
    Alert.alert('Disconnected', 'Wallet disconnected successfully');
  };

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);

      // Add timeout to prevent infinite spinning
      const timeoutPromise = new Promise((_, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
        setConnectionTimeout(timeout);
      });

      const connectionPromise = connectWallet();
      const addressString = await Promise.race([connectionPromise, timeoutPromise]) as string;
      
      setConnectedAddress(addressString);
      Alert.alert('Success', `Connected to: ${addressString}`);
    } catch (error) {
      console.error('Connection failed:', error);
      let errorMessage = 'Failed to connect to wallet';
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Connection timed out. Please try again.';
      } else if (error.message.includes('User rejected') || error.message.includes('rejected')) {
        errorMessage = 'Connection was rejected by user.';
      } else if (error.message.includes('No wallet found')) {
        errorMessage = 'No Solana Mobile wallet found. Please install a wallet app.';
      } else if (error.message.includes('cancelled') || error.message.includes('canceled')) {
        errorMessage = 'Connection was cancelled.';
      }
      
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setIsConnecting(false);
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
      }
    }
  };

  const cancelConnection = () => {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }
    setIsConnecting(false);
    Alert.alert('Cancelled', 'Connection cancelled by user');
  };

  return (
    <View style={styles.container}>
      <Header
        connectedAddress={connectedAddress}
        isConnecting={isConnecting}
        onAddressPress={() => setShowDisconnectMenu(true)}
        onConnect={handleConnectWallet}
      />

      <View style={styles.content}>
        {connectedAddress ? (
          <BalanceDisplay
            balance={balance}
            loading={balanceLoading}
            error={balanceError}
            walletAddress={connectedAddress}
          />
        ) : (
          <ConnectScreen
            isConnecting={isConnecting}
            onConnect={handleConnectWallet}
            onCancel={cancelConnection}
          />
        )}
      </View>

      <DisconnectModal
        visible={showDisconnectMenu}
        onDisconnect={disconnectWallet}
        onCancel={() => setShowDisconnectMenu(false)}
      />
    </View>
  );
}
