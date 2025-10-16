/**
 * AdminScreen.tsx
 *
 * Admin panel for managing words in the game
 * Only accessible to contract owner
 */

import Header from "@/components/game/Header";
import { useWallet } from "@/contexts/WalletContext";
import { useContract } from "@/hooks/useContract";
import { CONTRACT_CONFIG } from "@/lib/contract-config";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

interface AdminScreenProps {
    onBack?: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
    const { address } = useWallet();
    const { addWord, addMultipleWords, getTotalWordsCount, isProcessing } =
        useContract();

    const [singleWord, setSingleWord] = useState("");
    const [bulkWords, setBulkWords] = useState("");
    const [totalWords, setTotalWords] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

    const isOwner = address === CONTRACT_CONFIG.CONTRACT_ADDRESS;

    useEffect(() => {
        loadTotalWords();
    }, []);

    const loadTotalWords = async () => {
        try {
            setIsLoading(true);
            const response = await getTotalWordsCount();
            setTotalWords(response?.value || 0);
        } catch (error) {
            console.error("Error loading total words:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSingleWord = async () => {
        const word = singleWord.trim().toUpperCase();

        if (word.length !== 5) {
            Alert.alert("Invalid", "Word must be exactly 5 letters");
            return;
        }

        if (!/^[A-Z]+$/.test(word)) {
            Alert.alert("Invalid", "Word must contain only letters");
            return;
        }

        try {
            const txId = await addWord(word);
            if (txId) {
                Alert.alert("Success", `Word "${word}" added successfully!`);
                setSingleWord("");
                // Reload total after a delay
                setTimeout(() => {
                    loadTotalWords();
                }, 3000);
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to add word");
        }
    };

    const handleAddBulkWords = async () => {
        const words = bulkWords
            .trim()
            .toUpperCase()
            .split(/[\s,\n]+/)
            .filter((w) => w.length > 0);

        if (words.length === 0) {
            Alert.alert("Invalid", "Please enter at least one word");
            return;
        }

        // Validate all words
        const invalidWords = words.filter(
            (w) => w.length !== 5 || !/^[A-Z]+$/.test(w)
        );
        if (invalidWords.length > 0) {
            Alert.alert(
                "Invalid Words",
                `These words are invalid: ${invalidWords.join(
                    ", "
                )}\n\nAll words must be 5 letters and contain only letters.`
            );
            return;
        }

        if (words.length > 100) {
            Alert.alert(
                "Too Many",
                "Maximum 100 words at a time. Please split into smaller batches."
            );
            return;
        }

        Alert.alert("Confirm", `Add ${words.length} words to the pool?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Add",
                onPress: async () => {
                    try {
                        const txId = await addMultipleWords(words);
                        if (txId) {
                            Alert.alert(
                                "Success",
                                `${words.length} words added successfully!`
                            );
                            setBulkWords("");
                            setTimeout(() => {
                                loadTotalWords();
                            }, 3000);
                        }
                    } catch (error: any) {
                        Alert.alert(
                            "Error",
                            error.message || "Failed to add words"
                        );
                    }
                },
            },
        ]);
    };

    if (!isOwner) {
        return (
            <View className="flex-1 bg-darkBg">
                <Header
                    title="Admin"
                    subtitle="Contract owner only"
                    onBack={onBack}
                />
                <View className="flex-1 items-center justify-center px-4">
                    <View className="w-20 h-20 bg-red-900/30 rounded-full items-center justify-center mb-4">
                        <Ionicons
                            name="lock-closed"
                            size={40}
                            color="#EF4444"
                        />
                    </View>
                    <Text className="text-white text-xl font-bold mb-2">
                        Access Denied
                    </Text>
                    <Text className="text-gray-400 text-center">
                        This section is only accessible to the contract owner.
                    </Text>
                    <Text className="text-gray-500 text-xs mt-4 text-center">
                        Owner: {CONTRACT_CONFIG.CONTRACT_ADDRESS.slice(0, 8)}...
                        {CONTRACT_CONFIG.CONTRACT_ADDRESS.slice(-6)}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1 text-center">
                        You: {address?.slice(0, 8)}...{address?.slice(-6)}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-darkBg">
            <Header
                title="Admin"
                subtitle="Manage word pool"
                onBack={onBack}
                rightComponent={
                    <Pressable onPress={loadTotalWords}>
                        <Ionicons name="refresh" size={24} color="#16A349" />
                    </Pressable>
                }
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Stats Card */}
                <View className="mx-4 mt-4 bg-gray-800 rounded-2xl p-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-gray-400 text-sm mb-1">
                                Total Words in Pool
                            </Text>
                            <Text className="text-white text-3xl font-bold">
                                {isLoading ? "..." : totalWords}
                            </Text>
                        </View>
                        <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center">
                            <Ionicons name="book" size={32} color="#16A349" />
                        </View>
                    </View>
                </View>

                {/* Tab Selector */}
                <View className="px-4 mt-6">
                    <View className="bg-gray-800 rounded-2xl p-1 flex-row">
                        <Pressable
                            onPress={() => setActiveTab("single")}
                            className={`flex-1 py-3 rounded-xl ${
                                activeTab === "single" ? "bg-primary" : ""
                            }`}
                        >
                            <Text
                                className={`text-center font-bold ${
                                    activeTab === "single"
                                        ? "text-white"
                                        : "text-gray-400"
                                }`}
                            >
                                Single Word
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setActiveTab("bulk")}
                            className={`flex-1 py-3 rounded-xl ${
                                activeTab === "bulk" ? "bg-primary" : ""
                            }`}
                        >
                            <Text
                                className={`text-center font-bold ${
                                    activeTab === "bulk"
                                        ? "text-white"
                                        : "text-gray-400"
                                }`}
                            >
                                Bulk Import
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Single Word Form */}
                {activeTab === "single" && (
                    <View className="px-4 mt-6">
                        <View className="bg-gray-800 rounded-2xl p-6">
                            <View className="flex-row items-center mb-4">
                                <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mr-3">
                                    <Ionicons
                                        name="add-circle"
                                        size={20}
                                        color="#16A349"
                                    />
                                </View>
                                <Text className="text-white text-lg font-bold">
                                    Add Single Word
                                </Text>
                            </View>

                            <Text className="text-gray-400 text-sm mb-3">
                                Enter a 5-letter word to add to the game pool
                            </Text>

                            <TextInput
                                value={singleWord}
                                onChangeText={setSingleWord}
                                placeholder="e.g., STACK"
                                placeholderTextColor="#6B7280"
                                maxLength={5}
                                autoCapitalize="characters"
                                className="bg-gray-900 text-white text-center text-2xl font-bold rounded-xl px-4 py-4 mb-4"
                            />

                            <View className="bg-gray-900 rounded-xl p-3 mb-4">
                                <View className="flex-row items-start">
                                    <Ionicons
                                        name="information-circle"
                                        size={16}
                                        color="#9CA3AF"
                                    />
                                    <Text className="text-gray-400 text-xs ml-2 flex-1">
                                        Word will be assigned index:{" "}
                                        {totalWords}
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={handleAddSingleWord}
                                disabled={
                                    isProcessing ||
                                    singleWord.trim().length !== 5
                                }
                                className={`rounded-xl py-4 items-center ${
                                    isProcessing ||
                                    singleWord.trim().length !== 5
                                        ? "bg-gray-600 opacity-50"
                                        : "bg-primary"
                                }`}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">
                                        Add Word
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Bulk Import Form */}
                {activeTab === "bulk" && (
                    <View className="px-4 mt-6">
                        <View className="bg-gray-800 rounded-2xl p-6">
                            <View className="flex-row items-center mb-4">
                                <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center mr-3">
                                    <Ionicons
                                        name="cloud-upload"
                                        size={20}
                                        color="#F59E0B"
                                    />
                                </View>
                                <Text className="text-white text-lg font-bold">
                                    Bulk Import Words
                                </Text>
                            </View>

                            <Text className="text-gray-400 text-sm mb-3">
                                Enter multiple 5-letter words (separated by
                                spaces, commas, or new lines)
                            </Text>

                            <TextInput
                                value={bulkWords}
                                onChangeText={setBulkWords}
                                placeholder="STACK, CHAIN, BLOCK, TOKEN, WRITE"
                                placeholderTextColor="#6B7280"
                                autoCapitalize="characters"
                                multiline
                                numberOfLines={6}
                                className="bg-gray-900 text-white rounded-xl px-4 py-3 mb-4 min-h-[120px]"
                                textAlignVertical="top"
                            />

                            <View className="bg-gray-900 rounded-xl p-3 mb-4">
                                <View className="flex-row items-start mb-2">
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={16}
                                        color="#16A349"
                                    />
                                    <Text className="text-gray-400 text-xs ml-2 flex-1">
                                        Max 100 words per transaction
                                    </Text>
                                </View>
                                <View className="flex-row items-start">
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={16}
                                        color="#16A349"
                                    />
                                    <Text className="text-gray-400 text-xs ml-2 flex-1">
                                        All words must be exactly 5 letters
                                    </Text>
                                </View>
                            </View>

                            {bulkWords.trim().length > 0 && (
                                <View className="bg-primary/10 border border-primary/30 rounded-xl p-3 mb-4">
                                    <Text className="text-primary text-xs font-bold">
                                        Preview:{" "}
                                        {
                                            bulkWords
                                                .trim()
                                                .toUpperCase()
                                                .split(/[\s,\n]+/).length
                                        }{" "}
                                        words will be added
                                    </Text>
                                </View>
                            )}

                            <Pressable
                                onPress={handleAddBulkWords}
                                disabled={
                                    isProcessing ||
                                    bulkWords.trim().length === 0
                                }
                                className={`rounded-xl py-4 items-center ${
                                    isProcessing ||
                                    bulkWords.trim().length === 0
                                        ? "bg-gray-600 opacity-50"
                                        : "bg-accent"
                                }`}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">
                                        Import Words
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Quick Add Suggestions */}
                <View className="px-4 mt-6">
                    <Text className="text-white text-lg font-bold mb-3">
                        Quick Add Templates
                    </Text>

                    <Pressable
                        onPress={() =>
                            setBulkWords(
                                "STACK, CHAIN, BLOCK, TOKEN, SMART, PROOF, TRUST, WRITE, BUILD, SCALE"
                            )
                        }
                        className="bg-gray-800 rounded-xl p-4 mb-3"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-white font-bold mb-1">
                                    Blockchain Theme
                                </Text>
                                <Text className="text-gray-400 text-xs">
                                    10 blockchain-related words
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#9CA3AF"
                            />
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            setBulkWords(
                                "REACT, SWIFT, BASIC, FORTH, PEARL, SPEED, LOGIC, DEBUG, ARRAY, QUERY"
                            )
                        }
                        className="bg-gray-800 rounded-xl p-4 mb-3"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-white font-bold mb-1">
                                    Tech Words
                                </Text>
                                <Text className="text-gray-400 text-xs">
                                    10 tech-related 5-letter words
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#9CA3AF"
                            />
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            setBulkWords(
                                "HAPPY, BRAVE, QUICK, SMART, GREAT, CLEAN, FRESH, SHARP, SWIFT, BRIGHT"
                            )
                        }
                        className="bg-gray-800 rounded-xl p-4"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-white font-bold mb-1">
                                    Common Words
                                </Text>
                                <Text className="text-gray-400 text-xs">
                                    10 common 5-letter words
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#9CA3AF"
                            />
                        </View>
                    </Pressable>
                </View>

                {/* Warning Info */}
                <View className="px-4 mt-6">
                    <View className="bg-yellow-600/20 border border-yellow-500/30 rounded-2xl p-4">
                        <View className="flex-row items-start">
                            <Ionicons
                                name="warning"
                                size={24}
                                color="#F59E0B"
                            />
                            <View className="flex-1 ml-3">
                                <Text className="text-yellow-400 font-bold mb-1">
                                    Admin Only
                                </Text>
                                <Text className="text-gray-300 text-sm">
                                    Only the contract owner can add words. Each
                                    transaction requires gas fees.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default AdminScreen;
