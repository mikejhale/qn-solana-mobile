import { useState } from 'react';
import { requestAirdrop } from '../services/airdropService';

export const useAirdrop = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestAirdropForAddress = async (address: string): Promise<string | null> => {
    try {
      setIsRequesting(true);
      setError(null);
      
      const signature = await requestAirdrop(address);
      return signature;
    } catch (err) {
      console.error('Error in useAirdrop:', err);
      // Re-throw the error so it can be caught by the component
      throw err;
    } finally {
      setIsRequesting(false);
    }
  };

  return {
    requestAirdrop: requestAirdropForAddress,
    isRequesting,
    error
  };
};
