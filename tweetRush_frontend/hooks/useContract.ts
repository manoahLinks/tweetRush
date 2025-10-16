import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import { Alert } from "react-native";
// import { useAppStore } from '@/store/useAppStore';
import { CONTRACT_CONFIG } from "@/lib/contract-config";
import * as ContractUtils from "@/lib/contract-utils";
import { invalidateCacheForAddress } from "@/lib/contract-utils";
import {
    AnchorMode,
    broadcastTransaction,
    makeContractCall,
    PostConditionMode,
} from "@stacks/transactions";

/**
 * Custom hook for TweetRush contract interactions
 * Provides wallet connection state and contract call functions
 *
 * Usage:
 *   const { isConnected, address, registerUser, createStory } = useContract();
 */
export function useContract() {
    const { wallet, address, mnemonic, getPrivateKey } = useWallet();
    //   const { user, updateUser } = useAppStore();
    const [isProcessing, setIsProcessing] = useState(false);

    const isConnected = !!wallet && !!address;

    /**
     * Generic contract call function
     * @param functionName - Contract function to call
     * @param functionArgs - Clarity value arguments
     * @param onSuccess - Callback on successful transaction
     */
    async function callContract(
        functionName: string,
        functionArgs: any[] = [],
        onSuccess?: (txId: string) => void
    ): Promise<string | null> {
        if (!wallet || !address) {
            Alert.alert("Wallet Error", "Please connect your wallet first");
            return null;
        }

        const privateKey = getPrivateKey();
        if (!privateKey) {
            Alert.alert("Error", "Unable to access wallet credentials");
            return null;
        }

        setIsProcessing(true);

        try {
            // Build transaction
            const txOptions = {
                contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
                contractName: CONTRACT_CONFIG.CONTRACT_NAME,
                functionName,
                functionArgs,
                senderKey: privateKey,
                network: CONTRACT_CONFIG.NETWORK,
                anchorMode: AnchorMode.Any,
                postConditionMode: PostConditionMode.Allow,
                fee: CONTRACT_CONFIG.DEFAULT_FEE,
            };

            const transaction = await makeContractCall(txOptions);

            // Broadcast transaction
            const broadcastResponse = await broadcastTransaction({
                transaction,
                network: CONTRACT_CONFIG.NETWORK,
            });

            if ("error" in broadcastResponse) {
                throw new Error(broadcastResponse.error);
            }

            const txId = broadcastResponse.txid;
            console.log("Transaction broadcast successfully:", txId);

            // Invalidate cache after successful transaction
            if (address) {
                invalidateCacheForAddress(address);
            }

            if (onSuccess) {
                onSuccess(txId);
            }

            Alert.alert(
                "Success",
                `Transaction submitted: ${txId.substring(0, 8)}...`
            );
            return txId;
        } catch (error: any) {
            console.error("Contract call failed:", error);
            Alert.alert(
                "Transaction Failed",
                error.message || "Unknown error occurred"
            );
            return null;
        } finally {
            setIsProcessing(false);
        }
    }

    /**
     * Send STX to an address
     * @param recipientAddress - Recipient's Stacks address
     * @param amount - Amount in microSTX (1 STX = 1,000,000 microSTX)
     * @param memo - Optional memo text
     */
    async function sendSTX(
        recipientAddress: string,
        amount: number,
        memo?: string
    ): Promise<string | null> {
        if (!wallet || !address) {
            Alert.alert("Wallet Error", "Please connect your wallet first");
            return null;
        }

        const privateKey = getPrivateKey();
        if (!privateKey) {
            Alert.alert("Error", "Unable to access wallet credentials");
            return null;
        }

        setIsProcessing(true);

        try {
            const transaction = await ContractUtils.prepareSTXTransfer(
                recipientAddress,
                amount,
                privateKey,
                memo
            );

            const broadcastResponse = await broadcastTransaction({
                transaction,
                network: CONTRACT_CONFIG.NETWORK,
            });

            if ("error" in broadcastResponse) {
                throw new Error(broadcastResponse.error);
            }

            const txId = broadcastResponse.txid;
            console.log("STX transfer successful:", txId);

            Alert.alert("Success", `Sent ${amount / 1000000} STX`);
            return txId;
        } catch (error: any) {
            console.error("STX transfer failed:", error);
            Alert.alert(
                "Transfer Failed",
                error.message || "Unknown error occurred"
            );
            return null;
        } finally {
            setIsProcessing(false);
        }
    }

    /**
     * Read-only contract call wrapper
     * Use this to fetch data from the blockchain
     */
    async function readContract<T = any>(
        functionName: string,
        functionArgs: any[] = []
    ): Promise<T | null> {
        try {
            return await ContractUtils.callReadOnly<T>(
                functionName,
                functionArgs,
                address || undefined
            );
        } catch (error: any) {
            console.error("Read-only call failed:", error);
            return null;
        }
    }

    // ===========================================
    // WordRush CONTRACT FUNCTIONS
    // ===========================================

    /**
     * Register user with username
     * @param username - Username (max 50 characters)
     */
    async function registerUserOnChain(username: string) {
        const txOptions = await ContractUtils.registerUser(username);

        return await callContract(
            txOptions.functionName,
            txOptions.functionArgs,
            (txId) => {
                console.log("User registered on chain:", txId);
            }
        );
    }

    /**
     * Get user data from blockchain
     * @param userAddress - User's Stacks address
     */
    async function getUserData(userAddress: string) {
        return await ContractUtils.getUser(userAddress);
    }

    // ===========================================
    // GAME FUNCTIONS
    // ===========================================

    /**
     * Start a new game
     */
    async function startNewGame() {
        console.log("[useContract] startNewGame called");
        const txOptions = ContractUtils.startGame();
        console.log("[useContract] Start game options:", txOptions);
        const result = await callContract(
            txOptions.functionName,
            txOptions.functionArgs,
            (txId) => {
                console.log("[useContract] Game started with txId:", txId);
            }
        );
        console.log("[useContract] startNewGame result:", result);
        return result;
    }

    /**
     * Submit a guess for the current game
     * @param guess - 5-letter word guess
     * @returns Transaction ID and guess result
     */
    async function makeGuess(
        guess: string
    ): Promise<{ txId: string | null; result: any }> {
        console.log("[useContract] makeGuess called with:", guess);
        const txOptions = ContractUtils.submitGuess(guess);
        console.log("[useContract] Submit guess options:", txOptions);
        const txId = await callContract(
            txOptions.functionName,
            txOptions.functionArgs,
            (txId) => {
                console.log("[useContract] Guess submitted with txId:", txId);
            }
        );
        console.log("[useContract] makeGuess result txId:", txId);

        // Return both txId and a placeholder for result (will be fetched after confirmation)
        return { txId, result: null };
    }

    /**
     * Forfeit the current game
     */
    async function forfeitCurrentGame() {
        const txOptions = ContractUtils.forfeitGame();
        return await callContract(
            txOptions.functionName,
            txOptions.functionArgs,
            (txId) => {
                console.log("Game forfeited:", txId);
            }
        );
    }

    /**
     * Get active game for player
     * @param playerAddress - Player's Stacks address
     */
    async function getActiveGameData(playerAddress: string) {
        console.log(
            "[useContract] getActiveGameData called for:",
            playerAddress
        );
        const result = await ContractUtils.getActiveGame(playerAddress);
        console.log("[useContract] getActiveGameData result:", result);
        return result;
    }

    /**
     * Check if player has an active game
     * @param playerAddress - Player's Stacks address
     */
    async function checkHasActiveGame(playerAddress: string) {
        console.log(
            "[useContract] checkHasActiveGame called for:",
            playerAddress
        );
        const result = await ContractUtils.hasActiveGame(playerAddress);
        console.log("[useContract] checkHasActiveGame result:", result);
        return result;
    }

    /**
     * Get game history for player
     * @param playerAddress - Player's Stacks address
     * @param gameId - Game ID
     */
    async function getGameHistoryData(playerAddress: string, gameId: number) {
        return await ContractUtils.getGameHistory(playerAddress, gameId);
    }

    /**
     * Get player statistics
     * @param playerAddress - Player's Stacks address
     */
    async function getPlayerStatsData(playerAddress: string) {
        return await ContractUtils.getPlayerStats(playerAddress);
    }

    /**
     * Evaluate a guess (read-only for UI preview)
     * @param guess - 5-letter guess
     * @param answer - 5-letter answer
     */
    async function evaluateGuessPreview(guess: string, answer: string) {
        return await ContractUtils.evaluateGuess(guess, answer);
    }

    // ===========================================
    // BOUNTY FUNCTIONS
    // ===========================================

    /**
     * Fund a bounty for a word
     * @param wordIndex - Index of the word
     * @param amount - Amount in microSTX
     */
    async function createBounty(wordIndex: number, amount: number) {
        const txOptions = ContractUtils.fundBounty(wordIndex, amount);
        return await callContract(
            txOptions.functionName,
            txOptions.functionArgs,
            (txId) => {
                console.log("Bounty funded:", txId);
            }
        );
    }

    /**
     * Claim bounty reward
     * @param wordIndex - Index of the word
     */
    async function claimBountyReward(wordIndex: number) {
        const txOptions = ContractUtils.claimBounty(wordIndex);
        return await callContract(
            txOptions.functionName,
            txOptions.functionArgs,
            (txId) => {
                console.log("Bounty claimed:", txId);
            }
        );
    }

    /**
     * Get bounty data for a word
     * @param wordIndex - Index of the word
     */
    async function getBountyData(wordIndex: number) {
        return await ContractUtils.getBounty(wordIndex);
    }

    /**
     * Get bounty claim information
     * @param wordIndex - Index of the word
     * @param playerAddress - Player's Stacks address
     */
    async function getBountyClaimData(
        wordIndex: number,
        playerAddress: string
    ) {
        return await ContractUtils.getBountyClaim(wordIndex, playerAddress);
    }

    /**
     * Get reward amount information
     * @param wordIndex - Index of the word
     * @param playerAddress - Player's Stacks address
     */
    async function getRewardAmountData(
        wordIndex: number,
        playerAddress: string
    ) {
        return await ContractUtils.getRewardAmount(wordIndex, playerAddress);
    }

    // ===========================================
    // ADMIN FUNCTIONS
    // ===========================================

    /**
     * Add a word to the pool (admin only)
     * @param word - 5-letter word
     */
    async function addWord(word: string) {
        const txOptions = ContractUtils.addWord(word);
        return await callContract(
            txOptions.functionName,
            txOptions.functionArgs,
            (txId) => {
                console.log("Word added on chain:", txId);
            }
        );
    }

    /**
     * Add multiple words to the pool (admin only)
     * @param words - Array of 5-letter words
     */
    async function addMultipleWords(words: string[]) {
        const txOptions = ContractUtils.addWords(words);
        return await callContract(
            txOptions.functionName,
            txOptions.functionArgs,
            (txId) => {
                console.log("Words added on chain:", txId);
            }
        );
    }

    /**
     * Remove a word from the pool (admin only)
     * @param wordIndex - Index of the word to remove
     */
    async function removeWordFromPool(wordIndex: number) {
        const txOptions = ContractUtils.removeWord(wordIndex);
        return await callContract(
            txOptions.functionName,
            txOptions.functionArgs,
            (txId) => {
                console.log("Word removed from chain:", txId);
            }
        );
    }

    /**
     * Get total words in pool
     */
    async function getTotalWordsCount() {
        return await ContractUtils.getTotalWords();
    }

    /**
     * Get game counter
     */
    async function getGameCounterValue() {
        return await ContractUtils.getGameCounter();
    }

    /**
     * Get bounty counter
     */
    async function getBountyCounterValue() {
        return await ContractUtils.getBountyCounter();
    }

    return {
        // Wallet state
        isConnected,
        address,
        wallet,
        isProcessing,

        // Generic functions
        callContract,
        readContract,
        sendSTX,

        // User functions
        registerUserOnChain,
        getUserData,

        // Game functions
        startNewGame,
        makeGuess,
        forfeitCurrentGame,
        getActiveGameData,
        checkHasActiveGame,
        getGameHistoryData,
        getPlayerStatsData,
        evaluateGuessPreview,

        // Bounty functions
        createBounty,
        claimBountyReward,
        getBountyData,
        getBountyClaimData,
        getRewardAmountData,

        // Admin functions
        addWord,
        addMultipleWords,
        removeWordFromPool,
        getTotalWordsCount,
        getGameCounterValue,
        getBountyCounterValue,
    };
}
