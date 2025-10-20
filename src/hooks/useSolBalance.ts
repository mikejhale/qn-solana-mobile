import { useState, useEffect } from 'react';
import { fetchSolBalance } from '../services/solanaService';

export const useSolBalance = (address: string | null) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      setError(null);
      return;
    }

    const loadBalance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const balanceSol = await fetchSolBalance(address);
        setBalance(balanceSol);
      } catch (err) {
        console.error('Error in useSolBalance:', err);
        setError('Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    };

    loadBalance();
  }, [address]);

  return { balance, loading, error };
};
