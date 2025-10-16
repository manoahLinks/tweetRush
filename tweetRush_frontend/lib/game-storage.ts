/**
 * Game Storage Service
 * 
 * Stores game-related data locally to complement blockchain data
 * Used for storing guess evaluations since blockchain only stores the guesses, not the results
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface GuessEvaluation {
    guess: string;
    result: number[]; // [2,1,0,2,1] format
    timestamp: number;
}

interface GameEvaluations {
    [gameId: string]: GuessEvaluation[];
}

const STORAGE_KEY = 'game_evaluations';

class GameStorageService {
    /**
     * Store evaluation for a guess
     */
    async storeGuessEvaluation(
        address: string,
        gameId: number,
        guess: string,
        result: number[]
    ): Promise<void> {
        try {
            const key = `${STORAGE_KEY}:${address}:${gameId}`;
            const existingData = await AsyncStorage.getItem(key);
            const evaluations: GuessEvaluation[] = existingData
                ? JSON.parse(existingData)
                : [];

            evaluations.push({
                guess,
                result,
                timestamp: Date.now(),
            });

            await AsyncStorage.setItem(key, JSON.stringify(evaluations));
            console.log(`[Storage] Stored evaluation for game ${gameId}`);
        } catch (error) {
            console.error('Error storing guess evaluation:', error);
        }
    }

    /**
     * Get all evaluations for a game
     */
    async getGameEvaluations(
        address: string,
        gameId: number
    ): Promise<GuessEvaluation[]> {
        try {
            const key = `${STORAGE_KEY}:${address}:${gameId}`;
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting game evaluations:', error);
            return [];
        }
    }

    /**
     * Clear evaluations for a completed game
     */
    async clearGameEvaluations(address: string, gameId: number): Promise<void> {
        try {
            const key = `${STORAGE_KEY}:${address}:${gameId}`;
            await AsyncStorage.removeItem(key);
            console.log(`[Storage] Cleared evaluations for game ${gameId}`);
        } catch (error) {
            console.error('Error clearing game evaluations:', error);
        }
    }

    /**
     * Clear all evaluations for a user
     */
    async clearAllEvaluations(address: string): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const userKeys = keys.filter((key) => 
                key.startsWith(`${STORAGE_KEY}:${address}:`)
            );
            await AsyncStorage.multiRemove(userKeys);
            console.log(`[Storage] Cleared all evaluations for ${address}`);
        } catch (error) {
            console.error('Error clearing all evaluations:', error);
        }
    }
}

export const gameStorage = new GameStorageService();

