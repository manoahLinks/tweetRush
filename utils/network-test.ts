/**
 * network-test.ts
 * 
 * Test file to verify network configuration is working
 */

import { stacksConfig, TESTNET_CONFIG } from '@/config/stacks';

// Test function to verify network setup
export const testNetworkConfig = () => {
    console.log('🧪 Testing Network Configuration...');
    
    // Test network configuration
    console.log('Network Type:', stacksConfig.networkType);
    console.log('Network Object:', stacksConfig.network);
    console.log('Core API URL:', stacksConfig.network.coreApiUrl);
    console.log('Network ID:', stacksConfig.network.networkId);
    
    // Test testnet configuration
    console.log('Testnet Config:', TESTNET_CONFIG);
    console.log('Contract Address:', TESTNET_CONFIG.contractAddress);
    console.log('Contract Name:', TESTNET_CONFIG.contractName);
    
    // Verify testnet URLs
    const isTestnet = stacksConfig.networkType === 'testnet';
    const expectedApiUrl = 'https://stacks-node-api.testnet.stacks.co';
    const actualApiUrl = stacksConfig.network.coreApiUrl;
    
    console.log('Is Testnet:', isTestnet);
    console.log('Expected API URL:', expectedApiUrl);
    console.log('Actual API URL:', actualApiUrl);
    console.log('URL Match:', actualApiUrl === expectedApiUrl);
    
    console.log('✅ Network configuration test completed!');
    
    return {
        isTestnet,
        apiUrl: actualApiUrl,
        contractAddress: TESTNET_CONFIG.contractAddress,
        contractName: TESTNET_CONFIG.contractName
    };
};

// Export for use in development
export default testNetworkConfig;
