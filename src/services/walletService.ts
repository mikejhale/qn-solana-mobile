import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { APP_IDENTITY } from '../constants';

export const connectWallet = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Add a longer delay to ensure the UI is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      const authorizationResult = await transact(async (wallet: Web3MobileWallet) => {
        // Add a longer delay before calling authorize for mock wallet
        await new Promise(resolve => setTimeout(resolve, 1000));

        const authorizationResult = await wallet.authorize({
          identity: APP_IDENTITY,
        });
        return authorizationResult;
      });

      // Use display_address directly
      const address = authorizationResult.accounts[0].display_address;
      resolve(address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      reject(error);
    }
  });
};
