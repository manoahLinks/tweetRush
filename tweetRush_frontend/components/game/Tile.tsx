import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
} from "react-native-reanimated";
import { TileState } from "@/mocks";

interface TileProps {
    letter: string | null;
    state: TileState;
    reveal?: boolean;
    index?: number;
}

const Tile: React.FC<TileProps> = ({
    letter,
    state,
    reveal = false,
    index = 0,
}) => {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (reveal && state !== "empty" && state !== "filled") {
            // Stagger animation based on index
            const delay = index * 100;

            setTimeout(() => {
                rotation.value = withSequence(
                    withTiming(90, { duration: 250, easing: Easing.ease }),
                    withTiming(0, { duration: 250, easing: Easing.ease })
                );

                scale.value = withSequence(
                    withTiming(1.05, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                );
            }, delay);
        }
    }, [reveal, state, index]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotateX: `${rotation.value}deg` },
                { scale: scale.value },
            ],
        };
    });

    const getBackgroundColor = () => {
        switch (state) {
            case "correct":
                return "bg-tileCorrect";
            case "present":
                return "bg-tilePresent";
            case "absent":
                return "bg-tileAbsent";
            case "filled":
                return "bg-gray-700 border-gray-500";
            default:
                return "bg-transparent border-gray-600";
        }
    };

    const getBorderClass = () => {
        if (state === "empty") return "border-2";
        if (state === "filled") return "border-2";
        return "";
    };

    return (
        <Animated.View
            style={[animatedStyle]}
            className={`w-14 h-14 justify-center items-center rounded-md ${getBackgroundColor()} ${getBorderClass()}`}
            accessibilityLabel={
                letter ? `Letter ${letter}, ${state}` : "Empty tile"
            }
            accessibilityRole="text"
        >
            <Text className="text-white text-3xl font-bold font-mono">
                {letter || ""}
            </Text>
        </Animated.View>
    );
};

export default Tile;
