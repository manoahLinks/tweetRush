/**
 * HomeScreen.tsx
 *
 * Main home screen with hero card, stats, shortcuts, and recent games
 * Props: onNavigateToPlay - callback to navigate to play screen
 * Mock data: Uses mockProfile, mockFreshGame, mockGameHistory from @/mocks
 */

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import { mockProfile, mockFreshGame, mockGameHistory } from "@/mocks";

interface HomeScreenProps {
    onNavigateToPlay: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToPlay }) => {
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const fadeAnim = useSharedValue(0);
    const slideAnim = useSharedValue(20);

    React.useEffect(() => {
        fadeAnim.value = withTiming(1, { duration: 600 });
        slideAnim.value = withSpring(0, { damping: 15 });
    }, []);

    const heroAnimatedStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [{ translateY: slideAnim.value }],
    }));

    const winPercentage = (
        (mockProfile.gamesWon / mockProfile.totalGames) *
        100
    ).toFixed(0);

    // Game state: 'new', 'active', or 'completed'
    const [gameState] = useState<"new" | "active" | "completed">("new"); // Mock: change to 'active' or 'completed' to see different states

    return (
        <View className="flex-1 bg-darkBg">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header */}
                <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
                    <View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
                        <Text className="text-white text-xl">
                            {mockProfile.avatar}
                        </Text>
                    </View>
                    <Text className="text-white text-2xl font-bold">
                        Tweetle
                    </Text>
                    <Pressable className="w-10 h-10 items-center justify-center">
                        <Ionicons
                            name="notifications"
                            size={24}
                            color="#9CA3AF"
                        />
                    </Pressable>
                </View>

                {/* Hero Card - Current Game */}
                <Animated.View style={heroAnimatedStyle} className="mx-4 mt-4">
                    {gameState === "new" && (
                        <HeroCardNew onStartGame={onNavigateToPlay} />
                    )}
                    {gameState === "active" && (
                        <HeroCardActive onResumeGame={onNavigateToPlay} />
                    )}
                    {gameState === "completed" && <HeroCardCompleted />}
                </Animated.View>

                {/* Quick Stats */}
                <View className="px-4 mt-6">
                    <Text className="text-white text-lg font-bold mb-3">
                        Your Stats
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12 }}
                    >
                        <StatCard
                            icon="game-controller"
                            value={mockProfile.totalGames}
                            label="Total Games"
                            iconColor="#16A349"
                        />
                        <StatCard
                            icon="trophy"
                            value={`${winPercentage}%`}
                            label="Win Rate"
                            iconColor="#F59E0B"
                        />
                        <StatCard
                            icon="flame"
                            value={mockProfile.currentStreak}
                            label="Streak"
                            iconColor="#EF4444"
                        />
                    </ScrollView>
                </View>

                {/* Shortcuts */}
                <View className="px-4 mt-6">
                    <Text className="text-white text-lg font-bold mb-3">
                        Quick Access
                    </Text>
                    <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                        <ShortcutButton
                            icon="game-controller"
                            label="Play"
                            onPress={onNavigateToPlay}
                        />
                        <ShortcutButton
                            icon="trophy"
                            label="Bounties"
                            onPress={() => {}}
                        />
                        <ShortcutButton
                            icon="podium"
                            label="Leaderboard"
                            onPress={() => {}}
                        />
                        <ShortcutButton
                            icon="people"
                            label="Friends"
                            onPress={() => {}}
                        />
                    </View>
                </View>

                {/* Recent Games */}
                <View className="px-4 mt-6">
                    <Text className="text-white text-lg font-bold mb-3">
                        Recent Games
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12 }}
                    >
                        {mockGameHistory.map((game) => (
                            <RecentGameCard key={game.id} game={game} />
                        ))}
                    </ScrollView>
                </View>

                {/* Footer CTAs */}
                <View className="px-4 mt-6">
                    <Pressable
                        onPress={() => setShowHowToPlay(true)}
                        className="bg-gray-800 rounded-xl py-4 items-center mb-3"
                    >
                        <Text className="text-white font-bold">
                            How to Play
                        </Text>
                    </Pressable>

                    <Pressable
                        disabled
                        className="bg-gray-700 rounded-xl py-4 items-center opacity-50"
                    >
                        <Text className="text-gray-400 font-bold">
                            Mock: Connect Wallet
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* How to Play Modal */}
            <Modal
                visible={showHowToPlay}
                onClose={() => setShowHowToPlay(false)}
                title="How to Play"
            >
                <View className="py-2">
                    <Text className="text-gray-300 text-sm mb-3">
                        Guess the 5-letter word in 6 tries or less!
                    </Text>
                    <View className="mb-3">
                        <Text className="text-white font-bold mb-1">
                            Color Guide:
                        </Text>
                        <View className="flex-row items-center mb-1">
                            <View className="w-6 h-6 bg-tileCorrect rounded mr-2" />
                            <Text className="text-gray-300 text-sm">
                                Green = Correct position
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-1">
                            <View className="w-6 h-6 bg-tilePresent rounded mr-2" />
                            <Text className="text-gray-300 text-sm">
                                Amber = Wrong position
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-6 h-6 bg-tileAbsent rounded mr-2" />
                            <Text className="text-gray-300 text-sm">
                                Gray = Not in word
                            </Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => setShowHowToPlay(false)}
                        className="bg-primary rounded-xl py-3 items-center"
                    >
                        <Text className="text-white font-bold">Got it!</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
};

