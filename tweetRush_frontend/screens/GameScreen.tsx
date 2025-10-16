import Header from "@/components/game/Header";
import Keyboard from "@/components/game/Keyboard";
import Tile from "@/components/game/Tile";
import Modal from "@/components/ui/Modal";
import { useGame } from "@/contexts/GameContext";
import { useContract } from "@/hooks/useContract";
import { LetterState } from "@/mocks";
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
        gameState,
        isLoading,
        submitGuess: submitGameGuess,
        forfeitGame: forfeitGameAction,
        refreshGameState,
    } = useGame();
    const { claimBountyReward, isProcessing } = useContract();

    const [currentInput, setCurrentInput] = useState("");
    const [letterStates, setLetterStates] = useState<
        Record<string, LetterState>
    >({});
    const [showWinModal, setShowWinModal] = useState(false);
    const [showLoseModal, setShowLoseModal] = useState(false);
    const [showForfeitModal, setShowForfeitModal] = useState(false);
    const [isClaimingBounty, setIsClaimingBounty] = useState(false);

    // Check for game completion
    useEffect(() => {
        if (!gameState) return;

        if (gameState.gameStatus === "won") {
            setShowWinModal(true);
        } else if (gameState.gameStatus === "lost") {
            setShowLoseModal(true);
        }
    }, [gameState?.gameStatus]);

    // If no game state, show loading or prompt
    if (!gameState) {
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

    // Calculate letter states from game grid
    useEffect(() => {
        const states: Record<string, LetterState> = {};
        gameState.grid.forEach((row) => {
            row.forEach((tile) => {
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

    const handleKeyPress = async (key: string) => {
        if (gameState.gameStatus !== "active" || isLoading || isProcessing)
            return;

        if (key === "⌫") {
            setCurrentInput((prev) => prev.slice(0, -1));
        } else if (key === "ENTER") {
            if (currentInput.length === 5) {
                const success = await submitGameGuess(currentInput);
                if (success) {
                    setCurrentInput("");
                } else {
                    Alert.alert(
                        "Error",
                        "Failed to submit guess. Please try again."
                    );
                }
            } else {
                Alert.alert("Invalid", "Word must be 5 letters");
            }
        } else if (currentInput.length < 5) {
            setCurrentInput((prev) => prev + key);
        }
    };

    const handleForfeit = () => {
        setShowForfeitModal(true);
    };

    const confirmForfeit = async () => {
        setShowForfeitModal(false);
        const success = await forfeitGameAction();
        if (success) {
            Alert.alert("Game Forfeited", "Better luck next time!");
            onBack();
        } else {
            Alert.alert("Error", "Failed to forfeit game");
        }
    };

    const handleClaimBounty = async () => {
        if (!gameState.hasBounty || isClaimingBounty) return;

        try {
            setIsClaimingBounty(true);
            const txId = await claimBountyReward(gameState.wordIndex);

            if (txId) {
                Alert.alert("Success!", "Bounty claimed successfully!");
                await refreshGameState();
            } else {
                Alert.alert("Error", "Failed to claim bounty");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to claim bounty");
        } finally {
            setIsClaimingBounty(false);
        }
    };

    const attemptsLeft = gameState.maxAttempts - gameState.attempts;

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
                    {gameState.grid.map((row, rowIndex) => {
                        const isCurrentRow =
                            rowIndex === gameState.currentAttempt;
                        const isCompletedRow =
                            rowIndex < gameState.currentAttempt;

                        return (
                            <View
                                key={rowIndex}
                                className="flex-row mb-2"
                                style={{ gap: 8 }}
                            >
                                {row.map((tile, colIndex) => {
                                    let displayLetter = tile.letter;
                                    let displayState = tile.state;

                                    // Show current input on current row
                                    if (
                                        isCurrentRow &&
                                        currentInput.length > colIndex
                                    ) {
                                        displayLetter = currentInput[colIndex];
                                        displayState = "filled";
                                    }

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

                {/* Game Stats */}
                <View className="px-4 mb-4">
                    <View className="bg-gray-800 rounded-xl p-4">
                        <View className="flex-row justify-between items-center">
                            <View className="items-center flex-1">
                                <Text className="text-gray-400 text-xs mb-1">
                                    Attempts
                                </Text>
                                <Text className="text-white text-lg font-bold">
                                    {gameState.attempts}/{gameState.maxAttempts}
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

                    <Pressable
                        onPress={() => {
                            setShowWinModal(false);
                            onBack();
                        }}
                        className="w-full bg-primary rounded-xl py-4 items-center"
                    >
                        <Text className="text-white text-lg font-bold">
                            Continue
                        </Text>
                    </Pressable>
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

                    <Pressable
                        onPress={() => {
                            setShowLoseModal(false);
                            onBack();
                        }}
                        className="w-full bg-primary rounded-xl py-4 items-center"
                    >
                        <Text className="text-white text-lg font-bold">
                            Continue
                        </Text>
                    </Pressable>
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
        </View>
    );
};

export default GameScreen;
