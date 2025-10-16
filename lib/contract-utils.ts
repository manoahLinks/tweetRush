import {
    bufferCV,
    ClarityValue,
    cvToValue,
    fetchCallReadOnlyFunction,
    listCV,
    makeSTXTokenTransfer,
    noneCV,
    PostConditionMode,
    principalCV,
    someCV,
    stringAsciiCV,
    stringUtf8CV,
    tupleCV,
    uintCV,
} from "@stacks/transactions";
import { apiCache } from "./api-cache";
import { CONTRACT_CONFIG } from "./contract-config";

/**
 * Base function for read-only contract calls
 * Use this to fetch data from the blockchain without spending gas
 * Includes caching and rate limiting
 */
export async function callReadOnly<T = any>(
    functionName: string,
    functionArgs: ClarityValue[] = [],
    senderAddress?: string
): Promise<T> {
    // Create cache key from function name and args
    const cacheKey = `${functionName}:${JSON.stringify(functionArgs)}:${
        senderAddress || ""
    }`;

    // Get appropriate TTL for this operation
    const ttl = apiCache.getCacheTTL(functionName);

    try {
        return await apiCache.getCached(
            cacheKey,
            async () => {
                const response = await fetchCallReadOnlyFunction({
                    contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
                    contractName: CONTRACT_CONFIG.CONTRACT_NAME,
                    functionName,
                    functionArgs,
                    senderAddress:
                        senderAddress || CONTRACT_CONFIG.CONTRACT_ADDRESS,
                    network: CONTRACT_CONFIG.NETWORK,
                });

                // Convert Clarity value to JavaScript value
                return cvToValue(response) as T;
            },
            ttl
        );
    } catch (error) {
        console.error(`Error calling ${functionName}:`, error);
        throw error;
    }
}

/**
 * Invalidate cache for a specific function call
 */
export function invalidateCache(
    functionName: string,
    functionArgs: ClarityValue[] = [],
    senderAddress?: string
): void {
    const cacheKey = `${functionName}:${JSON.stringify(functionArgs)}:${
        senderAddress || ""
    }`;
    apiCache.invalidate(cacheKey);
}

/**
 * Invalidate all cache for a specific address (e.g., after a transaction)
 */
export function invalidateCacheForAddress(address: string): void {
    apiCache.invalidatePattern(address);
}

/**
 * Prepare transaction options for contract calls
 * Returns options that can be used with transaction signing
 */
export function prepareContractCall(
    functionName: string,
    functionArgs: ClarityValue[] = []
) {
    return {
        contractAddress: CONTRACT_CONFIG.CONTRACT_ADDRESS,
        contractName: CONTRACT_CONFIG.CONTRACT_NAME,
        functionName,
        functionArgs,
        postConditionMode: PostConditionMode.Allow,
        network: CONTRACT_CONFIG.NETWORK,
    };
}

/**
 * Prepare STX transfer transaction
 */
export async function prepareSTXTransfer(
    recipientAddress: string,
    amount: number, // in microSTX
    senderPrivateKey: string,
    memo?: string
) {
    const txOptions = {
        recipient: recipientAddress,
        amount: amount,
        senderKey: senderPrivateKey,
        network: CONTRACT_CONFIG.NETWORK,
        memo: memo,
        anchorMode: "any" as const,
    };

    return await makeSTXTokenTransfer(txOptions);
}

/**
 * Clarity Value Helpers
 * Use these to convert JavaScript values to Clarity types
 */
export const clarityHelpers = {
    uint: (value: number) => uintCV(value),
    stringAscii: (value: string) => stringAsciiCV(value),
    stringUtf8: (value: string) => stringUtf8CV(value),
    principal: (address: string) => principalCV(address),
    tuple: (data: Record<string, ClarityValue>) => tupleCV(data),
    list: (items: ClarityValue[]) => listCV(items),
    some: (value: ClarityValue) => someCV(value),
    none: () => noneCV(),
    buffer: (value: Buffer) => bufferCV(value),
};

// ===========================================
// USER REGISTRATION FUNCTIONS
// ===========================================

/**
 * Register a user with a unique username
 * @param username - Username (max 50 characters)
 * @returns Transaction options
 */
export async function registerUser(username: string) {
    const functionArgs = [stringUtf8CV(username)];
    return prepareContractCall("register-user", functionArgs);
}

/**
 * Get user registration data
 * @param userAddress - User's Stacks address
 * @returns User data or null
 */
export async function getUser(userAddress: string) {
    return await callReadOnly("get-user", [principalCV(userAddress)]);
}

// ===========================================
// GAME FUNCTIONS
// ===========================================

/**
 * Start a new game
 * @returns Transaction options
 */
export function startGame() {
    return prepareContractCall("start-game", []);
}

/**
 * Submit a guess for the current game
 * @param guess - 5-letter word guess
 * @returns Transaction options
 */
export function submitGuess(guess: string) {
    const functionArgs = [stringAsciiCV(guess.toUpperCase())];
    return prepareContractCall("submit-guess", functionArgs);
}

