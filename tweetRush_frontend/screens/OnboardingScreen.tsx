/**
 * OnboardingScreen.tsx
 *
 * Onboarding flow with wallet connection and username registration
 */

import { stacksConfig } from "@/config/stacks";
import { useWallet } from "@/contexts/WalletContext";
import { useContract } from "@/hooks/useContract";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface OnboardingScreenProps {
    onComplete: (username: string, walletAddress: string) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [step, setStep] = useState<"wallet" | "username">("wallet");
    const [username, setUsername] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [mnemonic, setMnemonic] = useState<string>("");
    const [isCreatingAccount, setIsCreatingAccount] = useState(true);

    const { createNewWallet, loginWithMnemonic, address } = useWallet();
    const { registerUserOnChain } = useContract();

    const handleCreateAccount = () => {
        setIsCreatingAccount(true);
    };

    const handleImportAccount = () => {
        setIsCreatingAccount(false);
    };

    const handleWalletNext = async () => {
        // Validate mnemonic if importing
        if (!isCreatingAccount && !mnemonic.trim()) {
            Alert.alert("Error", "Please enter your seed phrase");
            return;
        }

        setIsProcessing(true);
        setLoadingMessage(
            isCreatingAccount
                ? "Generating secure wallet..."
                : "Restoring your wallet..."
        );

        try {
            if (isCreatingAccount) {
                // Generate new wallet
                setLoadingMessage("Generating 24-word seed phrase...");
                await new Promise((resolve) => setTimeout(resolve, 500));
                await createNewWallet();
                setLoadingMessage("Deriving wallet address...");
                await new Promise((resolve) => setTimeout(resolve, 500));
            } else {
                // Login with mnemonic
                setLoadingMessage("Validating seed phrase...");
                await new Promise((resolve) => setTimeout(resolve, 500));
                const success = await loginWithMnemonic(mnemonic.trim());

                if (!success) {
                    setIsProcessing(false);
                    setLoadingMessage("");
                    Alert.alert(
                        "Invalid Mnemonic",
                        "Please check your seed phrase and try again."
                    );
                    return;
                }
                setLoadingMessage("Restoring wallet data...");
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            setLoadingMessage("Almost there...");
            await new Promise((resolve) => setTimeout(resolve, 300));

            console.log("Wallet connected successfully!");
            console.log("Address:", address);

            // ✅ FIXED: Move to username step
            setStep("username");
        } catch (error) {
            Alert.alert("Error", "Failed to setup wallet. Please try again.");
            console.error("Wallet setup error:", error);
        } finally {
            setIsProcessing(false);
            setLoadingMessage("");
        }
    };

    const handleUsernameSubmit = async () => {
        if (!username.trim()) {
            Alert.alert("Error", "Please enter a username");
            return;
        }

        if (username.length < 3) {
            Alert.alert("Error", "Username must be at least 3 characters");
            return;
        }

        if (!address) {
            Alert.alert("Error", "Wallet address not found");
            return;
        }

        setIsProcessing(true);
        setLoadingMessage("Registering username on blockchain...");

        try {
            // Call the smart contract to register the user
            const txId = await registerUserOnChain(username.trim());

            if (txId) {
                setLoadingMessage(
                    "Username registered! Setting up your profile..."
                );
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // Complete onboarding
                onComplete(username.trim(), address);
            } else {
                throw new Error("Registration failed");
            }
        } catch (error: any) {
            console.error("Registration error:", error);

            // Check if it's a duplicate username error
            if (
                error.message?.includes("111") ||
                error.message?.includes("USERNAME-EXISTS")
            ) {
                Alert.alert(
                    "Username Taken",
                    "This username is already in use. Please try another."
                );
            } else if (
                error.message?.includes("110") ||
                error.message?.includes("ALREADY-REGISTERED")
            ) {
                Alert.alert(
                    "Already Registered",
                    "This wallet is already registered. Proceeding to app..."
                );
                // Still complete onboarding since wallet is registered
                onComplete(username.trim(), address);
            } else {
                Alert.alert(
                    "Error",
                    "Failed to register username. Please try again."
                );
            }
        } finally {
            setIsProcessing(false);
            setLoadingMessage("");
        }
    };

    const renderWalletStep = () => (
        <View className="flex-1 justify-center items-center px-6">
            <View className="bg-primary/10 p-6 rounded-full mb-8">
                <Ionicons name="wallet" size={48} color="#16A349" />
            </View>

            <Text className="text-3xl font-bold text-white text-center mb-4">
                {isCreatingAccount
                    ? "Create Your Wallet"
                    : "Import Your Wallet"}
            </Text>

            <Text className="text-gray-400 text-center mb-8 text-lg leading-6">
                {isCreatingAccount
                    ? "Create a new wallet to start playing TweetRush and earn rewards"
                    : "Import your existing wallet using your seed phrase"}
            </Text>

            {/* Toggle between Create/Import */}
            <View className="flex-row mb-6 bg-gray-800 rounded-xl p-1">
                <TouchableOpacity
                    onPress={handleCreateAccount}
                    className={`flex-1 py-3 rounded-lg ${
                        isCreatingAccount ? "bg-primary" : "bg-transparent"
                    }`}
                >
                    <Text
                        className={`text-center font-semibold ${
                            isCreatingAccount ? "text-white" : "text-gray-400"
                        }`}
                    >
                        Create New
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleImportAccount}
                    className={`flex-1 py-3 rounded-lg ${
                        !isCreatingAccount ? "bg-primary" : "bg-transparent"
                    }`}
                >
                    <Text
                        className={`text-center font-semibold ${
                            !isCreatingAccount ? "text-white" : "text-gray-400"
                        }`}
                    >
                        Import Existing
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Mnemonic input - only show when importing */}
            {!isCreatingAccount && (
                <View className="w-full mb-6">
                    <Text className="text-white font-semibold mb-2">
                        Seed Phrase *
                    </Text>
                    <TextInput
                        className="bg-gray-800 rounded-xl px-4 py-4 text-white border border-gray-700"
                        placeholder="Enter your 12 or 24 word seed phrase..."
                        placeholderTextColor="#6B7280"
                        value={mnemonic}
                        onChangeText={setMnemonic}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        style={{ minHeight: 120 }}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    <Text className="text-gray-500 text-sm mt-2">
                        Separate each word with a space
                    </Text>
                </View>
            )}

            {/* Loading message */}
            {isProcessing && loadingMessage && (
                <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                    <Text className="text-primary text-center font-semibold">
                        {loadingMessage}
                    </Text>
                </View>
            )}

            {/* Connect button */}
            <TouchableOpacity
                onPress={handleWalletNext}
                disabled={
                    isProcessing || (!isCreatingAccount && !mnemonic.trim())
                }
                className={`rounded-xl py-4 px-8 w-full flex-row items-center justify-center ${
                    isProcessing || (!isCreatingAccount && !mnemonic.trim())
                        ? "bg-gray-600"
                        : "bg-primary"
                }`}
            >
                {isProcessing ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <>
                        <Ionicons name="wallet" size={20} color="white" />
                        <Text className="text-white font-semibold text-lg ml-2">
                            {isCreatingAccount
                                ? "Create Wallet"
                                : "Import Wallet"}
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            <Text className="text-gray-500 text-sm text-center mt-6">
                We'll use your wallet to track your progress and rewards
            </Text>

            <View className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 mt-4">
                <Text className="text-yellow-400 text-sm font-semibold mb-1">
                    🧪 Testnet Mode
                </Text>
                <Text className="text-yellow-300 text-xs">
                    Connected to Stacks Testnet. Get test STX from the faucet to
                    start playing!
                </Text>
            </View>
        </View>
    );

    const renderUsernameStep = () => (
        <View className="flex-1 justify-center items-center px-6">
            <View className="bg-accent/10 p-6 rounded-full mb-8">
                <Ionicons name="person" size={48} color="#F59E0B" />
            </View>

            <Text className="text-3xl font-bold text-white text-center mb-4">
                Choose Your Username
            </Text>

            <Text className="text-gray-400 text-center mb-4 text-lg leading-6">
                Pick a unique username that will be displayed on the leaderboard
            </Text>

            {/* Wallet address display */}
            <View className="bg-gray-800 rounded-xl p-4 mb-6 w-full">
                <Text className="text-gray-400 text-sm mb-1">
                    Connected Stacks Wallet
                </Text>
                <Text className="text-primary font-mono text-sm">
                    {address ? (
                        <>
                            {address.slice(0, 8)}...{address.slice(-6)}
                        </>
                    ) : (
                        "Loading..."
                    )}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                    {stacksConfig.networkType === "mainnet"
                        ? "Mainnet"
                        : "Testnet"}
                </Text>
            </View>

            {/* Username input */}
            <View className="w-full mb-6">
                <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your username"
                    placeholderTextColor="#6B7280"
                    className="bg-gray-800 text-white text-lg px-4 py-4 rounded-xl border border-gray-700 focus:border-primary"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                />
                <Text className="text-gray-500 text-sm mt-2">
                    {username.length}/20 characters
                </Text>
            </View>

            {/* Loading message */}
            {isProcessing && loadingMessage && (
                <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                    <Text className="text-primary text-center font-semibold">
                        {loadingMessage}
                    </Text>
                </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
                onPress={handleUsernameSubmit}
                disabled={isProcessing || !username.trim()}
                className={`rounded-xl py-4 px-8 w-full flex-row items-center justify-center ${
                    isProcessing || !username.trim()
                        ? "bg-gray-600"
                        : "bg-accent"
                }`}
            >
                {isProcessing ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <>
                        <Ionicons name="checkmark" size={20} color="white" />
                        <Text className="text-white font-semibold text-lg ml-2">
                            Complete Setup
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Back button */}
            <TouchableOpacity
                onPress={() => setStep("wallet")}
                className="mt-4"
                disabled={isProcessing}
            >
                <Text className="text-gray-400 text-sm">
                    ← Back to wallet connection
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-darkBg"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                {step === "wallet" ? renderWalletStep() : renderUsernameStep()}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default OnboardingScreen;
