/**
 * PlayScreen.tsx
 *
 * Main play screen that handles game flow:
 * - Shows active game if one exists
 * - Shows "Start New Game" if no active game
 * - Uses useContract directly like AdminScreen
 */

import { useContract } from "@/hooks/useContract";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import GameScreen from "./GameScreen";

const PlayScreen: React.FC = () => {
    const {
        startNewGame,
        getActiveGameData,
        checkHasActiveGame,
        isProcessing,
        address,
        isConnected,
    } = useContract();

    const [hasActiveGame, setHasActiveGame] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check for active game on mount
    useEffect(() => {
        loadActiveGameStatus();
    }, []);

    const loadActiveGameStatus = async () => {
        if (!address) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log("[PlayScreen] Checking for active game...");
            const response = await checkHasActiveGame(address);
            console.log("[PlayScreen] Has active game:", response);
            setHasActiveGame(response?.value || false);
        } catch (error) {
            console.error("[PlayScreen] Error checking active game:", error);
            setHasActiveGame(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartGame = async () => {
        console.log("=== START GAME BUTTON CLICKED ===");
        console.log("isConnected:", isConnected);
        console.log("address:", address);
        console.log("hasActiveGame:", hasActiveGame);

        if (!isConnected) {
            console.log("NOT CONNECTED");
            Alert.alert("Wallet Required", "Please complete onboarding first");
            return;
        }

        if (hasActiveGame) {
            console.log("ALREADY HAS ACTIVE GAME");
            Alert.alert(
                "Active Game",
                "You already have an active game. Complete it first."
            );
            return;
        }

        try {
            console.log("Calling startNewGame()...");
            const txId = await startNewGame();
            console.log("startNewGame() returned:", txId);

            if (txId) {
                Alert.alert("Success", "Game started! Loading...");
                // Wait for transaction confirmation
                setTimeout(() => {
                    loadActiveGameStatus();
                }, 5000);
            }
        } catch (error: any) {
            console.error("Error starting game:", error);
            Alert.alert(
                "Error",
                error.message || "Failed to start game. Check console."
            );
        }
    };

    // If there's an active game, show the game screen
    if (hasActiveGame) {
        return <GameScreen onBack={loadActiveGameStatus} />;
    }

    // Loading state
    if (isLoading) {
        return (
            <View className="flex-1 bg-darkBg items-center justify-center">
                <ActivityIndicator size="large" color="#16A349" />
                <Text className="text-white text-lg mt-4">
                    Checking for active games...
                </Text>
            </View>
        );
    }

    // No active game - show start game screen
    return (
        <View className="flex-1 bg-darkBg">
            {/* Header */}
            <View className="bg-gray-900 pt-12 pb-4 px-4 border-b border-gray-800">
                <Text className="text-white text-3xl font-bold mb-2">
                    Ready to Play?
                </Text>
                <Text className="text-gray-400 text-base">
                    Start a new game and test your word skills
                </Text>
            </View>

            <View className="flex-1 items-center justify-center px-6">
                {/* Game Icon */}
                <View className="w-32 h-32 bg-primary/10 rounded-full items-center justify-center mb-8">
                    <Ionicons
                        name="game-controller"
                        size={64}
                        color="#16A349"
                    />
                </View>

                <Text className="text-white text-2xl font-bold mb-4 text-center">
                    No Active Game
                </Text>

                <Text className="text-gray-400 text-center text-base mb-8 leading-6">
                    Start a new game to guess a random 5-letter word. You have 6
                    attempts to get it right!
                </Text>

                {/* How to Play */}
                <View className="w-full bg-gray-800 rounded-2xl p-6 mb-8">
                    <Text className="text-white font-bold text-lg mb-4">
                        How to Play:
                    </Text>

                    <View className="flex-row items-start mb-3">
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mr-3 mt-0.5">
                            <Text className="text-white text-xs font-bold">
                                1
                            </Text>
                        </View>
                        <Text className="text-gray-300 flex-1">
                            Start a new game to get a random word
                        </Text>
                    </View>

                    <View className="flex-row items-start mb-3">
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mr-3 mt-0.5">
                            <Text className="text-white text-xs font-bold">
                                2
                            </Text>
                        </View>
                        <Text className="text-gray-300 flex-1">
                            Guess a 5-letter word using the keyboard
                        </Text>
                    </View>

                    <View className="flex-row items-start mb-3">
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mr-3 mt-0.5">
                            <Text className="text-white text-xs font-bold">
                                3
                            </Text>
                        </View>
                        <Text className="text-gray-300 flex-1">
                            Green = correct position, Yellow = wrong position
                        </Text>
                    </View>

                    <View className="flex-row items-start">
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mr-3 mt-0.5">
                            <Text className="text-white text-xs font-bold">
                                4
                            </Text>
                        </View>
                        <Text className="text-gray-300 flex-1">
                            You have 6 attempts to guess the word!
                        </Text>
                    </View>
                </View>

                {/* Color Legend */}
                <View className="w-full bg-gray-800 rounded-2xl p-4 mb-8">
                    <Text className="text-white font-bold mb-3 text-center">
                        Tile Colors
                    </Text>
                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <View className="w-12 h-12 bg-primary rounded-lg mb-2" />
                            <Text className="text-gray-400 text-xs">
                                Correct
                            </Text>
                        </View>
                        <View className="items-center">
                            <View className="w-12 h-12 bg-accent rounded-lg mb-2" />
                            <Text className="text-gray-400 text-xs">
                                Present
                            </Text>
                        </View>
                        <View className="items-center">
                            <View className="w-12 h-12 bg-gray-700 rounded-lg mb-2" />
                            <Text className="text-gray-400 text-xs">
                                Absent
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Start Game Button */}
                <Pressable
                    onPress={handleStartGame}
                    disabled={isProcessing || !isConnected}
                    className={`w-full rounded-2xl py-5 items-center ${
                        isProcessing || !isConnected
                            ? "bg-gray-600 opacity-50"
                            : "bg-primary"
                    }`}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text className="text-white text-xl font-bold mb-1">
                                Start New Game
                            </Text>
                            <Text className="text-white/80 text-sm">
                                Tap to begin
                            </Text>
                        </>
                    )}
                </Pressable>

                {!isConnected && (
                    <Text className="text-gray-500 text-sm mt-4 text-center">
                        Please complete onboarding to start playing
                    </Text>
                )}

                {/* Stats Preview */}
                {address && (
                    <View className="w-full bg-gray-800/50 rounded-xl p-4 mt-6">
                        <Text className="text-gray-400 text-xs text-center">
                            Your wallet: {address.slice(0, 6)}...
                            {address.slice(-4)}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default PlayScreen;
