import Header from "@/components/game/Header";
import StatCard from "@/components/ui/StatCard";
import STXBalance from "@/components/ui/STXBalance";
import { stacksConfig } from "@/config/stacks";
import { useUser } from "@/contexts/UserContext";
import { mockGameHistory, mockProfile } from "@/mocks";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

interface ProfileScreenProps {
    onBack?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
    const { user, logout } = useUser();
    const winPercentage = (
        (mockProfile.gamesWon / mockProfile.totalGames) *
        100
    ).toFixed(1);

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout? You'll need to complete onboarding again.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Logout", 
                    style: "destructive",
                    onPress: logout
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-darkBg">
            <Header
                title="Profile"
                subtitle={mockProfile.username}
                onBack={onBack}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Profile Header */}
                <View className="items-center py-8 bg-gray-900">
                    <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
                        <Text className="text-white text-5xl">
                            {mockProfile.avatar}
                        </Text>
                    </View>
                    <Text className="text-white text-2xl font-bold mb-1">
                        {mockProfile.username}
                    </Text>
                    <Text className="text-gray-400 text-sm mb-2">
                        {user?.walletAddress?.slice(0, 8)}...
                        {user?.walletAddress?.slice(-6)}
                    </Text>
                    
                    {/* STX Balance */}
                    <View className="mt-3">
                        <STXBalance size="lg" />
                        {stacksConfig.networkType === 'testnet' && (
                            <View className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg px-3 py-2 mt-2">
                                <Text className="text-yellow-400 text-xs font-semibold text-center">
                                    🧪 Testnet Mode - Using Test STX
                                </Text>
                            </View>
                        )}
                    </View>
                    
                    <View className="flex-row items-center mt-3">
                        <Ionicons name="calendar" size={14} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs ml-1">
                            Joined{" "}
                            {new Date(
                                mockProfile.registrationDate
                            ).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View className="px-4 mt-6">
                    <Text className="text-white text-xl font-bold mb-3">
                        Statistics
                    </Text>

                    <View className="flex-row mb-3" style={{ gap: 12 }}>
                        <View className="flex-1">
                            <StatCard
                                icon="game-controller"
                                value={mockProfile.totalGames}
                                label="Total Games"
                            />
                        </View>
                        <View className="flex-1">
                            <StatCard
                                icon="trophy"
                                value={mockProfile.gamesWon}
                                label="Games Won"
                                iconColor="#F59E0B"
                            />
                        </View>
                    </View>

                    <View className="flex-row mb-3" style={{ gap: 12 }}>
                        <View className="flex-1">
                            <StatCard
                                icon="flame"
                                value={mockProfile.currentStreak}
                                label="Current Streak"
                                iconColor="#EF4444"
                            />
                        </View>
                        <View className="flex-1">
                            <StatCard
                                icon="star"
                                value={mockProfile.maxStreak}
                                label="Max Streak"
                                iconColor="#8B5CF6"
                            />
                        </View>
                    </View>

                    <View className="flex-row mb-3" style={{ gap: 12 }}>
                        <View className="flex-1">
                            <StatCard
                                icon="stats-chart"
                                value={`${winPercentage}%`}
                                label="Win Rate"
                                iconColor="#10B981"
                            />
                        </View>
                        <View className="flex-1">
                            <StatCard
                                icon="timer"
                                value={mockProfile.averageAttempts.toFixed(1)}
                                label="Avg Attempts"
                                iconColor="#06B6D4"
                            />
                        </View>
                    </View>
                </View>

                {/* Game History */}
                <View className="px-4 mt-6">
                    <Text className="text-white text-xl font-bold mb-3">
                        Recent Games
                    </Text>

                    {mockGameHistory.map((game) => (
                        <View
                            key={game.id}
                            className="bg-gray-800 rounded-2xl p-4 mb-3 flex-row items-center"
                        >
                            <View
                                className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                                    game.won ? "bg-primary/20" : "bg-red-900/20"
                                }`}
                            >
                                <Ionicons
                                    name={
                                        game.won
                                            ? "checkmark-circle"
                                            : "close-circle"
                                    }
                                    size={28}
                                    color={game.won ? "#16A349" : "#EF4444"}
                                />
                            </View>

                            <View className="flex-1">
                                <View className="flex-row items-center mb-1">
                                    <Text className="text-white font-bold mr-2">
                                        Word #{game.wordIndex}
                                    </Text>
                                    {game.won && (
                                        <View className="bg-primary px-2 py-0.5 rounded">
                                            <Text className="text-white text-xs font-bold">
                                                Won
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-gray-400 text-sm">
                                    {game.won
                                        ? `Solved in ${game.attempts} attempts`
                                        : "Not solved"}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    {new Date(game.date).toLocaleDateString()}
                                </Text>
                            </View>

                            <View className="items-center">
                                <Text className="text-gray-400 text-xs mb-1">
                                    Word
                                </Text>
                                <Text className="text-white font-mono font-bold">
                                    {game.word}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View className="px-4 mt-6">
                    <Pressable className="bg-gray-800 rounded-2xl py-4 flex-row items-center justify-center mb-3">
                        <Ionicons
                            name="share-social"
                            size={20}
                            color="#16A349"
                        />
                        <Text className="text-white font-bold ml-2">
                            Share Profile
                        </Text>
                    </Pressable>

                    <Pressable 
                        onPress={handleLogout}
                        className="bg-red-600 rounded-2xl py-4 flex-row items-center justify-center"
                    >
                        <Ionicons
                            name="log-out"
                            size={20}
                            color="white"
                        />
                        <Text className="text-white font-bold ml-2">
                            Logout
                        </Text>
                    </Pressable>

                    <Pressable className="bg-gray-800 rounded-2xl py-4 flex-row items-center justify-center">
                        <Ionicons name="settings" size={20} color="#9CA3AF" />
                        <Text className="text-gray-400 font-bold ml-2">
                            Account Settings
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;
