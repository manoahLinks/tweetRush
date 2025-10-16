/**
 * GameContext.tsx
 *
 * Context for managing active game state, syncing with blockchain,
 * and providing game-related functionality
 */

import { useContract } from "@/hooks/useContract";
import { invalidateCacheForAddress } from "@/lib/contract-utils";
import { gameStorage } from "@/lib/game-storage";
import * as ContractUtils from "@/lib/contract-utils";
import { GameState, GameTile, TileState } from "@/mocks";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    useRef,
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
        evaluateGuessPreview,
    } = useContract();

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastGuessResult, setLastGuessResult] = useState<any>(null);
    const currentGameIdRef = useRef<number | null>(null);

    const hasActiveGame =
        gameState !== null && gameState.gameStatus === "active";
    const canPlay = isConnected && !isLoading;

    /**
     * Evaluate a guess and return tile states
     * 2 = correct position (green)
     * 1 = wrong position (yellow)
     * 0 = not in word (gray)
     */
    const evaluateGuess = (guess: string, answer: string): number[] => {
        const result: number[] = [];
        const answerChars = answer.split('');
        const guessChars = guess.split('');
        const used: boolean[] = new Array(5).fill(false);

        // First pass: mark correct positions (green)
        for (let i = 0; i < 5; i++) {
            if (guessChars[i] === answerChars[i]) {
                result[i] = 2; // correct
                used[i] = true;
            }
        }

        // Second pass: mark wrong positions (yellow) and absent (gray)
        for (let i = 0; i < 5; i++) {
            if (result[i] === 2) continue; // already marked as correct

            let found = false;
            for (let j = 0; j < 5; j++) {
                if (!used[j] && guessChars[i] === answerChars[j] && i !== j) {
                    result[i] = 1; // present but wrong position
                    used[j] = true;
                    found = true;
                    break;
                }
            }

            if (!found) {
                result[i] = 0; // not in word
            }
        }

        return result;
    };

    /**
     * Convert blockchain game data to UI GameState
     */
    const convertToGameState = useCallback(
        async (blockchainGame: any, lastGuessResult?: any): Promise<GameState | null> => {
            try {
                if (!blockchainGame || !blockchainGame.value) {
                    return null;
                }

                const game = blockchainGame.value;

                // Extract game data from Clarity response
                const wordIndex = game["word-index"]?.value || 0;
                const gameId = game["game-id"]?.value || 0;
                const attempts = game.attempts?.value || 0;
                const maxAttempts = 6;
                const won = game.won?.value || false;
                const guesses = game.guesses?.value || [];
                
                // Store current game ID
                currentGameIdRef.current = gameId;
                
                // Determine game status
                const isComplete = won || attempts >= maxAttempts;
                const gameStatus = won ? "won" : (isComplete ? "lost" : "active");

                // Get target word if game is complete
                let targetWord = "?????";
                if (isComplete) {
                    // Try to fetch the word from the blockchain
                    try {
                        const wordData = await ContractUtils.getWordAtIndex(wordIndex);
                        if (wordData?.value) {
                            targetWord = wordData.value || "?????";
                            console.log(`[Game] Fetched answer from blockchain: ${targetWord}`);
                        }
                    } catch (e) {
                        console.log("[Game] Could not fetch word, using placeholder");
                    }
                }

                // Get stored evaluations for this game
                const storedEvaluations = address 
                    ? await gameStorage.getGameEvaluations(address, gameId)
                    : [];

                // Create game grid with proper tile states
                const grid: GameTile[][] = [];

                // Process each row
                for (let i = 0; i < maxAttempts; i++) {
                    const row: GameTile[] = [];

                    if (i < guesses.length) {
                        // This row has a submitted guess
                        const guessWord = guesses[i];
                        
                        // Get evaluation result for this guess
                        let evaluation: number[] | null = null;
                        
                        // Try to get from stored evaluations first
                        const storedEval = storedEvaluations.find(e => e.guess === guessWord);
                        if (storedEval) {
                            evaluation = storedEval.result;
                            console.log(`[Game] Using stored evaluation for guess: ${guessWord}`);
                        }
                        // If we have the answer (game complete), evaluate locally
                        else if (targetWord !== "?????") {
                            evaluation = evaluateGuess(guessWord, targetWord);
                            console.log(`[Game] Evaluating with known answer: ${guessWord} vs ${targetWord}`);
                        }

                        // Create tiles with proper states
                        for (let j = 0; j < 5; j++) {
                            const letter = guessWord[j] || null;
                            let state: TileState = "empty";
                            
                            if (letter) {
                                if (evaluation) {
                                    // We have evaluation - show colors
                                    if (evaluation[j] === 2) {
                                        state = "correct";
                                    } else if (evaluation[j] === 1) {
                                        state = "present";
                                    } else {
                                        state = "absent";
                                    }
                                } else {
                                    // No evaluation yet - show as filled (active game)
                                    state = "filled";
                                }
                            }

                            row.push({ letter, state });
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

                // Clear stored evaluations if game is complete
                if (isComplete && address) {
                    await gameStorage.clearGameEvaluations(address, gameId);
                }

                return {
                    wordIndex,
                    targetWord,
                    attempts,
                    maxAttempts,
                    currentAttempt: attempts,
                    grid,
                    gameStatus,
                    hasBounty,
                    bountyAmount,
                };
            } catch (err) {
                console.error("Error converting game state:", err);
                return null;
            }
        },
        [getBountyData, address]
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
                setLastGuessResult(null);
                return;
            }

            const activeGame = await getActiveGameData(address);
            const convertedState = await convertToGameState(activeGame, lastGuessResult);
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
            const convertedState = await convertToGameState(activeGame, lastGuessResult);
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

                // First, optimistically update UI by evaluating the guess locally
                // This gives immediate visual feedback
                if (gameState) {
                    const gameId = currentGameIdRef.current || 0;
                    
                    // Create updated grid with the new guess
                    const newGrid = [...gameState.grid];
                    const currentRow = gameState.currentAttempt;
                    
                    // Add the guess to the grid temporarily with filled state
                    for (let j = 0; j < 5; j++) {
                        newGrid[currentRow][j] = {
                            letter: guess[j].toUpperCase(),
                            state: "filled" as TileState,
                        };
                    }

                    // Optimistic update
                    setGameState({
                        ...gameState,
                        grid: newGrid,
                    });
                }

                // Submit the guess transaction
                const { txId } = await makeGuess(guess);

                if (!txId) {
                    setError("Failed to submit guess");
                    // Revert optimistic update
                    await loadActiveGame();
                    return false;
                }

                console.log(`[Game] Guess submitted, waiting for confirmation...`);

                // Invalidate cache for this address after transaction
                if (address) {
                    invalidateCacheForAddress(address);
                }

                // Wait for transaction to be processed and confirmed
                await new Promise((resolve) => setTimeout(resolve, 4000));

                // Reload game state from blockchain
                await loadActiveGame();

                return true;
            } catch (err: any) {
                console.error("Error submitting guess:", err);
                setError(err.message || "Failed to submit guess");
                // Revert optimistic update
                await loadActiveGame();
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [canPlay, hasActiveGame, makeGuess, getActiveGameData, address, gameState, loadActiveGame]
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
