import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Bounty } from "@/mocks";

interface BountyCardProps {
    bounty: Bounty;
    onPress?: () => void;
}

const BountyCard: React.FC<BountyCardProps> = ({ bounty, onPress }) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withTiming(0.98, { duration: 50 });
    };

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 100 });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const progressPercentage =
        (bounty.remainingBounty / bounty.totalBounty) * 100;

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="bg-gray-800 rounded-2xl p-4 mb-3"
                accessibilityLabel={`Bounty for word ${bounty.wordIndex}`}
                accessibilityRole="button"
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View>
                        <Text className="text-white text-lg font-bold">
                            Word #{bounty.wordIndex}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                            by {bounty.createdBy}
                        </Text>
                    </View>
                    {bounty.isActive ? (
                        <View className="bg-primary px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">
                                Active
                            </Text>
                        </View>
                    ) : (
                        <View className="bg-gray-600 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">
                                Completed
                            </Text>
                        </View>
                    )}
                </View>

                <View className="mb-3">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-gray-400 text-xs">
                            Total Bounty
                        </Text>
                        <Text className="text-white text-sm font-bold">
                            {bounty.totalBounty} STX
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-xs">Remaining</Text>
                        <Text className="text-accent text-sm font-bold">
                            {bounty.remainingBounty} STX
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                    <Animated.View
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </View>

                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <Ionicons name="people" size={16} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs ml-1">
                            {bounty.winnerCount} winners
                        </Text>
                    </View>
                    {bounty.isActive && (
                        <View className="flex-row items-center">
                            <Text className="text-primary text-xs font-bold mr-1">
                                View Details
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color="#16A349"
                            />
                        </View>
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

export default BountyCard;
