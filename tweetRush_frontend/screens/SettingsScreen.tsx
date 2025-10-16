import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/game/Header";
import Modal from "@/components/ui/Modal";

interface SettingsScreenProps {
    onBack?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const [darkMode, setDarkMode] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [hapticFeedback, setHapticFeedback] = useState(true);
    const [notifications, setNotifications] = useState(false);
    const [showHowToPlay, setShowHowToPlay] = useState(false);

    return (
        <View className="flex-1 bg-darkBg">
            <Header
                title="Settings"
                subtitle="Preferences & Help"
                onBack={onBack}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Appearance */}
                <View className="px-4 mt-4">
                    <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">
                        Appearance
                    </Text>

                    <SettingRow
                        icon="moon"
                        title="Dark Mode"
                        subtitle="Use dark theme"
                        rightComponent={
                            <Switch
                                value={darkMode}
                                onValueChange={setDarkMode}
                                trackColor={{
                                    false: "#4B5563",
                                    true: "#16A349",
                                }}
                                thumbColor="#fff"
                            />
                        }
                    />
                </View>

                {/* Sound & Haptics */}
                <View className="px-4 mt-6">
                    <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">
                        Sound & Haptics
                    </Text>

                    <SettingRow
                        icon="volume-high"
                        title="Sound Effects"
                        subtitle="Play sounds when typing and winning"
                        rightComponent={
                            <Switch
                                value={soundEnabled}
                                onValueChange={setSoundEnabled}
                                trackColor={{
                                    false: "#4B5563",
                                    true: "#16A349",
                                }}
                                thumbColor="#fff"
                            />
                        }
                    />

                    <SettingRow
                        icon="phone-portrait"
                        title="Haptic Feedback"
                        subtitle="Vibration on key press"
                        rightComponent={
                            <Switch
                                value={hapticFeedback}
                                onValueChange={setHapticFeedback}
                                trackColor={{
                                    false: "#4B5563",
                                    true: "#16A349",
                                }}
                                thumbColor="#fff"
                            />
                        }
                    />
                </View>

                {/* Notifications */}
                <View className="px-4 mt-6">
                    <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">
                        Notifications
                    </Text>

