import React, { createContext, useContext, useState } from 'react';

const Web3Context = createContext(undefined);

export const Web3Provider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);

  // Mock functions - would be replaced with actual blockchain interactions
  const connectWallet = () => {
    // In production, this would connect to Internet Computer's Plug wallet
    setIsConnected(true);
    setAddress('2vxsx-fae'); // Example Internet Computer principal ID
    setBalance(100);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(0);
  };

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        connectWallet,
        disconnectWallet,
        address,
        balance,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};