/**
 * Forfeit the current game
 * @returns Transaction options
 */
export function forfeitGame() {
    return prepareContractCall("forfeit-game", []);
}

/**
 * Evaluate a guess against an answer (read-only for UI preview)
 * @param guess - 5-letter guess
 * @param answer - 5-letter answer
 * @returns Evaluation result
 */
export async function evaluateGuess(guess: string, answer: string) {
    return await callReadOnly("evaluate-guess", [
        stringAsciiCV(guess.toUpperCase()),
        stringAsciiCV(answer.toUpperCase()),
    ]);
}

/**
 * Get active game for a player
 * @param playerAddress - Player's Stacks address
 * @returns Active game data or null
 */
export async function getActiveGame(playerAddress: string) {
    return await callReadOnly("get-active-game", [principalCV(playerAddress)]);
}

/**
 * Get game history for a player
 * @param playerAddress - Player's Stacks address
 * @param gameId - Game ID
 * @returns Game history data
 */
export async function getGameHistory(playerAddress: string, gameId: number) {
    return await callReadOnly("get-game-history", [
        principalCV(playerAddress),
        uintCV(gameId),
    ]);
}

/**
 * Check if player has an active game
 * @param playerAddress - Player's Stacks address
 * @returns Boolean indicating if player has active game
 */
export async function hasActiveGame(playerAddress: string) {
    return await callReadOnly("has-active-game", [principalCV(playerAddress)]);
}

/**
 * Get player statistics
 * @param playerAddress - Player's Stacks address
 * @returns Player stats
 */
export async function getPlayerStats(playerAddress: string) {
    return await callReadOnly("get-player-stats", [principalCV(playerAddress)]);
}

/**
 * Get total number of words in the pool
 * @returns Total words count
 */
export async function getTotalWords() {
    return await callReadOnly("get-total-words", []);
}

/**
 * Get word at specific index
 * @param index - Word index
 * @returns Word or null
 */
export async function getWordAtIndex(index: number) {
    return await callReadOnly("get-word-at-index", [uintCV(index)]);
}

/**
 * Get game counter
 * @returns Current game counter
 */
export async function getGameCounter() {
    return await callReadOnly("get-game-counter", []);
}

// ===========================================
// BOUNTY FUNCTIONS
// ===========================================

/**
 * Fund a bounty for a specific word
 * @param wordIndex - Index of the word
 * @param amount - Amount in microSTX
 * @returns Transaction options
 */
export function fundBounty(wordIndex: number, amount: number) {
    const functionArgs = [uintCV(wordIndex), uintCV(amount)];
    return prepareContractCall("fund-bounty", functionArgs);
}

/**
 * Get bounty information for a word
 * @param wordIndex - Index of the word
 * @returns Bounty data
 */
export async function getBounty(wordIndex: number) {
    return await callReadOnly("get-bounty", [uintCV(wordIndex)]);
}

/**
 * Claim bounty reward for a won game
 * @param wordIndex - Index of the word
 * @returns Transaction options
 */
export function claimBounty(wordIndex: number) {
    const functionArgs = [uintCV(wordIndex)];
    return prepareContractCall("claim-bounty", functionArgs);
}

/**
 * Get bounty claim information
 * @param wordIndex - Index of the word
 * @param playerAddress - Player's Stacks address
 * @returns Bounty claim data
 */
export async function getBountyClaim(wordIndex: number, playerAddress: string) {
    return await callReadOnly("get-bounty-claim", [
        uintCV(wordIndex),
        principalCV(playerAddress),
    ]);
}

/**
 * Get reward amount information
 * @param wordIndex - Index of the word
 * @param playerAddress - Player's Stacks address
 * @returns Reward amount data
 */
export async function getRewardAmount(
    wordIndex: number,
    playerAddress: string
) {
    return await callReadOnly("get-reward-amount", [
        uintCV(wordIndex),
        principalCV(playerAddress),
    ]);
}

/**
 * Get bounty counter
 * @returns Current bounty counter
 */
export async function getBountyCounter() {
    return await callReadOnly("get-bounty-counter", []);
}

// ===========================================
// ADMIN FUNCTIONS
// ===========================================

/**
 * Add a word to the pool (admin only)
 * @param word - 5-letter word
 * @returns Transaction options
 */
export function addWord(word: string) {
    const functionArgs = [stringAsciiCV(word.toUpperCase())];
    return prepareContractCall("add-word", functionArgs);
}

/**
 * Add multiple words to the pool (admin only)
 * @param words - Array of 5-letter words
 * @returns Transaction options
 */
export function addWords(words: string[]) {
    const wordsCVs = words.map((word) => stringAsciiCV(word.toUpperCase()));
    const functionArgs = [listCV(wordsCVs)];
    return prepareContractCall("add-words", functionArgs);
}

/**
 * Remove a word from the pool (admin only)
 * @param wordIndex - Index of the word to remove
 * @returns Transaction options
 */
export function removeWord(wordIndex: number) {
    const functionArgs = [uintCV(wordIndex)];
    return prepareContractCall("remove-word", functionArgs);
}
