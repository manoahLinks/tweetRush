import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/game/Header";
import BountyCard from "@/components/ui/BountyCard";
import Modal from "@/components/ui/Modal";
import { mockBounties, Bounty } from "@/mocks";

interface BountiesScreenProps {
    onBack?: () => void;
}

const BountiesScreen: React.FC<BountiesScreenProps> = ({ onBack }) => {
    const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleBountyPress = (bounty: Bounty) => {
        setSelectedBounty(bounty);
        setShowDetailModal(true);
    };

    const activeBounties = mockBounties.filter((b) => b.isActive);
    const completedBounties = mockBounties.filter((b) => !b.isActive);

    return (
        <View className="flex-1 bg-darkBg">
            <Header
                title="Bounties"
                subtitle="Active reward pools"
                onBack={onBack}
                rightComponent={
                    <Pressable className="p-2">
                        <Ionicons name="add-circle" size={28} color="#16A349" />
                    </Pressable>
                }
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
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
                                Solve the word and win 10% of the remaining
                                bounty pool. The faster you solve, the bigger
                                your share!
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
                                onPress={() => handleBountyPress(bounty)}
                            />
                        ))}
                    </View>
                )}

                {/* Create Bounty CTA */}
                <View className="px-4 mt-6">
                    <Pressable className="bg-gradient-to-r from-primary to-accent rounded-2xl p-6 items-center">
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
                        <View className="bg-white/20 px-4 py-2 rounded-full mt-4">
                            <Text className="text-white text-xs">
                                Mock: Not implemented
                            </Text>
                        </View>
                    </Pressable>
                </View>
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

                        <Pressable
                            disabled
                            className="bg-gray-600 rounded-xl py-4 items-center mt-4 opacity-50"
                        >
                            <Text className="text-white font-bold">
                                Claim Reward (Mock)
                            </Text>
                        </Pressable>
                        <Text className="text-gray-500 text-xs text-center mt-2">
                            Solve the word to claim your reward
                        </Text>
                    </View>
                )}
            </Modal>
        </View>
    );
};

export default BountiesScreen;
