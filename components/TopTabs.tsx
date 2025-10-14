/**
 * TopTabs.tsx
 *
 * Custom top tab navigation component
 * Shows 5 tabs: Home, Play, Bounties, Leaderboard, Profile
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Animated, {
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { TabName } from "@/navigation/AppNavigator";

interface TopTabsProps {
    activeTab: TabName;
    onTabChange: (tab: TabName) => void;
}

const tabs = [
    { name: "home" as TabName, label: "Home", icon: "home" as const },
    {
        name: "play" as TabName,
        label: "Play",
        icon: "game-controller" as const,
    },
    { name: "bounties" as TabName, label: "Bounties", icon: "trophy" as const },
    {
        name: "leaderboard" as TabName,
        label: "Leaderboard",
        icon: "podium" as const,
    },
    { name: "profile" as TabName, label: "Profile", icon: "person" as const },
];

const TopTabs: React.FC<TopTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <View className="bg-darkBg border-b border-gray-800 pt-12 pb-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
            >
                {tabs.map((tab) => (
                    <Tab
                        key={tab.name}
                        name={tab.name}
                        label={tab.label}
                        icon={tab.icon}
                        isActive={activeTab === tab.name}
                        onPress={() => onTabChange(tab.name)}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

interface TabProps {
    name: TabName;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    isActive: boolean;
    onPress: () => void;
}

const Tab: React.FC<TabProps> = ({ label, icon, isActive, onPress }) => {
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isActive ? 1 : 0.6, { duration: 200 }),
            transform: [
                { scale: withTiming(isActive ? 1 : 0.95, { duration: 200 }) },
            ],
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={onPress}
                className={`flex-row items-center px-4 py-2.5 rounded-xl ${
                    isActive ? "bg-primary" : "bg-gray-800"
                }`}
                accessibilityLabel={`${label} tab`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={isActive ? "#fff" : "#9CA3AF"}
                />
                <Text
                    className={`ml-2 font-bold text-sm ${
                        isActive ? "text-white" : "text-gray-400"
                    }`}
                >
                    {label}
                </Text>
            </Pressable>
        </Animated.View>
    );
};

export default TopTabs;
