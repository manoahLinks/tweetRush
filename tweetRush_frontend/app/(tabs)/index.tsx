/**
 * TweetRush - Main App Entry
 * Shows onboarding if user hasn't completed setup, otherwise loads the main app
 */

import { useUser } from "@/contexts/UserContext";
import AppNavigator from "@/navigation/AppNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function App() {
    const { isOnboarded, isLoading, completeOnboarding } = useUser();

    if (isLoading) {
        return (
            <View className="flex-1 bg-darkBg justify-center items-center">
                <ActivityIndicator size="large" color="#16A349" />
            </View>
        );
    }

    if (!isOnboarded) {
        return (
            <OnboardingScreen
                onComplete={completeOnboarding}
            />
        );
    }

    return <AppNavigator />;
}
