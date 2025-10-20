import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { styles } from '../styles';
import { transferSol } from '../services/transferService';

interface SendSolFormProps {
  currentBalance: number;
  walletAddress: string;
  onBack: () => void;
  onSuccess: (amount: string, recipientAddress: string) => void;
}

export const SendSolForm: React.FC<SendSolFormProps> = ({
  currentBalance,
  walletAddress,
  onBack,
  onSuccess
}) => {
  const [recipientAddress, setRecipientAddress] = useState('Eyp27X1g5f89Y5BYXYFf4a583w6nqFc52FDu1ftmHrXs');
  const [amount, setAmount] = useState('0.01');
  const [isSending, setIsSending] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const hasInsufficientFunds = amountNum > currentBalance;
  const isValidAmount = amountNum > 0 && amountNum <= currentBalance;
  const isValidAddress = recipientAddress.length > 0;

  const handleSend = async () => {
    if (!isValidAmount || !isValidAddress) {
      return;
    }

    try {
      setIsSending(true);
      
      // Call the actual transfer service
      const signature = await transferSol(walletAddress, recipientAddress, amountNum);
      
      // Call onSuccess immediately to close the form and show confirmation
      onSuccess(amount, recipientAddress);
      
      Alert.alert(
        'Transfer Successful',
        `Successfully sent ${amount} SOL to ${recipientAddress.slice(0, 8)}...\n\nTransaction: ${signature.slice(0, 8)}...`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Form is already closed, just acknowledge
            }
          }
        ]
      );
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('Transfer Failed', errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.sendFormContainer}>
      <Text style={styles.sendFormTitle}>Send SOL</Text>
      
      <View style={styles.formField}>
        <Text style={styles.formLabel}>Recipient Address</Text>
        <TextInput
          style={[styles.formInput, isSending && styles.formInputDisabled]}
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          placeholder="Enter Solana wallet address"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSending}
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Amount (SOL)</Text>
        <TextInput
          style={[styles.formInput, isSending && styles.formInputDisabled]}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.0"
          placeholderTextColor="#999"
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSending}
        />
        {hasInsufficientFunds && (
          <Text style={styles.insufficientFundsText}>Insufficient funds</Text>
        )}
        <Text style={styles.balanceText}>
          Available: {currentBalance.toFixed(4)} SOL
        </Text>
      </View>

      <View style={styles.sendFormButtons}>
        <TouchableOpacity
          style={[styles.backButton, isSending && styles.buttonDisabled]}
          onPress={onBack}
          disabled={isSending}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendFormSendButton,
            (!isValidAmount || !isValidAddress || isSending) && styles.buttonDisabled
          ]}
          onPress={handleSend}
          disabled={!isValidAmount || !isValidAddress || isSending}
        >
          <Text style={styles.sendFormSendButtonText}>
            {isSending ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
      <Modal
        visible={isSending}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9945FF" />
            <Text style={styles.loadingText}>Processing Transaction...</Text>
            <Text style={styles.loadingSubtext}>Please confirm in your wallet</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};
