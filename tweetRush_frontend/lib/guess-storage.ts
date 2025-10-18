/**
 * Local Storage Service for Game Guesses
 * 
 * Stores guesses locally for immediate display while waiting for blockchain confirmation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocalGuess {
    guess: string;
    timestamp: number;
    gameId: number;
    wordIndex: number;
}

interface LocalGameData {
    gameId: number;
    wordIndex: number;
    guesses: LocalGuess[];
    lastUpdated: number;
}

class GuessStorageService {
    private readonly STORAGE_KEY = 'tweetrush_local_guesses';
    private readonly GAME_DATA_KEY = 'tweetrush_game_data';

    /**
     * Store a guess locally for immediate display
     */
    async storeGuess(
        address: string,
        gameId: number,
        wordIndex: number,
        guess: string
    ): Promise<void> {
        try {
            const key = `${this.STORAGE_KEY}_${address}`;
            const gameKey = `${this.GAME_DATA_KEY}_${address}`;
            
            // Get existing guesses
            const existingGuesses = await this.getGuesses(address);
            const existingGameData = await this.getGameData(address);
            
            // Create new guess entry
            const newGuess: LocalGuess = {
                guess: guess.toUpperCase(),
                timestamp: Date.now(),
                gameId,
                wordIndex
            };
            
            // Add to existing guesses
            const updatedGuesses = [...existingGuesses, newGuess];
            
            // Update game data
            const gameData: LocalGameData = {
                gameId,
                wordIndex,
                guesses: updatedGuesses,
                lastUpdated: Date.now()
            };
            
            // Store in AsyncStorage
            await AsyncStorage.setItem(key, JSON.stringify(updatedGuesses));
            await AsyncStorage.setItem(gameKey, JSON.stringify(gameData));
            
            console.log(`[GuessStorage] Stored guess locally: ${guess} for game ${gameId}`);
        } catch (error) {
            console.error('[GuessStorage] Error storing guess:', error);
        }
    }

    /**
     * Get all local guesses for an address
     */
    async getGuesses(address: string): Promise<LocalGuess[]> {
        try {
            const key = `${this.STORAGE_KEY}_${address}`;
            const stored = await AsyncStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[GuessStorage] Error getting guesses:', error);
            return [];
        }
    }

    /**
     * Get game data for an address
     */
    async getGameData(address: string): Promise<LocalGameData | null> {
        try {
            const key = `${this.GAME_DATA_KEY}_${address}`;
            const stored = await AsyncStorage.getItem(key);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('[GuessStorage] Error getting game data:', error);
            return null;
        }
    }

    /**
     * Get guesses for a specific game
     */
    async getGuessesForGame(address: string, gameId: number): Promise<LocalGuess[]> {
        try {
            const allGuesses = await this.getGuesses(address);
            return allGuesses.filter(guess => guess.gameId === gameId);
        } catch (error) {
            console.error('[GuessStorage] Error getting guesses for game:', error);
            return [];
        }
    }

    /**
     * Clear guesses for a specific game
     */
    async clearGameGuesses(address: string, gameId: number): Promise<void> {
        try {
            const allGuesses = await this.getGuesses(address);
            const remainingGuesses = allGuesses.filter(guess => guess.gameId !== gameId);
            
            const key = `${this.STORAGE_KEY}_${address}`;
            await AsyncStorage.setItem(key, JSON.stringify(remainingGuesses));
            
            console.log(`[GuessStorage] Cleared guesses for game ${gameId}`);
        } catch (error) {
            console.error('[GuessStorage] Error clearing game guesses:', error);
        }
    }

    /**
     * Clear all guesses for an address
     */
    async clearAllGuesses(address: string): Promise<void> {
        try {
            const key = `${this.STORAGE_KEY}_${address}`;
            const gameKey = `${this.GAME_DATA_KEY}_${address}`;
            
            await AsyncStorage.removeItem(key);
            await AsyncStorage.removeItem(gameKey);
            
            console.log(`[GuessStorage] Cleared all guesses for address`);
        } catch (error) {
            console.error('[GuessStorage] Error clearing all guesses:', error);
        }
    }

    /**
     * Sync local guesses with blockchain data
     * Returns merged data with blockchain taking precedence
     */
    async syncWithBlockchain(
        address: string,
        blockchainGuesses: string[],
        gameId: number
    ): Promise<string[]> {
        try {
            const localGuesses = await this.getGuessesForGame(address, gameId);
            const localGuessStrings = localGuesses.map(g => g.guess);
            
            console.log('[GuessStorage] Syncing with blockchain:');
            console.log('  Local guesses:', localGuessStrings);
            console.log('  Blockchain guesses:', blockchainGuesses);
            
            // If blockchain has more guesses, use blockchain data
            if (blockchainGuesses.length >= localGuessStrings.length) {
                console.log('[GuessStorage] Using blockchain data (more complete)');
                return blockchainGuesses;
            }
            
            // If local has more recent guesses, merge them
            const mergedGuesses = [...blockchainGuesses];
            const newLocalGuesses = localGuessStrings.slice(blockchainGuesses.length);
            mergedGuesses.push(...newLocalGuesses);
            
            console.log('[GuessStorage] Merged guesses:', mergedGuesses);
            return mergedGuesses;
        } catch (error) {
            console.error('[GuessStorage] Error syncing with blockchain:', error);
            return blockchainGuesses;
        }
    }

    /**
     * Check if we have local guesses that aren't on blockchain yet
     */
    async hasPendingGuesses(address: string, gameId: number): Promise<boolean> {
        try {
            const localGuesses = await this.getGuessesForGame(address, gameId);
            return localGuesses.length > 0;
        } catch (error) {
            console.error('[GuessStorage] Error checking pending guesses:', error);
            return false;
        }
    }

    /**
     * Get the most recent guess for a game
     */
    async getLatestGuess(address: string, gameId: number): Promise<LocalGuess | null> {
        try {
            const guesses = await this.getGuessesForGame(address, gameId);
            if (guesses.length === 0) return null;
            
            // Sort by timestamp and return most recent
            return guesses.sort((a, b) => b.timestamp - a.timestamp)[0];
        } catch (error) {
            console.error('[GuessStorage] Error getting latest guess:', error);
            return null;
        }
    }
}

// Export singleton instance
export const guessStorage = new GuessStorageService();
