import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { 
  createSolanaRpc, 
  address, 
  lamports
} from '@solana/kit';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_RPC_URL, LAMPORTS_PER_SOL as KIT_LAMPORTS_PER_SOL, APP_IDENTITY } from '../constants';

export const transferSol = async (
  fromAddress: string,
  toAddress: string,
  amountSol: number
): Promise<string> => {
  try {
    // Create RPC connection using @solana/kit for balance checks and other operations
    const rpc = createSolanaRpc(SOLANA_RPC_URL);
    
    // Convert SOL amount to lamports
    const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
    
    // Validate addresses using @solana/kit
    const fromAddressKit = address(fromAddress);
    const toAddressKit = address(toAddress);
    
    // Use mobile wallet adapter to sign and send the transaction
    const signature = await transact(async (wallet: Web3MobileWallet) => {
      // Add a small delay to ensure the UI is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Re-authorize the wallet to ensure we have a valid auth token
      try {
        await wallet.authorize({
          identity: APP_IDENTITY,
        });
      } catch (authError) {
        console.log('Re-authorization not needed or failed:', authError);
        // Continue anyway, as the wallet might still be authorized
      }
      
      // Create connection for transaction building (web3.js for compatibility with mobile wallet adapter)
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
      
      // Convert addresses to web3.js PublicKey for transaction building
      const fromPubkey = new PublicKey(fromAddress);
      const toPubkey = new PublicKey(toAddress);
      
      // Create the transfer transaction using web3.js (required for mobile wallet adapter compatibility)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amountLamports,
        })
      );
      
      // Get recent blockhash using @solana/kit
      const { value: blockhash } = await rpc.getLatestBlockhash().send();
      transaction.recentBlockhash = blockhash.blockhash;
      transaction.feePayer = fromPubkey;
      
      // Sign the transaction using mobile wallet adapter
      const signedTransactions = await wallet.signTransactions({
        transactions: [transaction],
      });
      
      // Send the signed transaction using web3.js (since mobile wallet adapter returns web3.js Transaction)
      const result = await connection.sendRawTransaction(signedTransactions[0].serialize());
      
      // Wait for confirmation using web3.js
      await connection.confirmTransaction(result, 'confirmed');
      
      return result;
    });
    
    return signature;
    
  } catch (error) {
    console.error('Error transferring SOL:', error);
    
    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('auth_token not valid for signing')) {
      throw new Error('Wallet session expired. Please reconnect your wallet and try again.');
    } else if (errorMessage.includes('Insufficient funds') || errorMessage.includes('insufficient')) {
      throw new Error('Insufficient funds for transfer');
    } else if (errorMessage.includes('Invalid address') || errorMessage.includes('invalid')) {
      throw new Error('Invalid recipient address');
    } else if (errorMessage.includes('User rejected') || errorMessage.includes('rejected')) {
      throw new Error('Transaction was rejected by user');
    } else if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
      throw new Error('Transaction was cancelled');
    }
    
    // Preserve the original error message for other cases
    throw error;
  }
};
