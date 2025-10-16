import { STACKS_TESTNET } from '@stacks/network';

/**
 * Contract Configuration
 * Update these values with your deployed contract details
 */
export const CONTRACT_CONFIG = {
  // Contract address (deployed testnet address)
  CONTRACT_ADDRESS: 'ST264AMXKZA5Y4YVMDPA3CDGFGT7Q885W8R15FK7G',

  // Contract name
  CONTRACT_NAME: 'wordleRush',

  // Network configuration (switch to STACKS_MAINNET for production)
  NETWORK: STACKS_TESTNET,

  // Default transaction options
  DEFAULT_FEE: 300, // in microSTX

  // Post condition mode
  POST_CONDITION_MODE: 'allow' as const, // 'allow' | 'deny'


};

/**
 * App Details for Stacks Connect
 */
export const APP_DETAILS = {
  name: 'Word-Rush',
  icon: 'https://your-domain.com/logo.png', // TODO: Update with your hosted logo URL
};