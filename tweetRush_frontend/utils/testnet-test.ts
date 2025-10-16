/**
 * testnet-test.ts
 * 
 * Test file to verify testnet configuration
 */

import { stacksConfig, TESTNET_CONFIG } from '@/config/stacks';
import { testnetService } from './testnet';

// Test function to verify testnet setup
export const testTestnetConfig = () => {
    console.log('🧪 Testing Testnet Configuration...');
    
    // Test network configuration
    console.log('Network Type:', stacksConfig.networkType);
    console.log('Network Object:', stacksConfig.network);
    
    // Test testnet service
    console.log('Is Testnet:', testnetService.isTestnet());
    console.log('Network Info:', testnetService.getNetworkInfo());
    console.log('Faucet URL:', testnetService.getFaucetUrl());
    console.log('Explorer URL:', testnetService.getExplorerUrl());
    console.log('Contract URL:', testnetService.getContractUrl());
    
    // Test contract configuration
    console.log('Contract Address:', TESTNET_CONFIG.contractAddress);
    console.log('Contract Name:', TESTNET_CONFIG.contractName);
    console.log('Core API URL:', TESTNET_CONFIG.coreApiUrl);
    
    console.log('✅ Testnet configuration test completed!');
};

// Export for use in development
export default testTestnetConfig;
