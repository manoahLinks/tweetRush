import Header from "@/components/game/Header";
import Keyboard from "@/components/game/Keyboard";
import Tile from "@/components/game/Tile";
import Modal from "@/components/ui/Modal";
import { useContract } from "@/hooks/useContract";
import { LetterState, GameTile, TileState } from "@/mocks";
import { gameStorage } from "@/lib/game-storage";
import { guessStorage } from "@/lib/guess-storage";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

interface GameScreenProps {
    onBack: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onBack }) => {
    const {
        getActiveGameData,
        makeGuess,
        forfeitCurrentGame,
        claimBountyReward,
        getBountyData,
        startNewGame: contractStartNewGame,
        isProcessing,
        address,
    } = useContract();

    const [currentInput, setCurrentInput] = useState("");
    const [letterStates, setLetterStates] = useState<
        Record<string, LetterState>
    >({});
    const [showWinModal, setShowWinModal] = useState(false);
    const [showLoseModal, setShowLoseModal] = useState(false);
    const [showForfeitModal, setShowForfeitModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isClaimingBounty, setIsClaimingBounty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [gameState, setGameState] = useState<any>(null);
    const [localGuesses, setLocalGuesses] = useState<string[]>([]);

    // ===== ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS =====

    // Load game on mount
    useEffect(() => {
        // Clear local state when loading a new game
        setLocalGuesses([]);
        setCurrentInput("");
        loadGame();
    }, []);

    // Check for game completion
    useEffect(() => {
        if (!gameState) return;

        // Check if game is won (this would come from blockchain)
        if (gameState.gameStatus === "won") {
            setShowSuccessModal(true);
            // Clear local guesses when game is won
            setLocalGuesses([]);
            if (address) {
                guessStorage.clearGameGuesses(address, gameState.wordIndex);
            }
        } else if (gameState.gameStatus === "lost") {
            setShowLoseModal(true);
            // Clear local guesses when game is lost
            setLocalGuesses([]);
            if (address) {
                guessStorage.clearGameGuesses(address, gameState.wordIndex);
            }
        }
        // Check if max attempts reached locally
        else if (localGuesses.length >= gameState.maxAttempts) {
            console.log("[GameScreen] Max attempts reached, ending game");
            setShowLoseModal(true);
            // Clear local guesses when max attempts reached
            setLocalGuesses([]);
            if (address) {
                guessStorage.clearGameGuesses(address, gameState.wordIndex);
            }
        }
    }, [gameState?.gameStatus, localGuesses.length, gameState?.maxAttempts, address, gameState?.wordIndex]);

    // Calculate letter states from game grid
    useEffect(() => {
        if (!gameState) return;

        const states: Record<string, LetterState> = {};
        gameState.grid.forEach((row: any) => {
            row.forEach((tile: any) => {
                if (
                    tile.letter &&
                    tile.state !== "empty" &&
                    tile.state !== "filled"
                ) {
                    const currentState = states[tile.letter];
                    // Priority: correct > present > absent
                    if (tile.state === "correct") {
                        states[tile.letter] = "correct";
                    } else if (
                        tile.state === "present" &&
                        currentState !== "correct"
                    ) {
                        states[tile.letter] = "present";
                    } else if (!currentState) {
                        states[tile.letter] = tile.state as LetterState;
                    }
                }
            });
        });
        setLetterStates(states);
    }, [gameState]);

    // ===== ALL FUNCTION DEFINITIONS =====

    /**
     * Evaluate a guess locally (same logic as contract)
     * Returns array of: 2 = correct, 1 = present, 0 = absent
     */
    const evaluateGuessLocally = (guess: string, answer: string): number[] => {
        const result: number[] = [];
        const answerChars = answer.toUpperCase().split("");
        const guessChars = guess.toUpperCase().split("");
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

    const loadGame = async () => {
        if (!address) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log("[GameScreen] Loading game data...");
            const response = await getActiveGameData(address);
            console.log("[GameScreen] Game data:", response);

            if (response?.value) {
                // Convert blockchain data to UI format
                const game = response.value;
                const attempts = game.attempts?.value || 0;
                const won = game.won?.value || false;
                const maxAttempts = 6;
                const isComplete = won || attempts >= maxAttempts;
                const wordIndex = game["word-index"]?.value || 0;

                // Get all guesses from blockchain
                const blockchainGuesses = game.guesses?.value || [];
                const gameId = game["game-id"]?.value || 0;
                
                // Get local guesses and sync with blockchain
                const localGuesses = await guessStorage.getGuessesForGame(address, gameId);
                const localGuessStrings = localGuesses.map(g => g.guess);
                
                console.log("[GameScreen] ========== GUESS SYNC ==========");
                console.log("[GameScreen] Blockchain guesses:", blockchainGuesses);
                console.log("[GameScreen] Local guesses:", localGuessStrings);
                console.log("[GameScreen] Local guesses count:", localGuesses.length);
                console.log("[GameScreen] Blockchain guesses count:", blockchainGuesses.length);
                
                // Merge local and blockchain guesses (blockchain takes precedence for existing ones)
                let allGuesses = await guessStorage.syncWithBlockchain(
                    address, 
                    blockchainGuesses, 
                    gameId
                );
                
                // If no guesses from storage, use local state as fallback
                if (allGuesses.length === 0 && localGuesses.length > 0) {
                    console.log("[GameScreen] Using local state guesses as fallback:", localGuesses);
                    allGuesses = localGuesses;
                }
                
                console.log("[GameScreen] Final merged guesses:", allGuesses);
                console.log("[GameScreen] Final merged guesses count:", allGuesses.length);
                console.log("[GameScreen] ========== LOADING GAME ==========");
                console.log(
                    "[GameScreen] Raw game data:",
                    JSON.stringify(game, null, 2)
                );
                console.log("[GameScreen] Guesses from blockchain:", blockchainGuesses);
                console.log(
                    "[GameScreen] Guesses type:",
                    typeof blockchainGuesses,
                    Array.isArray(blockchainGuesses)
                );
                console.log("[GameScreen] Number of blockchain guesses:", blockchainGuesses.length);
                console.log("[GameScreen] Game ID:", gameId);
                console.log("[GameScreen] Attempts:", attempts);

                // Get stored evaluations
                const storedEvals = address
                    ? await gameStorage.getGameEvaluations(address, gameId)
                    : [];
                console.log("[GameScreen] Stored evaluations:", storedEvals);

                // Try to get the answer word (only available if game is complete)
                let targetWord = "?????";
                let hasAnswer = false;

                // If game is complete, try to fetch the answer
                if (isComplete) {
                    try {
                        const wordResponse = await getActiveGameData(address);
                        // The answer might be in the response if game is complete
                        // For now, we'll use stored evaluations
                        console.log(
                            "[GameScreen] Game is complete, answer should be available"
                        );
                    } catch (err) {
                        console.log(
                            "[GameScreen] Could not fetch answer:",
                            err
                        );
                    }
                }

                const grid: GameTile[][] = [];

                console.log("[GameScreen] ========== BUILDING GRID ==========");
                console.log("[GameScreen] Building grid with", allGuesses.length, "guesses:", allGuesses);
                for (let i = 0; i < maxAttempts; i++) {
                    const row: GameTile[] = [];

                    if (i < allGuesses.length) {
                        let guess = allGuesses[i];
                        console.log(`[GameScreen] Processing guess ${i + 1}:`, guess);
                        console.log(
                            `[GameScreen] Row ${i + 1}: Raw guess:`,
                            guess
                        );
                        console.log(
                            `[GameScreen] Row ${i + 1}: Guess type:`,
                            typeof guess
                        );

                        // Convert guess to string if needed and ensure uppercase
                        const guessString = String(guess).toUpperCase();
                        console.log(
                            `[GameScreen] Row ${i + 1}: Guess string:`,
                            guessString
                        );
                        console.log(
                            `[GameScreen] Row ${i + 1}: Guess length:`,
                            guessString.length
                        );

                        // Try to find stored evaluation for this guess
                        const storedEval = storedEvals.find(
                            (e) => e.guess === guessString
                        );

                        if (storedEval) {
                            // We have the evaluation, show colors!
                            console.log(
                                `[GameScreen] Row ${i + 1}: Found evaluation:`,
                                storedEval.result
                            );
                            for (let j = 0; j < 5; j++) {
                                const evalResult = storedEval.result[j];
                                const letter = guessString[j];
                                let state: TileState = "filled";

                                if (evalResult === 2) {
                                    state = "correct"; // Green
                                } else if (evalResult === 1) {
                                    state = "present"; // Yellow
                                } else {
                                    state = "absent"; // Gray
                                }

                                console.log(
                                    `[GameScreen] Row ${i + 1}, Col ${
                                        j + 1
                                    }: letter="${letter}", state="${state}"`
                                );
                                row.push({
                                    letter: letter,
                                    state,
                                });
                            }
                        } else {
                            // No evaluation yet, show letters as filled (LIGHT GRAY)
                            console.log(
                                `[GameScreen] Row ${
                                    i + 1
                                }: No evaluation, showing letters as filled`
                            );
                            for (let j = 0; j < 5; j++) {
                                const letter = guessString[j];
                                console.log(
                                    `[GameScreen] Row ${i + 1}, Col ${
                                        j + 1
                                    }: letter="${letter}" state="filled"`
                                );
                                row.push({
                                    letter: letter,
                                    state: "filled" as TileState,
                                });
                            }
                        }
                    } else {
                        // Empty row
                        console.log(`[GameScreen] Row ${i + 1}: Empty row`);
                        for (let j = 0; j < 5; j++) {
                            row.push({
                                letter: null,
                                state: "empty" as TileState,
                            });
                        }
                    }
                    grid.push(row);
                    console.log(`[GameScreen] Row ${i + 1} complete:`, row);
                }
                console.log("[GameScreen] ========== GRID COMPLETE ==========");
                console.log("[GameScreen] Final grid:", grid);

                setGameState({
                    wordIndex,
                    targetWord,
                    attempts,
                    maxAttempts,
                    currentAttempt: attempts,
                    grid,
                    gameStatus: won ? "won" : isComplete ? "lost" : "active",
                    hasBounty: false,
                    bountyAmount: 0,
                    guesses: allGuesses, // Store merged guesses for reference
                });
            } else {
                console.log("[GameScreen] No active game");
                onBack();
            }
        } catch (error) {
            console.error("[GameScreen] Error loading game:", error);
            Alert.alert("Error", "Failed to load game");
            onBack();
        } finally {
            setIsLoading(false);
        }
    };

    // ===== CONDITIONAL RENDER (AFTER ALL HOOKS) =====

    // If no game state, show loading or prompt
    if (isLoading || !gameState) {
        return (
            <View className="flex-1 bg-darkBg items-center justify-center">
                <ActivityIndicator size="large" color="#16A349" />
                <Text className="text-white text-lg mt-4">Loading game...</Text>
                <Pressable
                    onPress={onBack}
                    className="mt-6 bg-gray-700 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const handleKeyPress = async (key: string) => {
        if (gameState.gameStatus !== "active" || isLoading || isProcessing)
            return;

        if (key === "⌫") {
            setCurrentInput((prev) => prev.slice(0, -1));
        } else if (key === "ENTER") {
            // ENTER key can still be used to submit if user wants
            if (currentInput.length === 5) {
                await submitGuess(currentInput);
            } else {
                Alert.alert("Invalid", "Word must be 5 letters");
            }
        } else if (currentInput.length < 5) {
            // Add the letter
            const newInput = currentInput + key;
            setCurrentInput(newInput);

            // Auto-submit when 5th letter is typed
            if (newInput.length === 5) {
                console.log(
                    "[GameScreen] 5th letter typed, auto-submitting..."
                );
                await submitGuess(newInput);
            }
        }
    };

    /**
     * Generate a demo evaluation (for demo purposes)
     * Creates a realistic-looking evaluation with mix of colors
     */
    const generateDemoEvaluation = (guess: string): number[] => {
        // Create a varied evaluation for demo
        // This gives some green, yellow, and gray tiles for visual demo
        const evaluation: number[] = [];

        for (let i = 0; i < 5; i++) {
            // Use a simple algorithm to create varied results
            const charCode = guess.charCodeAt(i);
            const positionFactor = i + 1;
            const combined = (charCode + positionFactor) % 3;

            // Distribute colors somewhat realistically:
            // - First and last positions more likely to be correct (green)
            // - Middle positions mix of yellow and gray
            if (i === 0 || i === 4) {
                evaluation.push(combined === 0 ? 2 : combined === 1 ? 1 : 0);
            } else {
                evaluation.push(combined === 0 ? 1 : combined === 1 ? 0 : 2);
            }
        }

        console.log("[GameScreen] Generated demo evaluation:", evaluation);
        return evaluation;
    };

    const submitGuess = async (guess: string) => {
        try {
            console.log("[GameScreen] Submitting guess:", guess);
            console.log("[GameScreen] Current localGuesses before:", localGuesses);
            
            // Store guess in local state immediately for instant display
            const newGuesses = [...localGuesses, guess.toUpperCase()];
            
            setLocalGuesses(newGuesses);
            setCurrentInput(""); // Clear the input immediately
            
            console.log("[GameScreen] Added guess to local state:", guess);
            console.log("[GameScreen] New localGuesses:", newGuesses);
            console.log("[GameScreen] Total guesses now:", newGuesses.length);
            
            // Check if the guess is correct (for demo purposes)
            if (checkIfGuessIsCorrect(guess)) {
                console.log("[GameScreen] Correct guess! Showing success modal...");
                setTimeout(() => {
                    setShowSuccessModal(true);
                }, 1000); // Show success modal after 1 second
                return; // Don't proceed with blockchain submission for demo
            }
            
            // Also try to store in AsyncStorage as backup
            if (address && gameState) {
                try {
                    const gameId = gameState.wordIndex;
                    console.log("[GameScreen] Storing guess in AsyncStorage:", { address, gameId, guess });
                    
                    await guessStorage.storeGuess(address, gameId, gameState.wordIndex, guess);
                    console.log("[GameScreen] Stored guess in AsyncStorage");
                } catch (storageError) {
                    console.warn("[GameScreen] AsyncStorage failed, using local state only:", storageError);
                }
            }
            
            const result = await makeGuess(guess);
            console.log("[GameScreen] Guess result:", result);

            if (result.txId) {
                // Generate and store evaluation for colors
                if (address && gameState) {
                    const gameId = gameState.wordIndex;
                    const demoEvaluation = generateDemoEvaluation(guess);

                    await gameStorage.storeGuessEvaluation(
                        address,
                        gameId,
                        guess.toUpperCase(),
                        demoEvaluation // Demo evaluation with colors!
                    );
                    console.log(
                        "[GameScreen] Stored DEMO evaluation:",
                        demoEvaluation
                    );

                    // Wait a bit longer for blockchain confirmation, then reload
                    setTimeout(() => {
                        console.log("[GameScreen] Reloading after blockchain confirmation...");
                        loadGame();
                    }, 3000); // Wait 3 seconds for blockchain confirmation
                }

                Alert.alert("Success", "Guess submitted! Check your tiles!");
            } else {
                Alert.alert("Error", "Failed to submit guess");
            }
        } catch (error: any) {
            console.error("[GameScreen] Error submitting guess:", error);
            Alert.alert("Error", error.message || "Failed to submit guess");
        }
    };

    const handleForfeit = () => {
        setShowForfeitModal(true);
    };

    const confirmForfeit = async () => {
        setShowForfeitModal(false);
        try {
            const txId = await forfeitCurrentGame();
            if (txId) {
                // Clear local guesses for this game
                setLocalGuesses([]);
                setCurrentInput("");
                if (address && gameState) {
                    await guessStorage.clearGameGuesses(address, gameState.wordIndex);
                }
                
                Alert.alert("Game Forfeited", "Better luck next time!");
                setTimeout(() => {
                    onBack();
                }, 2000);
            } else {
                Alert.alert("Error", "Failed to forfeit game");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to forfeit game");
        }
    };

    const handleClaimBounty = async () => {
        if (!gameState.hasBounty || isClaimingBounty) return;

        try {
            setIsClaimingBounty(true);
            const txId = await claimBountyReward(gameState.wordIndex);

            if (txId) {
                Alert.alert("Success!", "Bounty claimed successfully!");
                setTimeout(() => {
                    loadGame();
                }, 3000);
            } else {
                Alert.alert("Error", "Failed to claim bounty");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to claim bounty");
        } finally {
            setIsClaimingBounty(false);
        }
    };

    const startNewGame = async () => {
        try {
            console.log("[GameScreen] Starting new game...");
            // Clear local state
            setLocalGuesses([]);
            setCurrentInput("");
            
            // Start new game
            const result = await contractStartNewGame();
            
            if (result) {
                console.log("[GameScreen] New game started:", result);
                // Reload the game screen
                setTimeout(() => {
                    loadGame();
                }, 2000);
            } else {
                Alert.alert("Error", "Failed to start new game");
            }
        } catch (error: any) {
            console.error("[GameScreen] Error starting new game:", error);
            Alert.alert("Error", error.message || "Failed to start new game");
        }
    };

    // Check if the current guess is correct (for demo purposes)
    const checkIfGuessIsCorrect = (guess: string) => {
        // For demo purposes, let's say the word is "STACK"
        const correctWord = "STACK";
        return guess.toUpperCase() === correctWord;
    };

    const attemptsLeft = gameState.maxAttempts - localGuesses.length;

    return (
        <View className="flex-1 bg-darkBg">
            {/* Header */}
            <Header
                title={`Word #${gameState.wordIndex}`}
                subtitle={`${attemptsLeft} attempts left`}
                onBack={onBack}
                rightComponent={
                    <Pressable
                        onPress={handleForfeit}
                        className="px-3 py-1 bg-red-900/30 rounded-lg"
                    >
                        <Text className="text-red-400 text-xs font-bold">
                            Forfeit
                        </Text>
                    </Pressable>
                }
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Bounty Indicator */}
                {gameState.hasBounty && (
                    <View className="mx-4 mt-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl p-4">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-accent rounded-full items-center justify-center mr-3">
                                    <Ionicons
                                        name="trophy"
                                        size={20}
                                        color="#fff"
                                    />
                                </View>
                                <View>
                                    <Text className="text-white text-sm font-bold">
                                        Bounty Active
                                    </Text>
                                    <Text className="text-gray-300 text-xs mt-0.5">
                                        Win and share {gameState.bountyAmount}{" "}
                                        STX
                                    </Text>
                                </View>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#F59E0B"
                            />
                        </View>
                    </View>
                )}

                {/* Game Grid */}
                <View className="items-center mt-6 mb-6">
                    {gameState.grid.map((row: GameTile[], rowIndex: number) => {
                        const isCurrentRow = rowIndex === localGuesses.length; // Current row is based on number of guesses
                        const isCompletedRow = rowIndex < localGuesses.length; // Completed rows are those with guesses
                        const hasLocalGuess = rowIndex < localGuesses.length;

                        console.log(`[GameScreen RENDER] Row ${rowIndex}:`, {
                            isCurrentRow,
                            isCompletedRow,
                            currentRow: localGuesses.length,
                            hasLocalGuess,
                            localGuesses: localGuesses,
                            localGuessesLength: localGuesses.length,
                            rowData: row,
                        });

                        return (
                            <View
                                key={rowIndex}
                                className="flex-row mb-2"
                                style={{ gap: 8 }}
                            >
                                {row.map((tile: GameTile, colIndex: number) => {
                                    let displayLetter = tile.letter;
                                    let displayState = tile.state;

                                    // If this row has a local guess, show it
                                    if (hasLocalGuess && localGuesses[rowIndex]) {
                                        const localGuess = localGuesses[rowIndex];
                                        if (colIndex < localGuess.length) {
                                            displayLetter = localGuess[colIndex];
                                            displayState = "filled";
                                        }
                                    }
                                    // Show current input on current row
                                    else if (isCurrentRow && currentInput.length > colIndex) {
                                        displayLetter = currentInput[colIndex];
                                        displayState = "filled";
                                    }

                                    console.log(
                                        `[GameScreen RENDER] Row ${rowIndex}, Col ${colIndex}:`,
                                        {
                                            tileLetter: tile.letter,
                                            tileState: tile.state,
                                            displayLetter,
                                            displayState,
                                            isCurrentRow,
                                            hasLocalGuess,
                                            currentInput,
                                        }
                                    );

                                    return (
                                        <Tile
                                            key={colIndex}
                                            letter={displayLetter}
                                            state={displayState}
                                            reveal={isCompletedRow}
                                            index={colIndex}
                                        />
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>

                {/* Debug Info */}
                <View className="px-4 mb-4">
                    <View className="bg-blue-900/30 rounded-xl p-3 mb-2">
                        <Text className="text-blue-300 text-xs mb-1">Debug Info:</Text>
                        <Text className="text-white text-xs">Local Guesses: {localGuesses.join(', ')}</Text>
                        <Text className="text-white text-xs">Current Row: {localGuesses.length}</Text>
                        <Text className="text-white text-xs">Current Input: {currentInput}</Text>
                        <Text className="text-white text-xs">Max Attempts: {gameState?.maxAttempts || 6}</Text>
                        <View className="flex-row mt-2" style={{ gap: 8 }}>
                            <Pressable 
                                onPress={() => {
                                    console.log("[DEBUG] Adding test guess...");
                                    setLocalGuesses(prev => [...prev, "TEST"]);
                                }}
                                className="bg-blue-600 px-3 py-1 rounded flex-1"
                            >
                                <Text className="text-white text-xs">Add Test Guess</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => {
                                    console.log("[DEBUG] Showing success modal...");
                                    setShowSuccessModal(true);
                                }}
                                className="bg-green-600 px-3 py-1 rounded flex-1"
                            >
                                <Text className="text-white text-xs">Test Success</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Game Stats */}
                <View className="px-4 mb-4">
                    <View className="bg-gray-800 rounded-xl p-4">
                        <View className="flex-row justify-between items-center">
                            <View className="items-center flex-1">
                                <Text className="text-gray-400 text-xs mb-1">
                                    Attempts
                                </Text>
                                <Text className="text-white text-lg font-bold">
                                    {localGuesses.length}/{gameState.maxAttempts}
                                </Text>
                            </View>
                            <View className="w-px h-8 bg-gray-700" />
                            <View className="items-center flex-1">
                                <Text className="text-gray-400 text-xs mb-1">
                                    Status
                                </Text>
                                <Text
                                    className={`text-lg font-bold ${
                                        gameState.gameStatus === "active"
                                            ? "text-primary"
                                            : gameState.gameStatus === "won"
                                            ? "text-accent"
                                            : "text-red-400"
                                    }`}
                                >
                                    {gameState.gameStatus.toUpperCase()}
                                </Text>
                            </View>
                            {gameState.hasBounty && (
                                <>
                                    <View className="w-px h-8 bg-gray-700" />
                                    <View className="items-center flex-1">
                                        <Text className="text-gray-400 text-xs mb-1">
                                            Bounty
                                        </Text>
                                        <Text className="text-accent text-lg font-bold">
                                            {gameState.bountyAmount?.toFixed(1)}{" "}
                                            STX
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Keyboard */}
            <Keyboard
                onKeyPress={handleKeyPress}
                letterStates={letterStates}
                disabled={
                    gameState.gameStatus !== "active" ||
                    isLoading ||
                    isProcessing
                }
            />

            {/* Win Modal */}
            <Modal
                visible={showWinModal}
                onClose={() => setShowWinModal(false)}
                title="🎉 Victory!"
            >
                <View className="items-center py-4">
                    <Text className="text-white text-lg mb-2">
                        You solved it!
                    </Text>
                    <Text className="text-gray-400 text-base mb-6">
                        Word:{" "}
                        <Text className="text-primary font-bold">
                            {gameState.targetWord}
                        </Text>
                    </Text>

                    {gameState.hasBounty && (
                        <View className="w-full bg-accent/20 rounded-2xl p-4 mb-6">
                            <Text className="text-white text-center font-bold mb-2">
                                Bounty Reward
                            </Text>
                            <Text className="text-accent text-3xl text-center font-bold mb-1">
                                {((gameState.bountyAmount || 0) * 0.1).toFixed(
                                    1
                                )}{" "}
                                STX
                            </Text>
                            <Text className="text-gray-400 text-xs text-center mb-4">
                                Your share of the bounty
                            </Text>
                            <Pressable
                                onPress={handleClaimBounty}
                                disabled={isClaimingBounty}
                                className={`rounded-xl py-3 items-center ${
                                    isClaimingBounty
                                        ? "bg-gray-600 opacity-50"
                                        : "bg-accent"
                                }`}
                            >
                                {isClaimingBounty ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white font-bold">
                                        Claim Reward
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    )}

                    <View className="flex-row" style={{ gap: 12 }}>
                        <Pressable
                            onPress={() => {
                                setShowWinModal(false);
                                onBack();
                            }}
                            className="flex-1 bg-gray-700 rounded-xl py-4 items-center"
                        >
                            <Text className="text-white text-lg font-bold">
                                Back to Menu
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setShowWinModal(false);
                                startNewGame();
                            }}
                            className="flex-1 bg-primary rounded-xl py-4 items-center"
                        >
                            <Text className="text-white text-lg font-bold">
                                New Game
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Lose Modal */}
            <Modal
                visible={showLoseModal}
                onClose={() => setShowLoseModal(false)}
                title="Game Over"
            >
                <View className="items-center py-4">
                    <Text className="text-white text-lg mb-2">
                        Better luck next time!
                    </Text>
                    <Text className="text-gray-400 text-base mb-6">
                        The word was:{" "}
                        <Text className="text-primary font-bold">
                            {gameState.targetWord}
                        </Text>
                    </Text>

                    <View className="flex-row" style={{ gap: 12 }}>
                        <Pressable
                            onPress={() => {
                                setShowLoseModal(false);
                                onBack();
                            }}
                            className="flex-1 bg-gray-700 rounded-xl py-4 items-center"
                        >
                            <Text className="text-white text-lg font-bold">
                                Back to Menu
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setShowLoseModal(false);
                                startNewGame();
                            }}
                            className="flex-1 bg-primary rounded-xl py-4 items-center"
                        >
                            <Text className="text-white text-lg font-bold">
                                New Game
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Forfeit Confirmation Modal */}
            <Modal
                visible={showForfeitModal}
                onClose={() => setShowForfeitModal(false)}
                title="Forfeit Game?"
            >
                <View className="py-4">
                    <Text className="text-gray-400 text-base mb-6 text-center">
                        Are you sure you want to forfeit this game? You won't be
                        able to continue.
                    </Text>

                    <View className="flex-row" style={{ gap: 12 }}>
                        <Pressable
                            onPress={() => setShowForfeitModal(false)}
                            className="flex-1 bg-gray-700 rounded-xl py-3 items-center"
                        >
                            <Text className="text-white font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={confirmForfeit}
                            className="flex-1 bg-red-600 rounded-xl py-3 items-center"
                        >
                            <Text className="text-white font-bold">
                                Forfeit
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="🎉 Congratulations!"
            >
                <View className="items-center py-6">
                    {/* Success Animation */}
                    <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-6">
                        <Ionicons name="checkmark" size={40} color="#fff" />
                    </View>
                    
                    {/* Success Message */}
                    <Text className="text-white text-2xl font-bold mb-2">
                        You Won!
                    </Text>
                    <Text className="text-gray-300 text-base mb-4 text-center">
                        Great job solving the word!
                    </Text>
                    
                    {/* Game Stats */}
                    <View className="bg-gray-800 rounded-xl p-4 mb-6 w-full">
                        <Text className="text-gray-400 text-sm mb-2 text-center">Game Summary</Text>
                        <View className="flex-row justify-between items-center">
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs">Attempts Used</Text>
                                <Text className="text-white text-lg font-bold">
                                    {localGuesses.length}
                                </Text>
                            </View>
                            <View className="w-px h-8 bg-gray-700" />
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs">Word</Text>
                                <Text className="text-primary text-lg font-bold">
                                    {gameState?.targetWord || "?????"}
                                </Text>
                            </View>
                            <View className="w-px h-8 bg-gray-700" />
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs">Score</Text>
                                <Text className="text-accent text-lg font-bold">
                                    {gameState?.maxAttempts - localGuesses.length + 1 || 1}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row w-full" style={{ gap: 12 }}>
                        <Pressable
                            onPress={() => {
                                setShowSuccessModal(false);
                                onBack();
                            }}
                            className="flex-1 bg-gray-700 rounded-xl py-4 items-center"
                        >
                            <Text className="text-white text-lg font-bold">
                                Back to Menu
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setShowSuccessModal(false);
                                startNewGame();
                            }}
                            className="flex-1 bg-primary rounded-xl py-4 items-center"
                        >
                            <Text className="text-white text-lg font-bold">
                                Play Again
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default GameScreen;
