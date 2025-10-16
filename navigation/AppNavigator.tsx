/**
 * AppNavigator.tsx
 *
 * Main navigation for TweetRush with top tabs
 * Tabs: Home, Play, Bounties, Leaderboard, Profile, Words
 */

import TopTabs from "@/components/TopTabs";
import AdminScreen from "@/screens/AdminScreen";
import BountiesScreen from "@/screens/BountiesScreen";
import HomeScreen from "@/screens/HomeScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import PlayScreen from "@/screens/PlayScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

export type TabName =
    | "home"
    | "play"
    | "bounties"
    | "leaderboard"
    | "profile"
    | "admin";

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
            case "admin":
                return <AdminScreen />;
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
