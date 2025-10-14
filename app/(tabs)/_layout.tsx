import { Tabs } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#16A349",
                tabBarInactiveTintColor: "#9CA3AF",
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: "#0B1220",
                    borderTopColor: "#1F2937",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "TweetRush",
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="game-controller"
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "Components",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="apps" size={28} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
