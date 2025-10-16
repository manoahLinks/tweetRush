import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    onBack,
    rightComponent,
}) => {
    return (
        <View className="flex-row items-center justify-between px-4 py-3 bg-darkBg border-b border-gray-800">
            <View className="flex-row items-center flex-1">
                {onBack && (
                    <Pressable
                        onPress={onBack}
                        className="mr-3 p-2"
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </Pressable>
                )}
                <View className="flex-1">
                    <Text className="text-white text-xl font-bold">
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-gray-400 text-sm mt-0.5">
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            {rightComponent && <View className="ml-2">{rightComponent}</View>}
        </View>
    );
};

export default Header;