// Hero Card Components for different states
const HeroCardNew: React.FC<{ onStartGame: () => void }> = ({
    onStartGame,
}) => (
    <View className="bg-gray-800 rounded-2xl p-6">
        <Text className="text-white text-2xl font-bold mb-2">
            Daily Challenge
        </Text>
        <Text className="text-gray-400 text-sm mb-4">
            Today's word is waiting for you!
        </Text>

        {/* Empty grid preview */}
        <View className="mb-4" style={{ gap: 4 }}>
            {[0, 1].map((row) => (
                <View key={row} className="flex-row" style={{ gap: 4 }}>
                    {[0, 1, 2, 3, 4].map((col) => (
                        <View
                            key={col}
                            className="w-10 h-10 bg-gray-700 rounded border border-gray-600"
                        />
                    ))}
                </View>
            ))}
        </View>

        <Pressable
            onPress={onStartGame}
            className="bg-primary rounded-xl py-4 items-center active:scale-95"
        >
            <Text className="text-white text-lg font-bold">
                Start Daily Challenge
            </Text>
        </Pressable>

        <Pressable
            onPress={onStartGame}
            className="bg-gray-700 rounded-xl py-3 items-center mt-2 active:scale-95"
        >
            <Text className="text-gray-300 text-sm font-bold">
                Play Quick Game
            </Text>
        </Pressable>
    </View>
);

const HeroCardActive: React.FC<{ onResumeGame: () => void }> = ({
    onResumeGame,
}) => (
    <View className="bg-gray-800 rounded-2xl p-6">
        <View className="flex-row justify-between items-start mb-3">
            <View>
                <Text className="text-white text-2xl font-bold">
                    Resume Game
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                    2/6 attempts used
                </Text>
            </View>
            <View className="bg-accent/20 px-3 py-1 rounded-full">
                <Text className="text-accent text-xs font-bold">
                    💰 150 STX
                </Text>
            </View>
        </View>

        {/* Grid preview with 2 filled rows */}
        <View className="mb-4" style={{ gap: 4 }}>
            <View className="flex-row" style={{ gap: 4 }}>
                <View className="w-10 h-10 bg-tileAbsent rounded items-center justify-center">
                    <Text className="text-white font-bold">S</Text>
                </View>
                <View className="w-10 h-10 bg-tilePresent rounded items-center justify-center">
                    <Text className="text-white font-bold">T</Text>
                </View>
                <View className="w-10 h-10 bg-tilePresent rounded items-center justify-center">
                    <Text className="text-white font-bold">A</Text>
                </View>
                <View className="w-10 h-10 bg-tileCorrect rounded items-center justify-center">
                    <Text className="text-white font-bold">R</Text>
                </View>
                <View className="w-10 h-10 bg-tileCorrect rounded items-center justify-center">
                    <Text className="text-white font-bold">T</Text>
                </View>
            </View>
            <View className="flex-row" style={{ gap: 4 }}>
                {[0, 1, 2, 3, 4].map((col) => (
                    <View
                        key={col}
                        className="w-10 h-10 bg-gray-700 rounded border border-gray-600"
                    />
                ))}
            </View>
        </View>

        <Pressable
            onPress={onResumeGame}
            className="bg-primary rounded-xl py-4 items-center active:scale-95"
        >
            <Text className="text-white text-lg font-bold">Resume Game</Text>
        </Pressable>
    </View>
);

const HeroCardCompleted: React.FC = () => (
    <View className="bg-gray-800 rounded-2xl p-6">
        <View className="items-center mb-4">
            <Text className="text-4xl mb-2">🎉</Text>
            <Text className="text-white text-2xl font-bold">Well Done!</Text>
            <Text className="text-gray-400 text-sm mt-1">
                Solved in 4 attempts
            </Text>
        </View>

        <Pressable className="bg-primary rounded-xl py-4 items-center active:scale-95 mb-2">
            <Text className="text-white text-lg font-bold">View Results</Text>
        </Pressable>

        <Pressable className="bg-gray-700 rounded-xl py-3 items-center active:scale-95">
            <View className="flex-row items-center">
                <Ionicons name="share-social" size={18} color="#fff" />
                <Text className="text-white text-sm font-bold ml-2">Share</Text>
            </View>
        </Pressable>
    </View>
);

const ShortcutButton: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
}> = ({ icon, label, onPress }) => (
    <Pressable
        onPress={onPress}
        className="flex-1 min-w-[100px] bg-gray-800 rounded-xl p-4 items-center active:scale-95"
    >
        <Ionicons name={icon} size={28} color="#16A349" />
        <Text className="text-white text-sm font-bold mt-2">{label}</Text>
    </Pressable>
);

const RecentGameCard: React.FC<{ game: any }> = ({ game }) => (
    <View className="bg-gray-800 rounded-xl p-4 w-40">
        <View className="flex-row items-center mb-2">
            <Ionicons
                name={game.won ? "checkmark-circle" : "close-circle"}
                size={20}
                color={game.won ? "#16A349" : "#EF4444"}
            />
            <Text className="text-white font-bold ml-2">#{game.wordIndex}</Text>
        </View>
        <Text className="text-gray-400 text-xs mb-1">
            {game.won ? `${game.attempts} attempts` : "Not solved"}
        </Text>
        <Text className="text-gray-500 text-xs">
            {new Date(game.date).toLocaleDateString()}
        </Text>
    </View>
);

export default HomeScreen;
