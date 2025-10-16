/**
 * testnet.ts
 * 
 * Testnet utilities and configuration for TweetRush
 */

import { stacksConfig, TESTNET_CONFIG } from '@/config/stacks';

export class TestnetService {
    private static instance: TestnetService;

    static getInstance(): TestnetService {
        if (!TestnetService.instance) {
            TestnetService.instance = new TestnetService();
        }
        return TestnetService.instance;
    }

    /**
     * Get testnet faucet URL for getting test STX
     */
    getFaucetUrl(): string {
        return 'https://explorer.stacks.co/?chain=testnet';
    }

    /**
     * Get testnet explorer URL
     */
    getExplorerUrl(): string {
        return 'https://explorer.stacks.co/?chain=testnet';
    }

    /**
     * Get your deployed contract URL
     */
    getContractUrl(): string {
        return `${this.getExplorerUrl()}/txid/${TESTNET_CONFIG.contractAddress}.${TESTNET_CONFIG.contractName}`;
    }

    /**
     * Check if we're on testnet
     */
    isTestnet(): boolean {
        return stacksConfig.networkType === 'testnet';
    }

    /**
     * Get network info
     */
    getNetworkInfo() {
        return {
            network: stacksConfig.networkType,
            coreApiUrl: TESTNET_CONFIG.coreApiUrl,
            contractAddress: TESTNET_CONFIG.contractAddress,
            contractName: TESTNET_CONFIG.contractName,
            isTestnet: this.isTestnet()
        };
    }
}

export const testnetService = TestnetService.getInstance();