                    <SettingRow
                        icon="notifications"
                        title="Daily Reminders"
                        subtitle="Get notified about new words"
                        rightComponent={
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{
                                    false: "#4B5563",
                                    true: "#16A349",
                                }}
                                thumbColor="#fff"
                            />
                        }
                    />
                </View>

                {/* Accessibility */}
                <View className="px-4 mt-6">
                    <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">
                        Accessibility
                    </Text>

                    <SettingButton
                        icon="color-palette"
                        title="High Contrast Colors"
                        subtitle="Easier to distinguish tile colors"
                        onPress={() => {}}
                    />

                    <SettingButton
                        icon="text"
                        title="Font Size"
                        subtitle="Adjust text size"
                        onPress={() => {}}
                    />
                </View>

                {/* Help & Info */}
                <View className="px-4 mt-6">
                    <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">
                        Help & Info
                    </Text>

                    <SettingButton
                        icon="help-circle"
                        title="How to Play"
                        subtitle="Learn the rules"
                        onPress={() => setShowHowToPlay(true)}
                        showChevron
                    />

                    <SettingButton
                        icon="document-text"
                        title="Terms of Service"
                        onPress={() => {}}
                        showChevron
                    />

                    <SettingButton
                        icon="shield-checkmark"
                        title="Privacy Policy"
                        onPress={() => {}}
                        showChevron
                    />

                    <SettingButton
                        icon="mail"
                        title="Contact Support"
                        subtitle="Get help with issues"
                        onPress={() => {}}
                        showChevron
                    />
                </View>

                {/* About */}
                <View className="px-4 mt-6 mb-6">
                    <Text className="text-gray-400 text-xs font-bold mb-2 uppercase">
                        About
                    </Text>

                    <View className="bg-gray-800 rounded-2xl p-4 items-center">
                        <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-3">
                            <Ionicons
                                name="game-controller"
                                size={32}
                                color="#fff"
                            />
                        </View>
                        <Text className="text-white text-xl font-bold mb-1">
                            TweetRush
                        </Text>
                        <Text className="text-gray-400 text-sm mb-1">
                            Version 1.0.0
                        </Text>
                        <Text className="text-gray-500 text-xs text-center mt-2">
                            A web3 word puzzle game on Starknet
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* How to Play Modal */}
            <Modal
                visible={showHowToPlay}
                onClose={() => setShowHowToPlay(false)}
                title="How to Play"
            >
                <ScrollView className="max-h-96">
                    <View className="py-2">
                        <Text className="text-gray-300 text-sm mb-4">
                            Guess the 5-letter word in 6 tries or less.
                        </Text>

                        <View className="mb-4">
                            <Text className="text-white font-bold mb-2">
                                Rules:
                            </Text>
                            <BulletPoint text="Each guess must be a valid 5-letter word" />
                            <BulletPoint text="After each guess, tiles change color to show how close you are" />
                        </View>

                        <View className="mb-4">
                            <Text className="text-white font-bold mb-2">
                                Tile Colors:
                            </Text>

                            <View className="flex-row items-center mb-2">
                                <View className="w-8 h-8 bg-tileCorrect rounded mr-3" />
                                <Text className="text-gray-300 text-sm flex-1">
                                    <Text className="text-white font-bold">
                                        Green:
                                    </Text>{" "}
                                    Letter is in the word and in the correct
                                    position
                                </Text>
                            </View>

                            <View className="flex-row items-center mb-2">
                                <View className="w-8 h-8 bg-tilePresent rounded mr-3" />
                                <Text className="text-gray-300 text-sm flex-1">
                                    <Text className="text-white font-bold">
                                        Amber:
                                    </Text>{" "}
                                    Letter is in the word but wrong position
                                </Text>
                            </View>

                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-tileAbsent rounded mr-3" />
                                <Text className="text-gray-300 text-sm flex-1">
                                    <Text className="text-white font-bold">
                                        Gray:
                                    </Text>{" "}
                                    Letter is not in the word
                                </Text>
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-white font-bold mb-2">
                                Bounties:
                            </Text>
                            <BulletPoint text="Some words have bounty pools attached" />
                            <BulletPoint text="Solve the word to win 10% of the remaining pool" />
                            <BulletPoint text="Connect your wallet to claim rewards" />
                        </View>

                        <View className="bg-primary/20 rounded-xl p-3">
                            <Text className="text-primary text-sm text-center font-bold">
                                New word every day at midnight UTC!
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
};

interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    rightComponent: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({
    icon,
    title,
    subtitle,
    rightComponent,
}) => {
    return (
        <View className="bg-gray-800 rounded-2xl p-4 mb-2 flex-row items-center">
            <View className="w-10 h-10 bg-gray-700 rounded-xl items-center justify-center mr-3">
                <Ionicons name={icon} size={20} color="#16A349" />
            </View>
            <View className="flex-1">
                <Text className="text-white font-bold">{title}</Text>
                {subtitle && (
                    <Text className="text-gray-400 text-xs mt-0.5">
                        {subtitle}
                    </Text>
                )}
            </View>
            {rightComponent}
        </View>
    );
};

interface SettingButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
}

const SettingButton: React.FC<SettingButtonProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    showChevron = false,
}) => {
    return (
        <Pressable
            onPress={onPress}
            className="bg-gray-800 rounded-2xl p-4 mb-2 flex-row items-center active:opacity-90"
        >
            <View className="w-10 h-10 bg-gray-700 rounded-xl items-center justify-center mr-3">
                <Ionicons name={icon} size={20} color="#16A349" />
            </View>
            <View className="flex-1">
                <Text className="text-white font-bold">{title}</Text>
                {subtitle && (
                    <Text className="text-gray-400 text-xs mt-0.5">
                        {subtitle}
                    </Text>
                )}
            </View>
            {showChevron && (
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            )}
        </Pressable>
    );
};

const BulletPoint: React.FC<{ text: string }> = ({ text }) => {
    return (
        <View className="flex-row mb-2">
            <Text className="text-primary mr-2">•</Text>
            <Text className="text-gray-300 text-sm flex-1">{text}</Text>
        </View>
    );
};

export default SettingsScreen;
