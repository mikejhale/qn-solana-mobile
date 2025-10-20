import { airdropFactory, createSolanaRpc, createSolanaRpcSubscriptions, lamports, address } from '@solana/kit';
import { SOLANA_RPC_URL, SOLANA_WS_URL, LAMPORTS_PER_SOL } from '../constants';

export const requestAirdrop = async (recipientAddress: string): Promise<string> => {
  try {
    // Create RPC connections using @solana/kit
    const rpc = createSolanaRpc(SOLANA_RPC_URL);
    const rpcSubscriptions = createSolanaRpcSubscriptions(SOLANA_WS_URL);
    
    // Create airdrop factory function
    const airdrop = airdropFactory({ rpc, rpcSubscriptions });
    
    // Request airdrop using factory function
    const signature = await airdrop({
      commitment: 'processed',
      lamports: lamports(BigInt(LAMPORTS_PER_SOL)), // 1 SOL
      recipientAddress: address(recipientAddress)
    });
    
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
