import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    value: string | number;
    label: string;
    iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    value,
    label,
    iconColor = "#16A349",
}) => {
    return (
        <View className="bg-gray-800 rounded-2xl p-4 items-center justify-center min-w-[100px]">
            <Ionicons name={icon} size={24} color={iconColor} />
            <Text className="text-white text-3xl font-bold mt-2">{value}</Text>
            <Text className="text-gray-400 text-xs mt-1 text-center">
                {label}
            </Text>
        </View>
    );
};

export default StatCard;
