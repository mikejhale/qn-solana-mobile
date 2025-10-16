import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey } from '@solana/web3.js';

export const APP_IDENTITY = {
  name: 'React Native dApp',
  uri: 'https://yourdapp.com',
  icon: "./favicon.ico",
};

export default function App() {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState<number | null>(null);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      // Add timeout to prevent infinite spinning
      const timeoutPromise = new Promise((_, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
        setConnectionTimeout(timeout);
      });

      const connectionPromise = transact(async (wallet: Web3MobileWallet) => {
        const authorizationResult = await wallet.authorize({
          identity: APP_IDENTITY,
        });

        return authorizationResult;
      });

      const authorizationResult = await Promise.race([connectionPromise, timeoutPromise]) as any;

      
      // Extract and convert the public key to base58 string
      let addressString: string;
      try {
        const account = authorizationResult.accounts[0];
        
        // Check for display_address first, then fallback to other properties
        const possibleKeys = ['display_address', 'publicKey', 'address', 'key', 'pubkey', 'public_key', 'account'];
        
        for (const key of possibleKeys) {
          if (account[key]) {
            const publicKeyData = account[key];
            
            // If it's display_address and already a string, use it directly
            if (key === 'display_address' && typeof publicKeyData === 'string') {
              addressString = publicKeyData;
              break;
            } else {
              // For other properties, convert to PublicKey and then to base58
              const publicKey = new PublicKey(publicKeyData);
              addressString = publicKey.toBase58();
              break;
            }
          }
        }
        
        if (!addressString) {
          throw new Error("No public key found in account object");
        }
      } catch (error) {
        console.error("Error converting address:", error);
        addressString = "Error: Unable to extract wallet address";
      }
      
      setConnectedAddress(addressString);
      Alert.alert('Success', `Connected to: ${addressString}`);
    } catch (error) {
      console.error('Connection failed:', error);
      let errorMessage = 'Failed to connect to wallet';
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Connection timed out. Please try again.';
      } else if (error.message.includes('User rejected')) {
        errorMessage = 'Connection was rejected by user.';
      } else if (error.message.includes('No wallet found')) {
        errorMessage = 'No Solana Mobile wallet found. Please install a wallet app.';
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
      <View style={styles.content}>
        <Text style={styles.title}>gm!</Text>
        <Text style={styles.subtitle}>Connect your Solana Mobile Wallet</Text>

        {connectedAddress ? (
          <View style={styles.connectedContainer}>
            <Text style={styles.connectedText}>Connected!</Text>
            <Text style={styles.addressLabel}>Wallet Address:</Text>
            <Text style={styles.addressText}>{connectedAddress}</Text>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => {
                setConnectedAddress(null);
                Alert.alert('Disconnected', 'Wallet disconnected successfully');
              }}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isConnecting && styles.buttonDisabled]}
              onPress={connectWallet}
              disabled={isConnecting}
            >
              <Text style={styles.buttonText}>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Text>
            </TouchableOpacity>
            {isConnecting && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelConnection}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  connectedContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9945FF',
    maxWidth: '90%',
  },
  connectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9945FF',
    marginBottom: 15,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    minWidth: 200,
  },
  disconnectButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
