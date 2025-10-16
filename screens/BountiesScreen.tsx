import Header from "@/components/game/Header";
import BountyCard from "@/components/ui/BountyCard";
import Modal from "@/components/ui/Modal";
import { useContract } from "@/hooks/useContract";
import { Bounty } from "@/mocks";
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

interface BountiesScreenProps {
    onBack?: () => void;
}

const BountiesScreen: React.FC<BountiesScreenProps> = ({ onBack }) => {
    const {
        getBountyData,
        getTotalWordsCount,
        createBounty,
        isProcessing,
        address,
    } = useContract();

    const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalWords, setTotalWords] = useState(0);

    // Create bounty form state
    const [newBountyWordIndex, setNewBountyWordIndex] = useState("");
    const [newBountyAmount, setNewBountyAmount] = useState("");
    const [isCreatingBounty, setIsCreatingBounty] = useState(false);

    // Load bounties from blockchain
    useEffect(() => {
        loadBounties();
    }, []);

    const loadBounties = async () => {
        try {
            setIsLoading(true);

            // Get total words count
            const totalWordsResponse = await getTotalWordsCount();
            const total = totalWordsResponse?.value || 0;
            setTotalWords(total);

            // Load bounties for existing words
            const loadedBounties: Bounty[] = [];
            for (let i = 0; i < total; i++) {
                try {
                    const bountyData = await getBountyData(i);
                    if (bountyData?.value) {
                        const bounty = bountyData.value;
                        const isActive = bounty["is-active"]?.value || false;
                        const remainingBounty =
                            (bounty["remaining-bounty"]?.value || 0) / 1000000;

                        // Only include bounties that have been funded
                        if (bounty["total-bounty"]?.value > 0) {
                            loadedBounties.push({
                                id: `bounty-${i}`,
                                wordIndex: i,
                                totalBounty:
                                    (bounty["total-bounty"]?.value || 0) /
                                    1000000,
                                remainingBounty,
                                isActive: isActive && remainingBounty > 0,
                                createdBy:
                                    bounty["created-by"]?.value || "Unknown",
                                winnerCount: bounty["winner-count"]?.value || 0,
                                createdAt: new Date().toISOString(),
                                claimHistory: [], // Could fetch this separately if needed
                            });
                        }
                    }
                } catch (err) {
                    // No bounty for this word, skip
                }
            }

            setBounties(loadedBounties);
        } catch (error) {
            console.error("Error loading bounties:", error);
            Alert.alert("Error", "Failed to load bounties");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBountyPress = (bounty: Bounty) => {
        setSelectedBounty(bounty);
        setShowDetailModal(true);
    };

    const handleCreateBounty = async () => {
        const wordIndex = parseInt(newBountyWordIndex);
        const amount = parseFloat(newBountyAmount);

        if (isNaN(wordIndex) || wordIndex < 0 || wordIndex >= totalWords) {
            Alert.alert(
                "Invalid",
                `Word index must be between 0 and ${totalWords - 1}`
            );
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid", "Amount must be greater than 0");
            return;
        }

        try {
            setIsCreatingBounty(true);
            const amountInMicroSTX = Math.floor(amount * 1000000);
            const txId = await createBounty(wordIndex, amountInMicroSTX);

            if (txId) {
                Alert.alert("Success", "Bounty created successfully!");
                setShowCreateModal(false);
                setNewBountyWordIndex("");
                setNewBountyAmount("");

                // Reload bounties after a delay
                setTimeout(() => {
                    loadBounties();
                }, 3000);
            } else {
                Alert.alert("Error", "Failed to create bounty");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create bounty");
        } finally {
            setIsCreatingBounty(false);
        }
    };

    const activeBounties = bounties.filter((b) => b.isActive);
    const completedBounties = bounties.filter((b) => !b.isActive);

    return (
        <View className="flex-1 bg-darkBg">
            <Header
                title="Bounties"
                subtitle="Active reward pools"
                onBack={onBack}
                rightComponent={
                    <Pressable
                        onPress={() => setShowCreateModal(true)}
                        className="p-2"
                    >
                        <Ionicons name="add-circle" size={28} color="#16A349" />
                    </Pressable>
                }
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#16A349" />
                        <Text className="text-white text-lg mt-4">
                            Loading bounties...
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Info Banner */}
                        <View className="mx-4 mt-4 bg-primary/20 border border-primary/30 rounded-2xl p-4">
                            <View className="flex-row items-start">
                                <Ionicons
                                    name="information-circle"
                                    size={24}
                                    color="#16A349"
                                />
                                <View className="flex-1 ml-3">
                                    <Text className="text-white font-bold mb-1">
                                        How Bounties Work
                                    </Text>
                                    <Text className="text-gray-300 text-sm">
                                        Solve the word and win 10% of the
                                        remaining bounty pool. The faster you
                                        solve, the bigger your share!
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Active Bounties */}
                        <View className="px-4 mt-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-white text-xl font-bold">
                                    Active Bounties
                                </Text>
                                <View className="bg-primary/20 px-3 py-1 rounded-full">
                                    <Text className="text-primary text-xs font-bold">
                                        {activeBounties.length} Active
                                    </Text>
                                </View>
                            </View>

                            {activeBounties.map((bounty) => (
                                <BountyCard
                                    key={bounty.id}
                                    bounty={bounty}
                                    onPress={() => handleBountyPress(bounty)}
                                />
                            ))}

                            {activeBounties.length === 0 && (
                                <View className="bg-gray-800 rounded-2xl p-8 items-center">
                                    <Ionicons
                                        name="trophy-outline"
                                        size={48}
                                        color="#6B7280"
                                    />
                                    <Text className="text-gray-400 text-center mt-4">
                                        No active bounties at the moment
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Completed Bounties */}
                        {completedBounties.length > 0 && (
                            <View className="px-4 mt-6">
                                <Text className="text-white text-xl font-bold mb-3">
                                    Completed
                                </Text>
                                {completedBounties.map((bounty) => (
                                    <BountyCard
                                        key={bounty.id}
                                        bounty={bounty}
                                        onPress={() =>
                                            handleBountyPress(bounty)
                                        }
                                    />
                                ))}
                            </View>
                        )}

                        {/* Create Bounty CTA */}
                        <View className="px-4 mt-6">
                            <Pressable
                                onPress={() => setShowCreateModal(true)}
                                className="bg-gradient-to-r from-primary to-accent rounded-2xl p-6 items-center"
                            >
                                <Ionicons
                                    name="add-circle-outline"
                                    size={48}
                                    color="#fff"
                                />
                                <Text className="text-white text-xl font-bold mt-3">
                                    Create Bounty
                                </Text>
                                <Text className="text-white/80 text-sm mt-1 text-center">
                                    Add a bounty to upcoming words
                                </Text>
                            </Pressable>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Bounty Detail Modal */}
            <Modal
                visible={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={`Bounty Details`}
            >
                {selectedBounty && (
                    <View className="py-2">
                        <View className="bg-gray-800 rounded-xl p-4 mb-4">
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-gray-400">
                                    Word Index
                                </Text>
                                <Text className="text-white font-bold">
                                    #{selectedBounty.wordIndex}
                                </Text>
                            </View>
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-gray-400">
                                    Total Bounty
                                </Text>
                                <Text className="text-white font-bold">
                                    {selectedBounty.totalBounty} STX
                                </Text>
                            </View>
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-gray-400">Remaining</Text>
                                <Text className="text-accent font-bold">
                                    {selectedBounty.remainingBounty} STX
                                </Text>
                            </View>
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-gray-400">Winners</Text>
                                <Text className="text-white font-bold">
                                    {selectedBounty.winnerCount}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-400">Status</Text>
                                <View
                                    className={`px-2 py-1 rounded ${
                                        selectedBounty.isActive
                                            ? "bg-primary"
                                            : "bg-gray-600"
                                    }`}
                                >
                                    <Text className="text-white text-xs font-bold">
                                        {selectedBounty.isActive
                                            ? "Active"
                                            : "Completed"}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Reward Calculation */}
                        <View className="bg-accent/20 rounded-xl p-4 mb-4">
                            <Text className="text-white font-bold mb-2">
                                Your Potential Reward
                            </Text>
                            <Text className="text-accent text-2xl font-bold mb-1">
                                {(selectedBounty.remainingBounty * 0.1).toFixed(
                                    1
                                )}{" "}
                                STX
                            </Text>
                            <Text className="text-gray-400 text-xs">
                                10% of remaining pool if you solve this word
                            </Text>
                        </View>

                        {/* Recent Claims */}
                        {selectedBounty.claimHistory.length > 0 && (
                            <View>
                                <Text className="text-white font-bold mb-2">
                                    Recent Claims
                                </Text>
                                {selectedBounty.claimHistory.map((claim) => (
                                    <View
                                        key={claim.id}
                                        className="bg-gray-800 rounded-lg p-3 mb-2 flex-row justify-between items-center"
                                    >
                                        <View>
                                            <Text className="text-white font-bold">
                                                {claim.username}
                                            </Text>
                                            <Text className="text-gray-400 text-xs">
                                                {claim.attempts} attempts
                                            </Text>
                                        </View>
                                        <Text className="text-accent font-bold">
                                            {claim.amount} STX
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <Text className="text-gray-500 text-xs text-center mt-4">
                            Solve the word to claim your reward automatically
                        </Text>
                    </View>
                )}
            </Modal>

            {/* Create Bounty Modal */}
            <Modal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create Bounty"
            >
                <View className="py-2">
                    <Text className="text-gray-400 text-sm mb-4 text-center">
                        Add a bounty reward pool for a specific word
                    </Text>

                    <View className="mb-4">
                        <Text className="text-white font-bold mb-2">
                            Word Index
                        </Text>
                        <TextInput
                            value={newBountyWordIndex}
                            onChangeText={setNewBountyWordIndex}
                            placeholder={`0 - ${totalWords - 1}`}
                            placeholderTextColor="#6B7280"
                            keyboardType="numeric"
                            className="bg-gray-800 text-white rounded-xl px-4 py-3"
                        />
                        <Text className="text-gray-500 text-xs mt-1">
                            Total words in pool: {totalWords}
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-white font-bold mb-2">
                            Amount (STX)
                        </Text>
                        <TextInput
                            value={newBountyAmount}
                            onChangeText={setNewBountyAmount}
                            placeholder="e.g., 10.0"
                            placeholderTextColor="#6B7280"
                            keyboardType="decimal-pad"
                            className="bg-gray-800 text-white rounded-xl px-4 py-3"
                        />
                        <Text className="text-gray-500 text-xs mt-1">
                            Winners will receive 10% of remaining pool
                        </Text>
                    </View>

                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={() => setShowCreateModal(false)}
                            disabled={isCreatingBounty}
                            className="flex-1 bg-gray-700 rounded-xl py-3 items-center"
                        >
                            <Text className="text-white font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleCreateBounty}
                            disabled={
                                isCreatingBounty ||
                                !newBountyWordIndex ||
                                !newBountyAmount
                            }
                            className={`flex-1 rounded-xl py-3 items-center ${
                                isCreatingBounty ||
                                !newBountyWordIndex ||
                                !newBountyAmount
                                    ? "bg-gray-600 opacity-50"
                                    : "bg-primary"
                            }`}
                        >
                            {isCreatingBounty ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-bold">
                                    Create
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default BountiesScreen;
