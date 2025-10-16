/**
 * ComponentShowcase.tsx
 *
 * A screen that showcases all TweetRush UI components in one place.
 * Useful for testing, design review, and component library documentation.
 */

import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Game Components
import Tile from "@/components/game/Tile";
import Keyboard from "@/components/game/Keyboard";
import Header from "@/components/game/Header";

// UI Components
import StatCard from "@/components/ui/StatCard";
import BountyCard from "@/components/ui/BountyCard";
import Modal from "@/components/ui/Modal";

import { mockBounties } from "@/mocks";

const ComponentShowcase: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <View className="flex-1 bg-darkBg">
            <Header
                title="Component Showcase"
                subtitle="All TweetRush UI components"
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Section: Tiles */}
                <Section title="Tiles">
                    <Text className="text-gray-400 text-sm mb-3">
                        Letter tiles in different states
                    </Text>
                    <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                        <Tile letter={null} state="empty" />
                        <Tile letter="A" state="filled" />
                        <Tile letter="B" state="correct" reveal={true} />
                        <Tile letter="C" state="present" reveal={true} />
                        <Tile letter="D" state="absent" reveal={true} />
                    </View>
                    <View className="mt-4 bg-gray-800 rounded-xl p-3">
                        <CodeSnippet code='<Tile letter="A" state="correct" reveal={true} />' />
                    </View>
                </Section>

                {/* Section: Keyboard */}
                <Section title="Keyboard">
                    <Text className="text-gray-400 text-sm mb-3">
                        On-screen keyboard with letter states
                    </Text>
                    <Keyboard
                        onKeyPress={(key) => console.log("Key pressed:", key)}
                        letterStates={{
                            A: "correct",
                            E: "present",
                            R: "absent",
                        }}
                    />
                    <View className="mt-4 bg-gray-800 rounded-xl p-3">
                        <CodeSnippet code="<Keyboard onKeyPress={handleKey} letterStates={states} />" />
                    </View>
                </Section>

                {/* Section: Stat Cards */}
                <Section title="Stat Cards">
                    <Text className="text-gray-400 text-sm mb-3">
                        Compact stat display cards
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12 }}
                    >
                        <StatCard
                            icon="game-controller"
                            value="45"
                            label="Games"
                            iconColor="#16A349"
                        />
                        <StatCard
                            icon="trophy"
                            value="38"
                            label="Wins"
                            iconColor="#F59E0B"
                        />
                        <StatCard
                            icon="flame"
                            value="7"
                            label="Streak"
                            iconColor="#EF4444"
                        />
                        <StatCard
                            icon="star"
                            value="4.2"
                            label="Rating"
                            iconColor="#8B5CF6"
                        />
                    </ScrollView>
                    <View className="mt-4 bg-gray-800 rounded-xl p-3">
                        <CodeSnippet code='<StatCard icon="trophy" value="38" label="Wins" />' />
                    </View>
                </Section>

                {/* Section: Bounty Card */}
                <Section title="Bounty Card">
                    <Text className="text-gray-400 text-sm mb-3">
                        Bounty information with progress bar
                    </Text>
                    <BountyCard
                        bounty={mockBounties[0]}
                        onPress={() => console.log("Bounty pressed")}
                    />
                    <View className="mt-2 bg-gray-800 rounded-xl p-3">
                        <CodeSnippet code="<BountyCard bounty={bountyData} onPress={handlePress} />" />
                    </View>
                </Section>

                {/* Section: Buttons */}
                <Section title="Buttons">
                    <Text className="text-gray-400 text-sm mb-3">
                        Primary, secondary, and danger buttons
                    </Text>

                    <Pressable className="bg-primary rounded-2xl py-4 mb-3 items-center">
                        <Text className="text-white text-lg font-bold">
                            Primary Button
                        </Text>
                    </Pressable>

                    <Pressable className="bg-transparent border-2 border-primary rounded-2xl py-4 mb-3 items-center">
                        <Text className="text-primary text-lg font-bold">
                            Secondary Button
                        </Text>
                    </Pressable>

                    <Pressable className="bg-red-600 rounded-2xl py-4 mb-3 items-center">
                        <Text className="text-white text-lg font-bold">
                            Danger Button
                        </Text>
                    </Pressable>

                    <View className="bg-gray-800 rounded-xl p-3">
                        <CodeSnippet code='<Pressable className="bg-primary rounded-2xl py-4">' />
                    </View>
                </Section>

                {/* Section: Modal */}
                <Section title="Modal">
                    <Text className="text-gray-400 text-sm mb-3">
                        Animated modal with backdrop
                    </Text>

                    <Pressable
                        onPress={() => setShowModal(true)}
                        className="bg-primary rounded-2xl py-4 items-center"
                    >
                        <Text className="text-white text-lg font-bold">
                            Show Modal
                        </Text>
                    </Pressable>

                    <View className="mt-4 bg-gray-800 rounded-xl p-3">
                        <CodeSnippet code='<Modal visible={show} onClose={() => setShow(false)} title="Title">' />
                    </View>
                </Section>

                {/* Section: Badges */}
                <Section title="Badges & Labels">
                    <Text className="text-gray-400 text-sm mb-3">
                        Status indicators and labels
                    </Text>

                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                        <View className="bg-primary px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">
                                Active
                            </Text>
                        </View>
                        <View className="bg-accent px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">
                                Featured
                            </Text>
                        </View>
                        <View className="bg-gray-600 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">
                                Completed
                            </Text>
                        </View>
                        <View className="bg-red-600 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">
                                Error
                            </Text>
                        </View>
                    </View>

                    <View className="mt-4 bg-gray-800 rounded-xl p-3">
                        <CodeSnippet code='<View className="bg-primary px-3 py-1 rounded-full">' />
                    </View>
                </Section>

                {/* Section: Icons */}
                <Section title="Icons">
                    <Text className="text-gray-400 text-sm mb-3">
                        Common icons from Ionicons
                    </Text>

                    <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                        <IconDemo name="game-controller" label="Game" />
                        <IconDemo name="trophy" label="Trophy" />
                        <IconDemo name="flame" label="Streak" />
                        <IconDemo name="star" label="Star" />
                        <IconDemo name="people" label="People" />
                        <IconDemo name="wallet" label="Wallet" />
                        <IconDemo name="settings" label="Settings" />
                        <IconDemo name="help-circle" label="Help" />
                    </View>

                    <View className="mt-4 bg-gray-800 rounded-xl p-3">
                        <CodeSnippet code='<Ionicons name="trophy" size={24} color="#16A349" />' />
                    </View>
                </Section>

                {/* Section: Typography */}
                <Section title="Typography">
                    <Text className="text-gray-400 text-sm mb-3">
                        Text styles and hierarchy
                    </Text>

                    <View
                        className="bg-gray-800 rounded-2xl p-4"
                        style={{ gap: 12 }}
                    >
                        <Text className="text-white text-4xl font-bold">
                            Heading 1
                        </Text>
                        <Text className="text-white text-3xl font-bold">
                            Heading 2
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                            Heading 3
                        </Text>
                        <Text className="text-white text-xl font-bold">
                            Heading 4
                        </Text>
                        <Text className="text-white text-base">Body Text</Text>
                        <Text className="text-gray-400 text-sm">
                            Secondary Text
                        </Text>
                        <Text className="text-gray-500 text-xs">
                            Caption Text
                        </Text>
                    </View>
                </Section>

                {/* Section: Colors */}
                <Section title="Color Palette">
                    <Text className="text-gray-400 text-sm mb-3">
                        Brand and semantic colors
                    </Text>

                    <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                        <ColorSwatch color="#16A349" name="Primary" />
                        <ColorSwatch color="#F59E0B" name="Accent" />
                        <ColorSwatch color="#0B1220" name="Dark BG" />
                        <ColorSwatch color="#1F2937" name="Card BG" />
                        <ColorSwatch color="#EF4444" name="Error" />
                        <ColorSwatch color="#10B981" name="Success" />
                    </View>
                </Section>
            </ScrollView>

            {/* Example Modal */}
            <Modal
                visible={showModal}
                onClose={() => setShowModal(false)}
                title="Example Modal"
            >
                <Text className="text-gray-300 mb-4">
                    This is an example modal with animations and backdrop.
                </Text>
                <Pressable
                    onPress={() => setShowModal(false)}
                    className="bg-primary rounded-xl py-3 items-center"
                >
                    <Text className="text-white font-bold">Close Modal</Text>
                </Pressable>
            </Modal>
        </View>
    );
};

