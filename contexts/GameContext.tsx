/**
 * GameContext.tsx
 *
 * Context for managing active game state, syncing with blockchain,
 * and providing game-related functionality
 */

import { useContract } from "@/hooks/useContract";
import { invalidateCacheForAddress } from "@/lib/contract-utils";
import { GameState, GameTile, TileState } from "@/mocks";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useWallet } from "./WalletContext";

interface GameContextType {
    // Game state
    gameState: GameState | null;
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;

    // Game actions
    startGame: () => Promise<boolean>;
    submitGuess: (guess: string) => Promise<boolean>;
    forfeitGame: () => Promise<boolean>;
    refreshGameState: () => Promise<void>;

    // Helper functions
    hasActiveGame: boolean;
    canPlay: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
};

interface GameProviderProps {
    children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    const { address } = useWallet();
    const {
        isConnected,
        startNewGame,
        makeGuess,
        forfeitCurrentGame,
        getActiveGameData,
        checkHasActiveGame,
        getBountyData,
    } = useContract();

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasActiveGame =
        gameState !== null && gameState.gameStatus === "active";
    const canPlay = isConnected && !isLoading;

    /**
     * Convert blockchain game data to UI GameState
     */
    const convertToGameState = useCallback(
        async (blockchainGame: any): Promise<GameState | null> => {
            try {
                if (!blockchainGame || !blockchainGame.value) {
                    return null;
                }

                const game = blockchainGame.value;

                // Extract game data from Clarity response
                const wordIndex = game["word-index"]?.value || 0;
                const attempts = game.attempts?.value || 0;
                const maxAttempts = 6;
                const won = game.won?.value || false;
                const guesses = game.guesses?.value || [];

                // Create game grid
                const grid: GameTile[][] = [];

                // Process submitted guesses
                for (let i = 0; i < maxAttempts; i++) {
                    const row: GameTile[] = [];

                    if (i < guesses.length) {
                        // This row has a submitted guess
                        const guess = guesses[i];
                        for (let j = 0; j < 5; j++) {
                            row.push({
                                letter: guess[j] || null,
                                state: "correct" as TileState, // Will be updated by evaluation
                            });
                        }
                    } else {
                        // Empty row
                        for (let j = 0; j < 5; j++) {
                            row.push({
                                letter: null,
                                state: "empty" as TileState,
                            });
                        }
                    }

                    grid.push(row);
                }

                // Check if there's a bounty for this word
                let hasBounty = false;
                let bountyAmount = 0;
                try {
                    const bountyData = await getBountyData(wordIndex);
                    if (bountyData?.value) {
                        const bounty = bountyData.value;
                        hasBounty = bounty["is-active"]?.value || false;
                        bountyAmount =
                            (bounty["remaining-bounty"]?.value || 0) / 1000000; // Convert to STX
                    }
                } catch (e) {
                    console.log("No bounty for this word");
                }

                return {
                    wordIndex,
                    targetWord: "?????", // Hidden until game is complete
                    attempts,
                    maxAttempts,
                    currentAttempt: attempts,
                    grid,
                    gameStatus: won
                        ? "won"
                        : attempts >= maxAttempts
                        ? "lost"
                        : "active",
                    hasBounty,
                    bountyAmount,
                };
            } catch (err) {
                console.error("Error converting game state:", err);
                return null;
            }
        },
        [getBountyData]
    );

