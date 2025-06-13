import React from 'react';
import { motion } from 'framer-motion';
import useWalletConnect from './WalletConnect';
import { LogIn, LogOut, Wallet, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

// Global notification container - will be created if it doesn't exist
const getNotificationContainer = () => {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
    document.body.appendChild(container);
  }
  return container;
};

// Add animation keyframes style to head
const addAnimationStyles = () => {
  if (!document.getElementById('notification-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-animation-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .animate-slide-in {
        animation: slideInRight 0.3s forwards;
      }
    `;
    document.head.appendChild(style);
  }
};

// Call this once to ensure animations are defined
addAnimationStyles();

const Notification = ({ type, message, onClose }) => {
  return createPortal(
    <div 
      className={`max-w-sm p-4 rounded-lg shadow-lg flex items-center justify-between animate-slide-in ${
        type === 'success' 
          ? 'bg-purple-900 text-purple-100 border-l-4 border-purple-400' 
          : 'bg-red-900 text-red-100 border-l-4 border-red-500'
      }`}
    >
      <div className="flex items-center">
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-purple-300 mr-2" /> 
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-300 mr-2" />
        )}
        <span>{message}</span>
      </div>
      <button 
        onClick={onClose}
        className="ml-4 text-sm hover:text-white"
      >
        ✕
      </button>
    </div>,
    getNotificationContainer()
  );
};

const WalletConnectButton = ({ className = "" }) => {
  const {
    isConnected,
    walletInfo,
    isLoading,
    error,
    successMessage,
    connectWallet,
    disconnectWallet,
    setError,
    setSuccessMessage
  } = useWalletConnect();

  const [copied, setCopied] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  const copyToClipboard = () => {
    if (!walletInfo?.principal) return;
    
    navigator.clipboard.writeText(walletInfo.principal)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectWallet();
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <>
      {successMessage && (
        <Notification 
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      
      {error && (
        <Notification 
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      
      {!isConnected ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
          disabled={isLoading}
          className={`btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5 ${className}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs">Connecting...</span>
            </> 
          ) : (
            <>
              <span className="text-s">Connect Wallet</span>
              <LogIn className="w-4 h-4" />
            </>
          )}
        </motion.button>
      ) : (
        <div className="flex items-center space-x-1.5">
          <div 
            className="bg-slate-800 border border-slate-700 text-white px-2 py-1 rounded-lg shadow-inner flex items-center cursor-pointer group hover:bg-slate-700"
            onClick={copyToClipboard}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
            <span className="text-xs font-medium">
              {walletInfo?.principal && `${walletInfo.principal.substring(0, 4)}...${walletInfo.principal.substring(walletInfo.principal.length - 3)} (User)`}
            </span>
            <div className="ml-1.5 text-slate-400 group-hover:text-purple-300">
              {copied ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="bg-purple-900/30 hover:bg-purple-900/50 text-white text-xs py-1 px-2 rounded-lg flex items-center gap-1 border border-purple-800/50"
            title="Disconnect"
          >
            {isDisconnecting ? (
              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span className="sr-only sm:not-sr-only">Disconnect</span>
                <LogOut className="h-3.5 w-3.5" />
              </>
            )}
          </motion.button> 
        </div>
      )}
    </>
  );
};

export default WalletConnectButton;