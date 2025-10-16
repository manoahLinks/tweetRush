import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMnemonic } from '@scure/bip39';
import { wordlist as english } from '@scure/bip39/wordlists/english.js';
import { getAddressFromPrivateKey } from '@stacks/transactions';
import { generateWallet, Wallet } from '@stacks/wallet-sdk';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface WalletContextType {
  wallet: Wallet | null;
  mnemonic: string | null;
  address: string | null;
  isLoading: boolean;
  createNewWallet: (mnemonic?: string) => Promise<void>;
  loginWithMnemonic: (mnemonic: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getPrivateKey: () => string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const storedMnemonic = await AsyncStorage.getItem('walletMnemonic');
      if (storedMnemonic) {
        // Silent wallet restoration on app startup
        const restoredWallet = await generateWallet({
          secretKey: storedMnemonic.trim(),
          password: '',
        });
        setWallet(restoredWallet);
        setMnemonic(storedMnemonic.trim());

        const walletAddress = getAddressFromPrivateKey(
          restoredWallet.accounts[0].stxPrivateKey,
          'testnet'
        );
        setAddress(walletAddress);
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewWallet = async (mnemonic?: string) => {
    try {

        console.log(mnemonic)
      // Use provided mnemonic or generate a new one using generateSecretKey
      const newMnemonic = mnemonic || generateMnemonic(english);
      setMnemonic(newMnemonic);

      // Create wallet from mnemonic
      const newWallet = await generateWallet({
        secretKey: newMnemonic,
        password: '',
      });
      setWallet(newWallet);

      // Get address (using testnet)
      const walletAddress = getAddressFromPrivateKey(
        newWallet.accounts[0].stxPrivateKey,
        'testnet'
      );
      setAddress(walletAddress);

      // Store mnemonic securely
      await AsyncStorage.setItem('walletMnemonic', newMnemonic);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  };

  const loginWithMnemonic = async (inputMnemonic: string): Promise<boolean> => {
    try {
      // Validate and create wallet from mnemonic
      const restoredWallet = await generateWallet({
        secretKey: inputMnemonic.trim(),
        password: '',
      });
      setWallet(restoredWallet);
      setMnemonic(inputMnemonic.trim());

      // Get address
      const walletAddress = getAddressFromPrivateKey(
        restoredWallet.accounts[0].stxPrivateKey,
        'testnet'
      );
      setAddress(walletAddress);

      // Store mnemonic
      await AsyncStorage.setItem('walletMnemonic', inputMnemonic.trim());

      return true;
    } catch (error) {
      console.error('Failed to login with mnemonic:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('walletMnemonic');
      setWallet(null);
      setMnemonic(null);
      setAddress(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getPrivateKey = (): string | null => {
    return wallet?.accounts[0].stxPrivateKey || null;
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        mnemonic,
        address,
        isLoading,
        createNewWallet,
        loginWithMnemonic,
        logout,
        getPrivateKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};