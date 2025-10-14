/**
 * stacks.ts
 * 
 * Stacks blockchain network configuration for TweetRush
 */

// Simple network configuration without problematic imports

export enum NetworkType {
    MAINNET = 'mainnet',
    TESTNET = 'testnet',
}

export interface StacksConfig {
    network: any; // Using any to avoid import issues
    networkType: NetworkType;
    appName: string;
    appIcon: string;
}

// TweetRush app configuration
export const APP_CONFIG = {
    name: 'TweetRush',
    icon: 'https://your-app-icon-url.com/icon.png', // Replace with your app icon
};

// Testnet specific configuration
export const TESTNET_CONFIG = {
    coreApiUrl: 'https://stacks-node-api.testnet.stacks.co',
    networkId: 2147483648, // Testnet network ID
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Your deployed contract address
    contractName: 'tweetrush', // Your contract name
};

// Network configurations
export const getStacksConfig = (networkType: NetworkType = NetworkType.TESTNET): StacksConfig => {
    // Create a simple network configuration object
    const network = {
        coreApiUrl: networkType === NetworkType.MAINNET 
            ? 'https://stacks-node-api.mainnet.stacks.co'
            : 'https://stacks-node-api.testnet.stacks.co',
        networkId: networkType === NetworkType.MAINNET ? 1 : 2147483648,
        chainId: networkType === NetworkType.MAINNET ? 1 : 2147483648,
        bnsLookupUrl: networkType === NetworkType.MAINNET 
            ? 'https://stacks-node-api.mainnet.stacks.co'
            : 'https://stacks-node-api.testnet.stacks.co',
        broadcastUrl: networkType === NetworkType.MAINNET 
            ? 'https://stacks-node-api.mainnet.stacks.co'
            : 'https://stacks-node-api.testnet.stacks.co',
    };

    return {
        network,
        networkType,
        appName: APP_CONFIG.name,
        appIcon: APP_CONFIG.icon,
    };
};

// Default to testnet for development
export const DEFAULT_NETWORK = NetworkType.TESTNET;
export const stacksConfig = getStacksConfig(DEFAULT_NETWORK);
