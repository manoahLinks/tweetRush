/**
 * AppNavigator.tsx
 *
 * Main navigation for TweetRush with top tabs
 * Tabs: Home, Play, Bounties, Leaderboard, Profile
 */

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import TopTabs from "@/components/TopTabs";
import HomeScreen from "@/screens/HomeScreen";
import PlayScreen from "@/screens/PlayScreen";
import BountiesScreen from "@/screens/BountiesScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import ProfileScreen from "@/screens/ProfileScreen";

export type TabName = "home" | "play" | "bounties" | "leaderboard" | "profile";

const AppNavigator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>("home");

    const renderScreen = () => {
        switch (activeTab) {
            case "home":
                return (
                    <HomeScreen onNavigateToPlay={() => setActiveTab("play")} />
                );
            case "play":
                return <PlayScreen />;
            case "bounties":
                return <BountiesScreen />;
            case "leaderboard":
                return <LeaderboardScreen />;
            case "profile":
                return <ProfileScreen />;
            default:
                return (
                    <HomeScreen onNavigateToPlay={() => setActiveTab("play")} />
                );
        }
    };

    return (
        <View style={styles.container}>
            <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />
            {renderScreen()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1220",
    },
});

export default AppNavigator;
