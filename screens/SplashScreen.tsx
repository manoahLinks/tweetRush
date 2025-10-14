import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface SplashScreenProps {
    onGetStarted: () => void;
    onConnectWallet: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
    onGetStarted,
    onConnectWallet,
}) => {
    const logoScale = useSharedValue(0.8);
    const logoOpacity = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const floatY = useSharedValue(0);

    useEffect(() => {
        // Logo entrance animation
        logoOpacity.value = withTiming(1, { duration: 600 });
        logoScale.value = withSpring(1, {
            damping: 8,
            stiffness: 100,
        });

        // Content fade in
        setTimeout(() => {
            contentOpacity.value = withTiming(1, { duration: 800 });
        }, 300);

        // Subtle floating animation for logo
        floatY.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 2000 }),
                withTiming(0, { duration: 2000 })
            ),
            -1,
            false
        );
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: logoOpacity.value,
            transform: [
                { scale: logoScale.value },
                { translateY: floatY.value },
            ],
        };
    });

    const contentAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: contentOpacity.value,
        };
    });

    return (
        <View className="flex-1 bg-darkBg justify-center items-center px-6">
            {/* Logo/Brand */}
            <Animated.View
                style={logoAnimatedStyle}
                className="items-center mb-8"
            >
                <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center mb-4 shadow-lg">
                    <Ionicons name="game-controller" size={48} color="#fff" />
                </View>
                <Text className="text-white text-5xl font-bold">TweetRush</Text>
                <View className="flex-row items-center mt-2">
                    <View className="w-2 h-2 bg-primary rounded-full mr-2" />
                    <Text className="text-gray-400 text-base">
                        Play daily, win bounties
                    </Text>
                </View>
            </Animated.View>

            {/* Features */}
            <Animated.View
                style={contentAnimatedStyle}
                className="w-full mb-12"
            >
                <FeatureItem
                    icon="trophy"
                    title="Win Real Rewards"
                    description="Compete for STX bounties on each word"
                />
                <FeatureItem
                    icon="flame"
                    title="Daily Challenges"
                    description="New word puzzles every day"
                />
                <FeatureItem
                    icon="stats-chart"
                    title="Track Progress"
                    description="Build streaks and climb leaderboards"
                />
            </Animated.View>

            {/* CTAs */}
            <Animated.View style={contentAnimatedStyle} className="w-full">
                <Pressable
                    onPress={onGetStarted}
                    className="bg-primary rounded-2xl py-4 mb-3 items-center active:opacity-90"
                    accessibilityLabel="Get started"
                    accessibilityRole="button"
                >
                    <Text className="text-white text-lg font-bold">
                        Get Started
                    </Text>
                </Pressable>

                <Pressable
                    onPress={onConnectWallet}
                    className="bg-gray-800 border-2 border-primary rounded-2xl py-4 items-center flex-row justify-center active:opacity-90"
                    accessibilityLabel="Connect wallet"
                    accessibilityRole="button"
                >
                    <Ionicons name="wallet" size={20} color="#16A349" />
                    <Text className="text-primary text-lg font-bold ml-2">
                        Connect Wallet
                    </Text>
                </Pressable>

                <Text className="text-gray-500 text-xs text-center mt-4">
                    Mock: Wallet connection not implemented
                </Text>
            </Animated.View>
        </View>
    );
};

interface FeatureItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
    icon,
    title,
    description,
}) => {
    return (
        <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-gray-800 rounded-xl items-center justify-center mr-4">
                <Ionicons name={icon} size={24} color="#16A349" />
            </View>
            <View className="flex-1">
                <Text className="text-white text-base font-bold">{title}</Text>
                <Text className="text-gray-400 text-sm mt-0.5">
                    {description}
                </Text>
            </View>
        </View>
    );
};

export default SplashScreen;
