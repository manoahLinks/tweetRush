import React, { useEffect } from "react";
import {
    View,
    Text,
    Pressable,
    Modal as RNModal,
    StyleSheet,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
}) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 200 });
            translateY.value = withSpring(0, {
                damping: 15,
                stiffness: 150,
            });
        } else {
            opacity.value = withTiming(0, { duration: 150 });
            translateY.value = withTiming(50, { duration: 150 });
        }
    }, [visible]);

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const modalStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <RNModal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View
                className="flex-1 justify-center items-center px-4"
                style={styles.container}
            >
                <Animated.View
                    style={[StyleSheet.absoluteFill, backdropStyle]}
                    className="bg-black/70"
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={onClose}
                        accessibilityLabel="Close modal"
                    />
                </Animated.View>

                <Animated.View
                    style={modalStyle}
                    className="bg-gray-900 rounded-2xl w-full max-w-md p-6"
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-2xl font-bold">
                            {title}
                        </Text>
                        {showCloseButton && (
                            <Pressable
                                onPress={onClose}
                                className="p-2"
                                accessibilityLabel="Close"
                                accessibilityRole="button"
                            >
                                <Ionicons name="close" size={24} color="#fff" />
                            </Pressable>
                        )}
                    </View>

                    {children}
                </Animated.View>
            </View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
});

export default Modal;
