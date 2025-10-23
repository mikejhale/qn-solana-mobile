import { createSolanaRpc, address, lamports } from '@solana/kit';
import { SOLANA_RPC_URL, LAMPORTS_PER_SOL } from '../constants';

export const requestAirdrop = async (recipientAddress: string): Promise<string> => {
  try {
    console.log('Requesting airdrop for address:', recipientAddress);
    
    // Create RPC connection using @solana/kit
    const rpc = createSolanaRpc(SOLANA_RPC_URL);
    
    // Convert address to @solana/kit address type
    const solanaAddress = address(recipientAddress);
    
    // Request airdrop using direct RPC call
    const signature = await rpc.requestAirdrop(solanaAddress, lamports(BigInt(LAMPORTS_PER_SOL))).send();
    
    console.log('Airdrop successful, signature:', signature);
    
    // Wait for the transaction to be confirmed before returning
    console.log('Waiting for transaction confirmation...');
    
    // Poll for confirmation
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait time
    
    while (!confirmed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const { value: statuses } = await rpc.getSignatureStatuses([signature]).send();
      
      if (statuses[0] && statuses[0].confirmationStatus) {
        confirmed = true;
        console.log('Transaction confirmed!');
      } else {
        attempts++;
        console.log(`Waiting for confirmation... attempt ${attempts}/${maxAttempts}`);
      }
    }
    
    if (!confirmed) {
      console.warn('Transaction confirmation timeout, but airdrop may still succeed');
    }
    
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    
    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('Internal JSON-RPC error')) {
      throw new Error('RPC server error. Please try again later.');
    } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      throw new Error('HTTP error (429)');
    }
    
    // Preserve the original error message for other cases
    throw error;
  }
};
