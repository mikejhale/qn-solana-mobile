import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../styles';
import { useAirdrop } from '../hooks/useAirdrop';
import { ErrorModal } from './ErrorModal';
import { SendSolForm } from './SendSolForm';

interface BalanceDisplayProps {
  balance: number | null;
  loading: boolean;
  error: string | null;
  walletAddress: string;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ 
  balance, 
  loading, 
  error, 
  walletAddress 
}) => {
  const { requestAirdrop, isRequesting, error: airdropError } = useAirdrop();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({ title: '', message: '' });
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendConfirmation, setSendConfirmation] = useState<{amount: string, address: string} | null>(null);

  const handleAirdrop = async () => {
    try {
      const signature = await requestAirdrop(walletAddress);
      if (signature) {
        Alert.alert('Success', `Airdrop successful! Transaction: ${signature.slice(0, 8)}...`);
      } else {
        setErrorModalData({
          title: 'Airdrop Failed',
          message: 'Failed to request airdrop. Please try again later.'
        });
        setShowErrorModal(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Check for specific error types and show user-friendly messages
      let displayMessage: string;
      if (errorMessage.includes('HTTP error (429)') || errorMessage.includes('429')) {
        displayMessage = 'Airdrops are rate limited. Please try again later.';
      } else if (errorMessage.includes('RPC server error')) {
        displayMessage = 'Server error occurred. Please try again later.';
      } else {
        displayMessage = `Error: ${errorMessage}`;
      }
      
      setErrorModalData({
        title: 'Airdrop Error',
        message: displayMessage
      });
      setShowErrorModal(true);
    }
  };

  if (showSendForm && balance !== null) {
    return (
      <SendSolForm
        currentBalance={balance}
        walletAddress={walletAddress}
        onBack={() => setShowSendForm(false)}
        onSuccess={(amount: string, recipientAddress: string) => {
          // Set confirmation first
          setSendConfirmation({ amount, address: recipientAddress });
          // Clear confirmation after 5 seconds
          setTimeout(() => setSendConfirmation(null), 5000);
          // Close the form
          setShowSendForm(false);
        }}
      />
    );
  }

  return (
    <View style={styles.balanceContainer}>
      <Text style={styles.balanceTitle}>SOL Balance</Text>
      {loading ? (
        <Text style={styles.balanceAmount}>Loading...</Text>
      ) : error ? (
        <Text style={styles.balanceError}>Error loading balance</Text>
      ) : (
        <Text style={styles.balanceAmount}>{balance?.toFixed(4)} SOL</Text>
      )}
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.airdropButton, isRequesting && styles.buttonDisabled]}
          onPress={handleAirdrop}
          disabled={isRequesting}
        >
          <Text style={styles.airdropButtonText}>
            {isRequesting ? 'Requesting...' : 'Airdrop'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => setShowSendForm(true)}
        >
          <Text style={styles.sendButtonText}>Send SOL</Text>
        </TouchableOpacity>
      </View>
      
      {airdropError && (
        <Text style={styles.airdropError}>{airdropError}</Text>
      )}
      
      {sendConfirmation && (
        <Text style={styles.sendConfirmation}>
          Sent {sendConfirmation.amount} SOL to {sendConfirmation.address.slice(0, 4)}...{sendConfirmation.address.slice(-4)}
        </Text>
      )}
      
      <ErrorModal
        visible={showErrorModal}
        title={errorModalData.title}
        message={errorModalData.message}
        onClose={() => setShowErrorModal(false)}
      />
    </View>
  );
};
