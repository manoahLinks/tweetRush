import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/game/Header";
import { mockLeaderboard } from "@/mocks";

interface LeaderboardScreenProps {
    onBack?: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
    const [filter, setFilter] = useState<"wins" | "streak">("wins");

    return (
        <View className="flex-1 bg-darkBg">
            <Header
                title="Leaderboard"
                subtitle="Top players"
                onBack={onBack}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Filter Tabs */}
                <View className="px-4 mt-4 mb-4">
                    <View className="bg-gray-800 rounded-2xl p-1 flex-row">
                        <Pressable
                            onPress={() => setFilter("wins")}
                            className={`flex-1 py-3 rounded-xl ${
                                filter === "wins" ? "bg-primary" : ""
                            }`}
                        >
                            <Text
                                className={`text-center font-bold ${
                                    filter === "wins"
                                        ? "text-white"
                                        : "text-gray-400"
                                }`}
                            >
                                Most Wins
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setFilter("streak")}
                            className={`flex-1 py-3 rounded-xl ${
                                filter === "streak" ? "bg-primary" : ""
                            }`}
                        >
                            <Text
                                className={`text-center font-bold ${
                                    filter === "streak"
                                        ? "text-white"
                                        : "text-gray-400"
                                }`}
                            >
                                Longest Streak
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Top 3 Podium */}
                <View className="px-4 mb-6">
                    <View
                        className="flex-row items-end justify-center"
                        style={{ gap: 8 }}
                    >
                        {/* 2nd Place */}
                        {mockLeaderboard[1] && (
                            <View className="flex-1 items-center">
                                <View className="w-16 h-16 bg-gray-700 rounded-full items-center justify-center mb-2 border-4 border-gray-500">
                                    <Text className="text-3xl">
                                        {mockLeaderboard[1].avatar}
                                    </Text>
                                </View>
                                <View className="w-8 h-8 bg-gray-500 rounded-full items-center justify-center mb-2">
                                    <Text className="text-white font-bold">
                                        2
                                    </Text>
                                </View>
                                <Text
                                    className="text-white font-bold text-sm text-center"
                                    numberOfLines={1}
                                >
                                    {mockLeaderboard[1].username}
                                </Text>
                                <Text className="text-accent font-bold text-lg">
                                    {filter === "wins"
                                        ? mockLeaderboard[1].gamesWon
                                        : mockLeaderboard[1].currentStreak}
                                </Text>
                            </View>
                        )}

                        {/* 1st Place */}
                        {mockLeaderboard[0] && (
                            <View className="flex-1 items-center -mt-6">
                                <View className="w-20 h-20 bg-yellow-500 rounded-full items-center justify-center mb-2 border-4 border-yellow-400 shadow-lg">
                                    <Text className="text-4xl">
                                        {mockLeaderboard[0].avatar}
                                    </Text>
                                </View>
                                <View className="w-10 h-10 bg-yellow-400 rounded-full items-center justify-center mb-2">
                                    <Ionicons
                                        name="trophy"
                                        size={20}
                                        color="#000"
                                    />
                                </View>
                                <Text
                                    className="text-white font-bold text-base text-center"
                                    numberOfLines={1}
                                >
                                    {mockLeaderboard[0].username}
                                </Text>
                                <Text className="text-yellow-400 font-bold text-2xl">
                                    {filter === "wins"
                                        ? mockLeaderboard[0].gamesWon
                                        : mockLeaderboard[0].currentStreak}
                                </Text>
                            </View>
                        )}

                        {/* 3rd Place */}
                        {mockLeaderboard[2] && (
                            <View className="flex-1 items-center">
                                <View className="w-16 h-16 bg-orange-900 rounded-full items-center justify-center mb-2 border-4 border-orange-700">
                                    <Text className="text-3xl">
                                        {mockLeaderboard[2].avatar}
                                    </Text>
                                </View>
                                <View className="w-8 h-8 bg-orange-700 rounded-full items-center justify-center mb-2">
                                    <Text className="text-white font-bold">
                                        3
                                    </Text>
                                </View>
                                <Text
                                    className="text-white font-bold text-sm text-center"
                                    numberOfLines={1}
                                >
                                    {mockLeaderboard[2].username}
                                </Text>
                                <Text className="text-accent font-bold text-lg">
                                    {filter === "wins"
                                        ? mockLeaderboard[2].gamesWon
                                        : mockLeaderboard[2].currentStreak}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Full Leaderboard List */}
                <View className="px-4">
                    <Text className="text-white text-lg font-bold mb-3">
                        All Players
                    </Text>

                    {mockLeaderboard.map((entry) => (
                        <View
                            key={entry.rank}
                            className={`rounded-2xl p-4 mb-2 flex-row items-center ${
                                entry.isCurrentUser
                                    ? "bg-primary/20 border-2 border-primary"
                                    : "bg-gray-800"
                            }`}
                        >
                            {/* Rank */}
                            <View className="w-10 items-center mr-3">
                                {entry.rank <= 3 ? (
                                    <View
                                        className={`w-8 h-8 rounded-full items-center justify-center ${
                                            entry.rank === 1
                                                ? "bg-yellow-400"
                                                : entry.rank === 2
                                                ? "bg-gray-500"
                                                : "bg-orange-700"
                                        }`}
                                    >
                                        {entry.rank === 1 ? (
                                            <Ionicons
                                                name="trophy"
                                                size={16}
                                                color="#000"
                                            />
                                        ) : (
                                            <Text className="text-white text-xs font-bold">
                                                {entry.rank}
                                            </Text>
                                        )}
                                    </View>
                                ) : (
                                    <Text className="text-gray-400 font-bold">
                                        {entry.rank}
                                    </Text>
                                )}
                            </View>

                            {/* Avatar */}
                            <View className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center mr-3">
                                <Text className="text-2xl">{entry.avatar}</Text>
                            </View>

                            {/* Info */}
                            <View className="flex-1">
                                <Text
                                    className={`font-bold ${
                                        entry.isCurrentUser
                                            ? "text-primary"
                                            : "text-white"
                                    }`}
                                >
                                    {entry.username}
                                    {entry.isCurrentUser && (
                                        <Text className="text-primary text-xs">
                                            {" "}
                                            (You)
                                        </Text>
                                    )}
                                </Text>
                                <Text className="text-gray-400 text-xs mt-0.5">
                                    {entry.totalGames} games played
                                </Text>
                            </View>

                            {/* Stats */}
                            <View className="items-end">
                                <View className="flex-row items-center mb-1">
                                    <Ionicons
                                        name={
                                            filter === "wins"
                                                ? "trophy"
                                                : "flame"
                                        }
                                        size={16}
                                        color="#F59E0B"
                                    />
                                    <Text className="text-white font-bold text-lg ml-1">
                                        {filter === "wins"
                                            ? entry.gamesWon
                                            : entry.currentStreak}
                                    </Text>
                                </View>
                                <Text className="text-gray-400 text-xs">
                                    {filter === "wins" ? "wins" : "streak"}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Info Footer */}
                <View className="px-4 mt-6">
                    <View className="bg-gray-800 rounded-2xl p-4">
                        <View className="flex-row items-start">
                            <Ionicons
                                name="information-circle-outline"
                                size={20}
                                color="#9CA3AF"
                            />
                            <Text className="text-gray-400 text-sm ml-2 flex-1">
                                Leaderboards update every hour. Keep playing to
                                climb the ranks!
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default LeaderboardScreen;