    /**
     * Load active game from blockchain
     */
    const loadActiveGame = useCallback(async () => {
        if (!address) {
            setGameState(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const hasGame = await checkHasActiveGame(address);

            if (!hasGame?.value) {
                setGameState(null);
                return;
            }

            const activeGame = await getActiveGameData(address);
            const convertedState = await convertToGameState(activeGame);
            setGameState(convertedState);
        } catch (err: any) {
            console.error("Error loading active game:", err);
            setError(err.message || "Failed to load game");
            setGameState(null);
        } finally {
            setIsLoading(false);
        }
    }, [address, checkHasActiveGame, getActiveGameData, convertToGameState]);

    /**
     * Refresh game state from blockchain
     */
    const refreshGameState = useCallback(async () => {
        if (!address) return;

        try {
            setIsRefreshing(true);
            setError(null);

            const activeGame = await getActiveGameData(address);
            const convertedState = await convertToGameState(activeGame);
            setGameState(convertedState);
        } catch (err: any) {
            console.error("Error refreshing game state:", err);
            setError(err.message || "Failed to refresh game");
        } finally {
            setIsRefreshing(false);
        }
    }, [address, getActiveGameData, convertToGameState]);

    /**
     * Start a new game
     */
    const startGame = useCallback(async (): Promise<boolean> => {
        if (!canPlay) {
            setError("Cannot start game. Please connect your wallet.");
            return false;
        }

        if (hasActiveGame) {
            setError("You already have an active game. Complete it first.");
            return false;
        }

        try {
            setIsLoading(true);
            setError(null);

            const txId = await startNewGame();

            if (!txId) {
                setError("Failed to start game");
                return false;
            }

            // Invalidate cache for this address after transaction
            if (address) {
                invalidateCacheForAddress(address);
            }

            // Wait a moment for transaction to be processed
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Reload game state
            await loadActiveGame();

            return true;
        } catch (err: any) {
            console.error("Error starting game:", err);
            setError(err.message || "Failed to start game");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [canPlay, hasActiveGame, startNewGame, loadActiveGame]);

    /**
     * Submit a guess
     */
    const submitGuess = useCallback(
        async (guess: string): Promise<boolean> => {
            if (!canPlay || !hasActiveGame) {
                setError("No active game");
                return false;
            }

            if (guess.length !== 5) {
                setError("Guess must be 5 letters");
                return false;
            }

            try {
                setIsLoading(true);
                setError(null);

                const txId = await makeGuess(guess);

                if (!txId) {
                    setError("Failed to submit guess");
                    return false;
                }

                // Invalidate cache for this address after transaction
                if (address) {
                    invalidateCacheForAddress(address);
                }

                // Wait for transaction to be processed
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // Reload game state
                await refreshGameState();

                return true;
            } catch (err: any) {
                console.error("Error submitting guess:", err);
                setError(err.message || "Failed to submit guess");
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [canPlay, hasActiveGame, makeGuess, refreshGameState]
    );

    /**
     * Forfeit current game
     */
    const forfeitGame = useCallback(async (): Promise<boolean> => {
        if (!canPlay || !hasActiveGame) {
            setError("No active game to forfeit");
            return false;
        }

        try {
            setIsLoading(true);
            setError(null);

            const txId = await forfeitCurrentGame();

            if (!txId) {
                setError("Failed to forfeit game");
                return false;
            }

            // Invalidate cache for this address after transaction
            if (address) {
                invalidateCacheForAddress(address);
            }

            // Wait for transaction to be processed
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Clear game state
            setGameState(null);

            return true;
        } catch (err: any) {
            console.error("Error forfeiting game:", err);
            setError(err.message || "Failed to forfeit game");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [canPlay, hasActiveGame, forfeitCurrentGame]);

    // Load active game on mount and when address changes
    useEffect(() => {
        loadActiveGame();
    }, [loadActiveGame]);

    // Auto-refresh game state every 30 seconds if there's an active game
    // Reduced from 10s to 30s to avoid rate limiting
    useEffect(() => {
        if (!hasActiveGame) return;

        const interval = setInterval(() => {
            refreshGameState();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [hasActiveGame, refreshGameState]);

    const value: GameContextType = {
        gameState,
        isLoading,
        isRefreshing,
        error,
        startGame,
        submitGuess,
        forfeitGame,
        refreshGameState,
        hasActiveGame,
        canPlay,
    };

    return (
        <GameContext.Provider value={value}>{children}</GameContext.Provider>
    );
};
