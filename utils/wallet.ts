/**
 * wallet.ts
 * 
 * Stacks wallet connection utilities for TweetRush
 * React Native compatible implementation
 */

import { stacksConfig } from '@/config/stacks';
import { UserSession } from '@stacks/connect';

export interface WalletInfo {
    address: string;
    publicKey: string;
    isConnected: boolean;
    userSession?: UserSession;
}

export class WalletService {
    private static instance: WalletService;
    private walletInfo: WalletInfo | null = null;
    private userSession: UserSession | null = null;

    static getInstance(): WalletService {
        if (!WalletService.instance) {
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }

    async connectWallet(): Promise<WalletInfo> {
        try {
            // For React Native, we'll use a simplified approach
            // In a real app, you'd integrate with wallet providers like Hiro Wallet
            return new Promise((resolve, reject) => {
                // Simulate wallet connection for now
                // In production, integrate with actual Stacks wallet providers
                setTimeout(() => {
                    const mockAddress = this.generateMockStxAddress();
                    const mockPublicKey = this.generateMockPublicKey();
                    
                    this.walletInfo = {
                        address: mockAddress,
                        publicKey: mockPublicKey,
                        isConnected: true,
                    };

                    resolve(this.walletInfo);
                }, 2000);
            });

        } catch (error) {
            console.error('Wallet connection failed:', error);
            throw error;
        }
    }

    async disconnectWallet(): Promise<void> {
        if (this.userSession) {
            this.userSession.signUserOut();
        }
        this.walletInfo = null;
        this.userSession = null;
    }

    getWalletInfo(): WalletInfo | null {
        return this.walletInfo;
    }

    isConnected(): boolean {
        return this.walletInfo?.isConnected ?? false;
    }

    getUserSession(): UserSession | null {
        return this.userSession;
    }

    // Get the current user's STX address
    getStxAddress(): string | null {
        return this.walletInfo?.address ?? null;
    }

    // Get the current user's public key
    getPublicKey(): string | null {
        return this.walletInfo?.publicKey ?? null;
    }

    private generateMockStxAddress(): string {
        // Generate a mock Stacks address (starts with SP for mainnet, ST for testnet)
        const prefix = stacksConfig.networkType === 'mainnet' ? 'SP' : 'ST';
        const chars = '0123456789ABCDEFGHJKMNPQRSTUVWXYZ';
        let address = prefix;
        for (let i = 0; i < 28; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    }

    private generateMockPublicKey(): string {
        // Generate a mock public key (compressed format)
        const chars = '0123456789abcdef';
        let publicKey = '02';
        for (let i = 0; i < 64; i++) {
            publicKey += chars[Math.floor(Math.random() * chars.length)];
        }
        return publicKey;
    }
}

export const walletService = WalletService.getInstance();
