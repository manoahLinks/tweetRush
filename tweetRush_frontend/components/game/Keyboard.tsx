import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { KEYBOARD_ROWS, LetterState } from "@/mocks";

interface KeyboardProps {
    onKeyPress: (key: string) => void;
    letterStates?: Record<string, LetterState>;
    disabled?: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({
    onKeyPress,
    letterStates = {},
    disabled = false,
}) => {
    return (
        <View className="w-full px-2 pb-4">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
                <View
                    key={rowIndex}
                    className="flex-row justify-center mb-2"
                    style={{ gap: 4 }}
                >
                    {row.map((key) => (
                        <Key
                            key={key}
                            letter={key}
                            state={letterStates[key] || "default"}
                            onPress={() => !disabled && onKeyPress(key)}
                            disabled={disabled}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
};

interface KeyProps {
    letter: string;
    state: LetterState;
    onPress: () => void;
    disabled: boolean;
}

const Key: React.FC<KeyProps> = ({ letter, state, onPress, disabled }) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        if (!disabled) {
            scale.value = withTiming(0.96, { duration: 50 });
        }
    };

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 100 });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const getBackgroundColor = () => {
        switch (state) {
            case "correct":
                return "bg-tileCorrect";
            case "present":
                return "bg-tilePresent";
            case "absent":
                return "bg-gray-600";
            default:
                return "bg-gray-500";
        }
    };

    const isSpecialKey = letter === "ENTER" || letter === "⌫";
    const keyWidth = isSpecialKey ? "px-4" : "w-8";

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                className={`${keyWidth} h-12 rounded-md justify-center items-center ${getBackgroundColor()} ${
                    disabled ? "opacity-50" : ""
                }`}
                accessibilityLabel={`Key ${letter}`}
                accessibilityRole="button"
            >
                <Text
                    className={`text-white font-bold ${
                        isSpecialKey ? "text-xs" : "text-lg"
                    }`}
                >
                    {letter}
                </Text>
            </Pressable>
        </Animated.View>
    );
};

export default Keyboard;