// Helper Components

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => {
    return (
        <View className="px-4 mt-6">
            <Text className="text-white text-2xl font-bold mb-3">{title}</Text>
            {children}
        </View>
    );
};

const CodeSnippet: React.FC<{ code: string }> = ({ code }) => {
    return <Text className="text-primary text-xs font-mono">{code}</Text>;
};

const IconDemo: React.FC<{
    name: keyof typeof Ionicons.glyphMap;
    label: string;
}> = ({ name, label }) => {
    return (
        <View className="items-center" style={{ width: 60 }}>
            <View className="w-12 h-12 bg-gray-800 rounded-xl items-center justify-center mb-1">
                <Ionicons name={name} size={24} color="#16A349" />
            </View>
            <Text className="text-gray-400 text-xs text-center">{label}</Text>
        </View>
    );
};

const ColorSwatch: React.FC<{ color: string; name: string }> = ({
    color,
    name,
}) => {
    return (
        <View className="items-center">
            <View
                style={{ backgroundColor: color }}
                className="w-16 h-16 rounded-xl mb-1 border border-gray-700"
            />
            <Text className="text-gray-400 text-xs">{name}</Text>
            <Text className="text-gray-500 text-xs font-mono">{color}</Text>
        </View>
    );
};

export default ComponentShowcase;
